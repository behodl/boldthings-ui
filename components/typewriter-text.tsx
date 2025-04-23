"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface TypewriterTextProps {
  text: string
  className?: string
  speed?: number
  startDelay?: number
  enableGlitch?: boolean
}

export function TypewriterText({
  text,
  className = "",
  speed = 35, // Base typing speed (increased from 20ms)
  startDelay = 1000,
  enableGlitch = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  // const [cursorVisible, setCursorVisible] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchType, setGlitchType] = useState<string>("")
  const containerRef = useRef<HTMLDivElement>(null)
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Pre-calculate the height needed for the full text
  useEffect(() => {
    if (containerRef.current) {
      // Create a hidden element to measure the full text height
      const hiddenEl = document.createElement("div")
      hiddenEl.style.position = "absolute"
      hiddenEl.style.visibility = "hidden"
      hiddenEl.style.width = containerRef.current.offsetWidth + "px"
      hiddenEl.style.fontFamily = getComputedStyle(containerRef.current).fontFamily
      hiddenEl.style.fontSize = getComputedStyle(containerRef.current).fontSize
      hiddenEl.style.lineHeight = getComputedStyle(containerRef.current).lineHeight
      hiddenEl.style.whiteSpace = "pre-wrap"
      hiddenEl.style.textAlign = "center" // Ensure center alignment for measurement
      hiddenEl.textContent = text

      document.body.appendChild(hiddenEl)

      // Set the minimum height to accommodate the full text
      if (containerRef.current) {
        containerRef.current.style.minHeight = hiddenEl.offsetHeight + "px"
      }

      document.body.removeChild(hiddenEl)
    }
  }, [text])

  useEffect(() => {
    // Start typing after the delay
    const startTimer = setTimeout(() => {
      setIsTyping(true)
    }, startDelay)

    return () => clearTimeout(startTimer)
  }, [startDelay])

  useEffect(() => {
    if (!isTyping) return

    let currentIndex = 0
    const maxIndex = text.length

    // Function to add the next character with organic variance
    const typeNextChar = () => {
      if (currentIndex < maxIndex) {
        setDisplayedText(text.substring(0, currentIndex + 1))
        currentIndex++

        // Calculate next character delay with organic variance
        let nextDelay = speed

        // Current character (just typed)
        const currentChar = text[currentIndex - 1]

        // Next character (about to be typed)
        const nextChar = currentIndex < maxIndex ? text[currentIndex] : null

        // Add variance based on character type
        if (currentIndex === maxIndex - 1) {
          // Last character (usually a period) - add a longer pause before it
          nextDelay = speed * 3 // Significantly longer pause before the final character
        } else if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          // End of sentence - longer pause
          nextDelay = speed * 2.5
        } else if (currentChar === "," || currentChar === ";" || currentChar === ":") {
          // Mid-sentence pause - medium pause
          nextDelay = speed * 1.8
        } else if (currentChar === " " && nextChar && /[A-Z]/.test(nextChar)) {
          // Space before capital letter (likely new sentence or proper noun) - slight pause
          nextDelay = speed * 1.5
        } else {
          // Normal character - random variance
          // More human-like: sometimes fast, sometimes slow, occasionally a brief pause
          const randomFactor = Math.random()
          if (randomFactor > 0.95) {
            // Occasional longer pause (5% chance)
            nextDelay = speed * (1.5 + Math.random())
          } else if (randomFactor > 0.7) {
            // Slightly slower (25% chance)
            nextDelay = speed * (1.1 + Math.random() * 0.3)
          } else if (randomFactor > 0.4) {
            // Normal speed (30% chance)
            nextDelay = speed
          } else {
            // Slightly faster (40% chance)
            nextDelay = speed * (0.7 + Math.random() * 0.3)
          }
        }

        setTimeout(typeNextChar, nextDelay)
      } else {
        setIsDone(true)
      }
    }

    // Start typing
    typeNextChar()

    return () => {
      // Cleanup not needed for this effect
    }
  }, [isTyping, text, speed])

  // Blinking cursor effect
  // useEffect(() => {
  //   if (!isDone) return
  //
  //   const cursorInterval = setInterval(() => {
  //     setCursorVisible((prev) => !prev)
  //   }, 530) // Blink rate
  //
  //   // Stop blinking after 3 seconds
  //   const stopBlinkingTimeout = setTimeout(() => {
  //     clearInterval(cursorInterval)
  //     setCursorVisible(false)
  //   }, 3000)
  //
  //   return () => {
  //     clearInterval(cursorInterval)
  //     clearTimeout(stopBlinkingTimeout)
  //   }
  // }, [isDone])

  // Sporadic glitch effect after text is loaded
  useEffect(() => {
    if (!isDone || !enableGlitch) return

    // Wait a bit after typing is done before starting glitches
    const initialDelay = setTimeout(() => {
      const triggerRandomGlitch = () => {
        // Random chance of glitching (1 in 15 chance)
        if (Math.random() < 0.067) {
          // Choose a random glitch type
          const glitchTypes = ["horizontal", "vertical", "color", "flicker", "noise"]
          const randomType = glitchTypes[Math.floor(Math.random() * glitchTypes.length)]

          setGlitchType(randomType)
          setIsGlitching(true)

          // Glitch duration between 50ms and 300ms
          const glitchDuration = 50 + Math.random() * 250

          setTimeout(() => {
            setIsGlitching(false)
            setGlitchType("")
          }, glitchDuration)
        }

        // Schedule next potential glitch (between 3-15 seconds)
        const nextGlitchDelay = 3000 + Math.random() * 12000
        glitchTimerRef.current = setTimeout(triggerRandomGlitch, nextGlitchDelay)
      }

      // Start the glitch cycle
      triggerRandomGlitch()
    }, 4000) // Wait 4 seconds after typing completes

    return () => {
      clearTimeout(initialDelay)
      if (glitchTimerRef.current) {
        clearTimeout(glitchTimerRef.current)
      }
    }
  }, [isDone, enableGlitch])

  // Determine glitch class based on current state
  const getGlitchClass = () => {
    if (!isGlitching) return ""

    switch (glitchType) {
      case "horizontal":
        return "glitch-horizontal"
      case "vertical":
        return "glitch-vertical"
      case "color":
        return "glitch-color"
      case "flicker":
        return "glitch-flicker"
      case "noise":
        return "glitch-noise"
      default:
        return ""
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative font-space-mono text-center w-full", className)}
      style={{
        position: "relative",
        display: "block",
      }}
    >
      <span className={`relative inline-block ${getGlitchClass()}`}>{displayedText}</span>
    </div>
  )
}
