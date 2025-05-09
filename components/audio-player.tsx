"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Repeat, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface AudioPlayerProps {
  audioSrc?: string
  className?: string
}

export function AudioPlayer({
  audioSrc = "https://audio.nostr.build/1b6fdfffa97558d65f2129e891077574f9bfe0ea63d3dced485b99a8135d663d.mp3",
  className,
}: AudioPlayerProps) {
  // Responsive state
  const isMobile = useIsMobile()

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(180) // Default to 3 minutes
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentAudioSrc, setCurrentAudioSrc] = useState(audioSrc)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // UI state
  const [isVolumeVisible, setIsVolumeVisible] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [isWaveformLoaded, setIsWaveformLoaded] = useState(false)

  // Visual effects state
  const [flickerState, setFlickerState] = useState(false)

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformRef = useRef<HTMLDivElement>(null)
  const volumeTrackRef = useRef<HTMLDivElement>(null)
  const flickerTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for custom audio URL in localStorage on mount
  useEffect(() => {
    const customAudio = localStorage.getItem("boldthings-custom-audio")
    if (customAudio) {
      console.log("Loading custom audio from localStorage:", customAudio)
      setCurrentAudioSrc(customAudio)
    }
  }, [])

  // Listen for custom audio update events
  useEffect(() => {
    const handleAudioUpdate = (event: CustomEvent) => {
      const { url } = event.detail
      console.log("Received audio update event with URL:", url)
      setCurrentAudioSrc(url)
      setAudioError(null) // Reset any previous errors
      setLoadAttempts(0) // Reset load attempts

      // Reset player state
      setCurrentTime(0)
      setIsPlaying(false)
      setIsWaveformLoaded(false)

      // Generate new waveform after a short delay
      setTimeout(() => {
        if (!isMobile) {
          generateWaveformData()
        }
      }, 500)
    }

    // Add event listener
    window.addEventListener("boldthings-audio-update", handleAudioUpdate as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("boldthings-audio-update", handleAudioUpdate as EventListener)
    }
  }, [isMobile])

  // Set up flicker effect on mount
  useEffect(() => {
    // Set up flicker effect
    setupFlickerEffect()

    // Fade in the player after a short delay
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true)
    }, 500)

    return () => {
      if (flickerTimerRef.current) {
        clearTimeout(flickerTimerRef.current)
      }
      clearTimeout(fadeInTimer)
    }
  }, [])

  // Load audio and get metadata
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log("Attempting to load audio from:", currentAudioSrc)
    setAudioError(null) // Reset error state when trying to load new audio
    setIsLoaded(false)

    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded successfully")
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Number.POSITIVE_INFINITY) {
        setDuration(audio.duration)
      }
      setIsLoaded(true)
      setAudioError(null) // Clear any previous errors

      // Only generate waveform on non-mobile devices
      if (!isMobile) {
        generateWaveformData()
      }
    }

    const handleCanPlayThrough = () => {
      console.log("Audio can play through")
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Number.POSITIVE_INFINITY) {
        setDuration(audio.duration)
      }
    }

    const handleError = (e: Event) => {
      const error = (e.target as HTMLAudioElement).error
      const errorMessage = error?.message || "Unknown error"
      console.error("Audio loading error:", errorMessage)
      setAudioError(errorMessage)

      // If we've tried less than 3 times, try again with a delay
      if (loadAttempts < 3 && currentAudioSrc.includes("/media/")) {
        console.log(`Retry attempt ${loadAttempts + 1} for loading audio...`)
        setLoadAttempts((prev) => prev + 1)

        // Try again after a delay
        setTimeout(
          () => {
            // Force reload by setting a dummy parameter
            const retrySrc = `${currentAudioSrc}?retry=${Date.now()}`
            console.log("Retrying with URL:", retrySrc)
            audio.src = retrySrc
            audio.load()
          },
          2000 * (loadAttempts + 1),
        ) // Increasing delay for each retry
      }
      // If we've tried 3 times or it's not a media URL, fall back to default
      else if (currentAudioSrc !== audioSrc) {
        console.log("Falling back to default audio after failed attempts")
        setCurrentAudioSrc(audioSrc)
        localStorage.removeItem("boldthings-custom-audio") // Clear the custom audio setting
        setLoadAttempts(0) // Reset load attempts for the default audio
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("error", handleError)

    // Start loading the audio
    audio.load()

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("error", handleError)
    }
  }, [currentAudioSrc, isMobile, loadAttempts, audioSrc])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || audioError) return

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
        setAudioError(error.message || "Failed to play audio")
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, audioError])

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

  // Handle audio end
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }

    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("ended", handleEnded)
    }
  }, [isLooping])

  // Generate waveform data from audio file
  const generateWaveformData = async () => {
    try {
      // If there's an error or we're using the default audio, use a fallback waveform
      if (audioError || currentAudioSrc === audioSrc) {
        console.log("Using fallback waveform data")
        const fallbackData = Array(80)
          .fill(0)
          .map(() => Math.random() * 0.5 + 0.1)
        setWaveformData(fallbackData)
        setIsWaveformLoaded(true)
        return
      }

      const response = await fetch(currentAudioSrc)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const channelData = audioBuffer.getChannelData(0)

      // Sample the audio data - more samples for thinner bars
      const samples = 80
      const blockSize = Math.floor(channelData.length / samples)
      const dataPoints: number[] = []

      for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i
        let sum = 0
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[blockStart + j])
        }
        dataPoints.push(sum / blockSize)
      }

      // Normalize the data
      const maxValue = Math.max(...dataPoints)
      const normalizedData = dataPoints.map((point) => point / maxValue)

      setWaveformData(normalizedData)

      // Set waveform as loaded with a slight delay to ensure smooth transition
      setTimeout(() => {
        setIsWaveformLoaded(true)
      }, 100)
    } catch (error) {
      console.error("Error generating waveform:", error)
      // If we can't load the waveform, create a simple placeholder
      const fallbackData = Array(80)
        .fill(0)
        .map(() => Math.random() * 0.5 + 0.1)
      setWaveformData(fallbackData)
      setIsWaveformLoaded(true)
    }
  }

  // Set up flicker effect
  const setupFlickerEffect = () => {
    const triggerFlicker = () => {
      if (Math.random() < 0.25) {
        setFlickerState(true)

        const flickerDuration = 50 + Math.random() * 150
        setTimeout(() => {
          setFlickerState(false)
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
    if (audioError) return // Don't allow seeking if there's an error

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
    if (audioError) return // Don't allow seeking if there's an error

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
  const handleVolumeTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = volumeTrackRef.current
    if (!track) return

    const rect = track.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const trackHeight = rect.height

    // Calculate volume (0 at bottom, 1 at top)
    const newVolume = 1 - Math.max(0, Math.min(1, clickY / trackHeight))
    setVolume(newVolume)
  }

  // Handle volume fader drag start
  const handleVolumeDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true)

    // Prevent text selection during drag
    e.preventDefault()
  }

  // Handle volume fader drag
  useEffect(() => {
    if (!isDraggingVolume) return

    const handleMouseMove = (e: MouseEvent) => {
      const track = volumeTrackRef.current
      if (!track) return

      const rect = track.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      const trackHeight = rect.height

      // Calculate volume (0 at bottom, 1 at top)
      const newVolume = 1 - Math.max(0, Math.min(1, mouseY / trackHeight))
      setVolume(newVolume)
    }

    const handleMouseUp = () => {
      setIsDraggingVolume(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingVolume])

  // Calculate playback progress
  const playbackProgress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Toggle play/pause
  const togglePlayPause = () => {
    if (audioError) return // Don't allow play if there's an error
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

  // Get track name from URL
  const getTrackName = () => {
    // If there's an error, show error state
    if (audioError) {
      return "Audio Error"
    }

    // If it's a custom uploaded track from Blossom
    if (currentAudioSrc.includes("/media/") || currentAudioSrc.includes("nostr.build")) {
      return "Custom Track"
    }
    // Default track name
    return "F4LC0N"
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-sm border-t border-retro-display/10",
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
                audioError
                  ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                  : isPlaying
                    ? "bg-retro-teal/20 text-retro-teal shadow-[0_0_8px_rgba(94,191,181,0.4)]"
                    : "bg-black/40 text-retro-display/60 hover:bg-black/60 hover:text-retro-display/80",
              )}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={!!audioError}
            >
              {audioError ? (
                <AlertCircle className="h-3 w-3" />
              ) : isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3 ml-0.5" />
              )}
            </button>

            <div className="ml-3">
              <div className={cn("text-xs font-medium truncate", audioError ? "text-red-400" : "text-retro-display")}>
                {getTrackName()}
              </div>
            </div>
          </div>

          {/* Middle: Waveform on desktop, Progress bar on mobile */}
          <div className="flex-1 mx-4 h-full flex items-center">
            {isMobile ? (
              /* Simple progress bar for mobile */
              <div
                className={cn(
                  "relative w-full h-1 bg-retro-display/20 rounded-full",
                  audioError ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                )}
                onClick={audioError ? undefined : handleProgressBarClick}
              >
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full",
                    audioError ? "bg-red-400/60" : "bg-retro-display/60",
                  )}
                  style={{ width: `${playbackProgress}%` }}
                ></div>
              </div>
            ) : (
              /* Waveform for desktop */
              <div
                ref={waveformRef}
                className={cn("relative w-full h-6", audioError ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
                onClick={audioError ? undefined : handleWaveformClick}
              >
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
                            audioError
                              ? isPlayed
                                ? "bg-red-400/80"
                                : "bg-red-400/30"
                              : isPlayed
                                ? "bg-retro-display/80"
                                : "bg-retro-display/30",
                          )}
                          style={{
                            height: `${height}px`,
                            boxShadow: isPlayed && !audioError ? "0 0 4px rgba(232, 227, 199, 0.7)" : "none",
                          }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Playhead - Only shown when waveform is loaded */}
                {isWaveformLoaded && playbackProgress > 0 && !audioError && (
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
                disabled={!!audioError}
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
                  "absolute bottom-full right-[-4px] mb-3 bg-black/80 backdrop-blur-sm",
                  "border border-retro-display/20 rounded-md shadow-lg",
                  "transform transition-all duration-300 origin-bottom-right",
                  isVolumeVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-2 scale-95 pointer-events-none",
                )}
                style={{
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.3), 0 0 5px rgba(94, 191, 181, 0.2)",
                  width: "32px", // Increased width for more padding
                  padding: "12px", // Even padding on all sides
                }}
              >
                <div className="flex flex-col items-center justify-between h-[120px]">
                  {/* Volume value display */}
                  <div className="font-space-mono text-[10px] text-retro-display/70">{Math.round(volume * 100)}%</div>

                  {/* Minimal fader */}
                  <div className="relative" style={{ width: "4px", height: "80px" }}>
                    {/* Fader track (just a thin line) */}
                    <div
                      ref={volumeTrackRef}
                      className="absolute inset-0 w-[2px] mx-auto bg-retro-display/30 rounded-full cursor-pointer"
                      onClick={handleVolumeTrackClick}
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
                        "absolute left-[-4px] right-[-4px] h-3 w-3 bg-retro-display/80 rounded-full cursor-grab",
                        "shadow-sm transition-all duration-100",
                        isDraggingVolume ? "cursor-grabbing" : "",
                      )}
                      style={{
                        bottom: `calc(${volume * 100}% - 6px)`,
                        boxShadow: "0 0 4px rgba(232, 227, 199, 0.3)",
                      }}
                      onMouseDown={handleVolumeDragStart}
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

      <audio ref={audioRef} src={currentAudioSrc} preload="auto" crossOrigin="anonymous" />
    </div>
  )
}
