"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Repeat, AlertTriangle, RotateCw } from "lucide-react"
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
  const [duration, setDuration] = useState(180) // Default to 3 minutes
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

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
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
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

      // Clean up audio context if it exists
      if (audioContextRef.current) {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop()
        }
        audioContextRef.current.close().catch(console.error)
      }
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

  // Set up tone generator as fallback
  const setupToneGenerator = () => {
    try {
      console.log("Setting up tone generator as fallback")

      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const ctx = audioContextRef.current

      // Create oscillator and gain node
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      // Configure oscillator
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(440, ctx.currentTime) // A4 note

      // Configure gain (volume)
      gainNode.gain.setValueAtTime(0, ctx.currentTime) // Start silent

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Start oscillator
      oscillator.start()

      // Store references
      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode

      // Set as loaded
      if (mountedRef.current) {
        setIsLoaded(true)
        setDuration(180) // Default to 3 minutes for tone generator
        setUsingFallback(true)
        setAudioError("Using tone generator (audio format not supported)")
      }

      console.log("Tone generator ready")
    } catch (error) {
      console.error("Failed to set up tone generator:", error)
      if (mountedRef.current) {
        setAudioError("All audio playback methods failed")
      }
    }
  }

  // Play/pause the tone generator
  const controlToneGenerator = (play: boolean) => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    const ctx = audioContextRef.current
    const gainNode = gainNodeRef.current

    if (play) {
      // Fade in
      gainNode.gain.cancelScheduledValues(ctx.currentTime)
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
    } else {
      // Fade out
      gainNode.gain.cancelScheduledValues(ctx.currentTime)
      gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1)
    }
  }

  // Initialize audio player
  useEffect(() => {
    // Generate placeholder waveform immediately
    generatePlaceholderWaveform()

    // Create a new audio element
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.preload = "auto"

    // Store reference
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("canplaythrough", handleCanPlayThrough)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("error", handleError)
    audio.addEventListener("ended", handleEnded)

    // Try to load the audio
    loadAudio()

    // Clean up
    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("canplaythrough", handleCanPlayThrough)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioSrc])

  // Load audio with fallback
  const loadAudio = () => {
    if (!audioRef.current || !mountedRef.current) return

    console.log("Attempting to load audio from:", audioSrc)
    setAudioError(null)
    setUsingFallback(false)
    setIsLoaded(false)
    setIsRetrying(false)

    try {
      // Set source and load
      audioRef.current.src = audioSrc
      audioRef.current.load()

      // Set up a timeout to switch to tone generator if loading takes too long
      const timeoutId = setTimeout(() => {
        if (!isLoaded && mountedRef.current) {
          console.log("Audio loading timed out, using tone generator")
          setupToneGenerator()
        }
      }, 5000) // 5 second timeout

      return () => clearTimeout(timeoutId)
    } catch (e) {
      console.error("Error during audio loading:", e)
      setupToneGenerator()
    }
  }

  // Retry loading audio
  const retryAudio = () => {
    if (!mountedRef.current) return

    setIsRetrying(true)

    // Clean up existing audio context if using fallback
    if (usingFallback && audioContextRef.current) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
      }
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
      oscillatorRef.current = null
      gainNodeRef.current = null
    }

    // Reset state
    setIsPlaying(false)
    setCurrentTime(0)
    setAudioError(null)
    setUsingFallback(false)
    setIsLoaded(false)

    // Try loading with cache-busting parameter
    if (audioRef.current) {
      const cacheBuster = Date.now()
      const url = audioSrc.includes("?") ? `${audioSrc}&cb=${cacheBuster}` : `${audioSrc}?cb=${cacheBuster}`

      console.log("Retrying audio load with:", url)
      audioRef.current.src = url
      audioRef.current.load()

      // Set timeout to fall back to tone generator
      setTimeout(() => {
        if (!isLoaded && mountedRef.current) {
          console.log("Retry timed out, using tone generator")
          setupToneGenerator()
        }
        if (mountedRef.current) {
          setIsRetrying(false)
        }
      }, 5000)
    } else {
      setIsRetrying(false)
      setupToneGenerator()
    }
  }

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
    setAudioError(null)
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

  const handleError = (e: Event) => {
    if (!mountedRef.current) return

    const audio = e.target as HTMLAudioElement
    let errorMessage = "Unknown audio error"

    if (audio.error) {
      const errorCode = audio.error.code
      switch (errorCode) {
        case 1:
          errorMessage = "Audio loading aborted"
          break
        case 2:
          errorMessage = "Network error while loading audio"
          break
        case 3:
          errorMessage = "Audio format not supported"
          break
        case 4:
          errorMessage = "Audio not supported"
          break
      }
    }

    console.error("Audio loading error:", e, audio.error)
    setAudioError(errorMessage)

    // For any error, use tone generator
    setupToneGenerator()
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current || usingFallback || !mountedRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleEnded = () => {
    if (usingFallback || !mountedRef.current) return

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
    // If using tone generator, control it directly
    if (usingFallback) {
      controlToneGenerator(isPlaying)
      return
    }

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

          // If autoplay is prevented, show a message
          if (error.name === "NotAllowedError") {
            if (mountedRef.current) {
              setAudioError("Playback was prevented by the browser. Please click play again.")
            }
          } else {
            // For other errors, use the tone generator
            setupToneGenerator()
          }
        })
      }
    } else {
      audio.pause()
    }
  }, [isPlaying, usingFallback])

  // Handle volume change
  useEffect(() => {
    // If using tone generator, update its volume
    if (usingFallback && gainNodeRef.current && isPlaying) {
      const actualVolume = isMuted ? 0 : volume
      gainNodeRef.current.gain.setValueAtTime(actualVolume, audioContextRef.current?.currentTime || 0)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted, usingFallback, isPlaying])

  // Handle loop setting
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = isLooping
  }, [isLooping])

  // Update time for tone generator
  useEffect(() => {
    if (!usingFallback || !isPlaying || !mountedRef.current) return

    let startTime = Date.now() - currentTime * 1000
    let animationId: number

    const updateTime = () => {
      if (!mountedRef.current) return

      const elapsed = (Date.now() - startTime) / 1000
      setCurrentTime(elapsed)

      if (elapsed >= duration && !isLooping) {
        setIsPlaying(false)
        setCurrentTime(0)
        return
      }

      if (elapsed >= duration && isLooping) {
        startTime = Date.now()
        setCurrentTime(0)
      }

      animationId = requestAnimationFrame(updateTime)
    }

    animationId = requestAnimationFrame(updateTime)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [usingFallback, isPlaying, isLooping, duration, currentTime])

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
    if (!waveform) return

    // If using tone generator, just toggle play state
    if (usingFallback) {
      if (!isPlaying) {
        setIsPlaying(true)
      }
      return
    }

    if (!audioRef.current) return

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

    // If using tone generator, just toggle play state
    if (usingFallback) {
      if (!isPlaying) {
        setIsPlaying(true)
      }
      return
    }

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

  // Get audio source display name
  const getAudioSourceName = () => {
    if (usingFallback) return "Tone Generator"
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
                isPlaying
                  ? "bg-retro-teal/20 text-retro-teal shadow-[0_0_8px_rgba(94,191,181,0.4)]"
                  : "bg-black/40 text-retro-display/60 hover:bg-black/60 hover:text-retro-display/80",
              )}
              aria-label={isPlaying ? "Pause" : "Play"}
              disabled={isRetrying}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
            </button>

            <div className="ml-3 flex items-center">
              <div className="text-xs font-medium text-retro-display truncate">{getAudioSourceName()}</div>
              {audioError && (
                <div className="ml-2 text-amber-400 flex items-center" title={audioError}>
                  <AlertTriangle className="h-3 w-3" />
                  {!isRetrying && (
                    <button
                      onClick={retryAudio}
                      className="ml-2 text-[9px] text-retro-teal hover:text-retro-teal/80 transition-colors flex items-center"
                      title="Retry loading audio"
                    >
                      {isRetrying ? (
                        <>
                          <RotateCw className="h-2 w-2 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        "Retry"
                      )}
                    </button>
                  )}
                </div>
              )}
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
    </div>
  )
}
