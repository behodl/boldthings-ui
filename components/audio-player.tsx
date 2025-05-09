"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Volume2, VolumeX, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface AudioPlayerProps {
  audioSrc?: string
  className?: string
}

export function AudioPlayer({ audioSrc = "https://media.boldthin.gs/F4LC0N.mp3", className }: AudioPlayerProps) {
  // Responsive state
  const isMobile = useIsMobile()

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // UI state
  const [isVolumeVisible, setIsVolumeVisible] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [isWaveformLoaded, setIsWaveformLoaded] = useState(false)

  // Visual effects state
  const [flickerState, setFlickerState] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const volumeTrackRef = useRef<HTMLDivElement>(null)
  const flickerTimerRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)

  // Set up flicker effect on mount
  useEffect(() => {
    mountedRef.current = true

    // Set up flicker effect
    setupFlickerEffect()

    // Fade in the player after a short delay
    const fadeInTimer = setTimeout(() => {
      if (mountedRef.current) {
        setIsVisible(true)
      }
    }, 500)

    return () => {
      mountedRef.current = false

      if (flickerTimerRef.current) {
        clearTimeout(flickerTimerRef.current)
      }
      clearTimeout(fadeInTimer)
    }
  }, [])

  // Generate a placeholder waveform without fetching the audio file
  const generatePlaceholderWaveform = () => {
    // Create a visually interesting pattern that resembles audio
    const dataPoints: number[] = []
    const samples = 80

    // Create a more interesting pattern with some randomness but also structure
    for (let i = 0; i < samples; i++) {
      // Base amplitude varies with position (creates a shape)
      const position = i / samples
      const baseAmplitude = 0.3 + 0.4 * Math.sin(position * Math.PI * 2) // Sine wave pattern

      // Add some randomness
      const randomFactor = 0.3
      const randomValue = Math.random() * randomFactor

      // Combine base pattern with randomness
      const value = baseAmplitude + randomValue

      // Ensure value is between 0 and 1
      dataPoints.push(Math.min(1, Math.max(0, value)))
    }

    setWaveformData(dataPoints)

    // Set waveform as loaded with a slight delay to ensure smooth transition
    setTimeout(() => {
      if (mountedRef.current) {
        setIsWaveformLoaded(true)
      }
    }, 100)
  }

  // Initialize audio player
  useEffect(() => {
    // Generate placeholder waveform immediately
    generatePlaceholderWaveform()

    // Create a new audio element
    const audio = new Audio(audioSrc)
    audio.crossOrigin = "anonymous"
    audio.preload = "auto"

    // Store reference
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    // Clean up
    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioSrc])

  // Event handlers
  const handleLoadedMetadata = () => {
    if (!audioRef.current || !mountedRef.current) return

    console.log("Audio metadata loaded successfully")
    if (
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration) &&
      audioRef.current.duration !== Number.POSITIVE_INFINITY
    ) {
      setDuration(audioRef.current.duration)
    }
    setIsLoaded(true)
  }

  const handleCanPlayThrough = () => {
    if (!audioRef.current || !mountedRef.current) return

    console.log("Audio can play through")
    if (
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration) &&
      audioRef.current.duration !== Number.POSITIVE_INFINITY
    ) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current || !mountedRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleEnded = () => {
    if (!mountedRef.current) return

    if (!isLooping) {
      setIsPlaying(false)
      setCurrentTime(0)
      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }
  }

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error playing audio:", error)
          if (mountedRef.current) {
            setIsPlaying(false)
          }
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Handle volume change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  // Handle loop setting
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = isLooping
  }, [isLooping])

  // Set up flicker effect
  const setupFlickerEffect = () => {
    const triggerFlicker = () => {
      if (!mountedRef.current) return

      if (Math.random() < 0.25) {
        setFlickerState(true)

        const flickerDuration = 50 + Math.random() * 150
        setTimeout(() => {
          if (mountedRef.current) {
            setFlickerState(false)
          }
        }, flickerDuration)
      }

      const nextFlicker = 300 + Math.random() * 1200
      flickerTimerRef.current = setTimeout(triggerFlicker, nextFlicker)
    }

    // Start the effect
    flickerTimerRef.current = setTimeout(triggerFlicker, 1000)
  }

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle click on waveform
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const waveform = waveformRef.current
    if (!waveform || !audioRef.current) return

    const rect = waveform.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width

    // Set new time
    const newTime = clickPosition * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)

    // Start playing if paused
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  // Handle progress bar click (for mobile)
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = e.currentTarget
    if (!progressBar || !audioRef.current) return

    const rect = progressBar.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width

    // Set new time
    const newTime = clickPosition * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)

    // Start playing if paused
    if (!isPlaying) {
      setIsPlaying(true)
    }
  }

  // Handle volume fader interaction
  const handleVolumeTrackClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const track = volumeTrackRef.current
    if (!track) return

    // Get position whether it's a mouse or touch event
    const rect = track.getBoundingClientRect()
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    const clickY = clientY - rect.top
    const trackHeight = rect.height

    // Calculate volume (0 at bottom, 1 at top)
    const newVolume = 1 - Math.max(0, Math.min(1, clickY / trackHeight))
    setVolume(newVolume)
  }

  // Handle volume fader drag start
  const handleVolumeDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true)

    // Prevent text selection during drag
    e.preventDefault()
  }

  // Handle volume fader drag
  useEffect(() => {
    if (!isDraggingVolume) return

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const track = volumeTrackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const clientY = "touches" in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      const mouseY = clientY - rect.top
      const trackHeight = rect.height

      // Calculate volume (0 at bottom, 1 at top)
      const newVolume = 1 - Math.max(0, Math.min(1, mouseY / trackHeight))
      setVolume(newVolume)
    }

    const handleMouseUp = () => {
      setIsDraggingVolume(false)
    }

    // Add both mouse and touch event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleMouseMove, { passive: false })
    document.addEventListener("touchend", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleMouseMove)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDraggingVolume])

  // Calculate playback progress
  const playbackProgress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Toggle loop
  const toggleLoop = () => {
    setIsLooping(!isLooping)
  }

  // Toggle volume controls
  const toggleVolumeControls = () => {
    setIsVolumeVisible(!isVolumeVisible)
  }

  // Close volume controls when clicking outside
  useEffect(() => {
    if (!isVolumeVisible) return

    const handleClickOutside = (e: MouseEvent) => {
      const volumeButton = document.getElementById("volume-button")
      const volumeControls = document.getElementById("volume-controls")

      if (
        volumeButton &&
        volumeControls &&
        !volumeButton.contains(e.target as Node) &&
        !volumeControls.contains(e.target as Node)
      ) {
        setIsVolumeVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isVolumeVisible])

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-sm border-t border-retro-display/10",
        "h-10 transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      <div className="w-full h-full relative">
        <div className="relative z-10 flex items-center justify-between h-full px-4 md:px-6">
          {/* Left: Play button and track info */}
          <div className={cn("flex items-center", isMobile ? "w-1/3" : "w-1/4")}>
            <button
              onClick={togglePlayPause}
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full transition-all duration-500",
                isPlaying
                  ? "bg-retro-teal/20 text-retro-teal shadow-[0_0_8px_rgba(94,191,181,0.4)]"
                  : "bg-black/40 text-retro-display/60 hover:bg-black/60 hover:text-retro-display/80",
              )}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {/* Always show Play icon, regardless of state */}
              <Play className="h-3 w-3 ml-0.5" />
            </button>

            <div className="ml-3 flex items-center">
              <div className="text-xs font-medium text-retro-display truncate">F4LC0N</div>
            </div>
          </div>

          {/* Middle: Waveform on desktop, Progress bar on mobile */}
          <div className="flex-1 mx-4 h-full flex items-center">
            {isMobile ? (
              /* Simple progress bar for mobile */
              <div
                className="relative w-full h-1 bg-retro-display/20 rounded-full cursor-pointer"
                onClick={handleProgressBarClick}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-retro-display/60 rounded-full"
                  style={{ width: `${playbackProgress}%` }}
                ></div>
              </div>
            ) : (
              /* Waveform for desktop */
              <div ref={waveformRef} className="relative w-full h-6 cursor-pointer" onClick={handleWaveformClick}>
                {/* Waveform bars container - Only render when data is loaded */}
                <div
                  className={cn(
                    "absolute inset-0 flex items-center transition-opacity duration-700",
                    isWaveformLoaded ? "opacity-100" : "opacity-0",
                  )}
                >
                  {waveformData.map((value, index) => {
                    const height = Math.max(2, value * 18)
                    const isPlayed = (index / waveformData.length) * 100 <= playbackProgress

                    return (
                      <div
                        key={index}
                        className={cn("mx-[0.5px] h-full flex items-center", flickerState ? "waveform-glow" : "")}
                        style={{ flex: 1 }}
                      >
                        <div
                          className={cn(
                            "w-full transition-all duration-300",
                            isPlayed ? "bg-retro-display/80" : "bg-retro-display/30",
                          )}
                          style={{
                            height: `${height}px`,
                            boxShadow: isPlayed ? "0 0 4px rgba(232, 227, 199, 0.7)" : "none",
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Playhead - Only shown when waveform is loaded */}
                {isWaveformLoaded && playbackProgress > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-retro-teal/40 z-10 transition-all duration-300"
                    style={{
                      left: `${playbackProgress}%`,
                      boxShadow: "0 0 4px rgba(94, 191, 181, 0.3)",
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Right: Time and controls - Simplified on mobile */}
          <div className={cn("flex items-center justify-end", isMobile ? "w-1/3 space-x-2" : "w-1/4 space-x-3")}>
            {/* Time display - Always visible */}
            <div className="font-space-mono text-[10px] text-retro-display/80">
              <span>{formatTime(currentTime)}</span>
              {!isMobile && (
                <>
                  <span className="mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </>
              )}
            </div>

            {/* Loop button - Hidden on mobile */}
            {!isMobile && (
              <button
                onClick={toggleLoop}
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-500",
                  isLooping
                    ? "bg-retro-teal/20 text-retro-teal"
                    : "bg-transparent text-retro-display/60 hover:text-retro-display/80",
                )}
                aria-label={isLooping ? "Disable loop" : "Enable loop"}
              >
                <Repeat className="h-3 w-3" />
              </button>
            )}

            {/* Volume control */}
            <div className="relative">
              <button
                id="volume-button"
                onClick={toggleVolumeControls}
                className={cn(
                  "text-retro-display/80 hover:text-retro-display transition-all duration-300",
                  isVolumeVisible ? "text-retro-teal" : "",
                )}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </button>

              {/* Minimal volume fader popup - With even padding */}
              <div
                id="volume-controls"
                className={cn(
                  "absolute bottom-full mb-3 bg-black/80 backdrop-blur-sm",
                  "border border-retro-display/20 rounded-md shadow-lg",
                  "transform transition-all duration-300 origin-bottom-center",
                  isVolumeVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none",
                )}
                style={{
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.3), 0 0 5px rgba(94, 191, 181, 0.2)",
                  width: "40px", // Increased width for more padding and touch area
                  padding: "14px", // Even padding on all sides
                  left: "50%",
                  transform: `translateX(-50%) ${isVolumeVisible ? "translateY(0) scale(1)" : "translateY(2px) scale(0.95)"}`,
                }}
              >
                <div className="flex flex-col items-center justify-between h-[120px]">
                  {/* Volume value display */}
                  <div className="font-space-mono text-[10px] text-retro-display/70">{Math.round(volume * 100)}%</div>

                  {/* Minimal fader */}
                  <div className="relative" style={{ width: "8px", height: "80px" }}>
                    {/* Fader track (just a thin line) */}
                    <div
                      ref={volumeTrackRef}
                      className="absolute inset-0 w-[4px] mx-auto bg-retro-display/30 rounded-full cursor-pointer"
                      onClick={handleVolumeTrackClick}
                      onTouchStart={handleVolumeTrackClick}
                    >
                      {/* Filled portion - Reduced opacity */}
                      <div
                        className="absolute left-0 right-0 bottom-0 bg-retro-teal/30 rounded-full transition-height duration-100"
                        style={{ height: `${volume * 100}%` }}
                      ></div>
                    </div>

                    {/* Minimal fader handle */}
                    <div
                      className={cn(
                        "absolute left-[-6px] right-[-6px] h-5 w-5 bg-retro-display/80 rounded-full cursor-grab",
                        "shadow-sm transition-all duration-100",
                        isDraggingVolume ? "cursor-grabbing" : "",
                      )}
                      style={{
                        bottom: `calc(${volume * 100}% - 10px)`,
                        boxShadow: "0 0 4px rgba(232, 227, 199, 0.3)",
                      }}
                      onMouseDown={handleVolumeDragStart}
                      onTouchStart={handleVolumeDragStart}
                    ></div>
                  </div>

                  {/* Mute toggle */}
                  <button
                    onClick={toggleMute}
                    className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300",
                      isMuted
                        ? "bg-retro-teal/20 text-retro-teal"
                        : "bg-transparent text-retro-display/60 hover:text-retro-display/80",
                    )}
                  >
                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
