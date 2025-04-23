"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface HighlightedTypewriterProps {
  text: string
  wordToHighlight: string
  className?: string
  typewriterSpeed?: number
  typewriterStartDelay?: number
  highlightDelay?: number
  highlightStepDuration?: number
  highlightColor?: string
  enableGlitch?: boolean
}

export function HighlightedTypewriter({
  text,
  wordToHighlight,
  className = "",
  typewriterSpeed = 35,
  typewriterStartDelay = 1000,
  highlightDelay = 7500,
  highlightStepDuration = 80, // Duration per character for highlighting
  highlightColor = "rgba(0, 0, 0, 0.5)", // Changed to dark color with transparency
  enableGlitch = true,
}: HighlightedTypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchType, setGlitchType] = useState<string>("")
  const [highlightedChars, setHighlightedChars] = useState(0)
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [hasHighlighted, setHasHighlighted] = useState(false) // Track if highlighting has been done
  const containerRef = useRef<HTMLDivElement>(null)
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Find the word to highlight and its position
  const wordInfo = (() => {
    const lowerText = text.toLowerCase()
    const lowerWord = wordToHighlight.toLowerCase()
    const startIndex = lowerText.indexOf(lowerWord)

    if (startIndex === -1) return null

    const endIndex = startIndex + wordToHighlight.length
    const actualWord = text.substring(startIndex, endIndex)

    return {
      startIndex,
      endIndex,
      actualWord,
      length: actualWord.length,
    }
  })()

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

  // Start typing after the delay
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true)
    }, typewriterStartDelay)

    return () => clearTimeout(startTimer)
  }, [typewriterStartDelay])

  // Typewriter effect
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
        let nextDelay = typewriterSpeed

        // Current character (just typed)
        const currentChar = text[currentIndex - 1]

        // Next character (about to be typed)
        const nextChar = currentIndex < maxIndex ? text[currentIndex] : null

        // Add variance based on character type
        if (currentIndex === maxIndex - 1) {
          // Last character (usually a period) - add a longer pause before it
          nextDelay = typewriterSpeed * 3 // Significantly longer pause before the final character
        } else if (currentChar === "." || currentChar === "!" || currentChar === "?") {
          // End of sentence - longer pause
          nextDelay = typewriterSpeed * 2.5
        } else if (currentChar === "," || currentChar === ";" || currentChar === ":") {
          // Mid-sentence pause - medium pause
          nextDelay = typewriterSpeed * 1.8
        } else if (currentChar === " " && nextChar && /[A-Z]/.test(nextChar)) {
          // Space before capital letter (likely new sentence or proper noun) - slight pause
          nextDelay = typewriterSpeed * 1.5
        } else {
          // Normal character - random variance
          // More human-like: sometimes fast, sometimes slow, occasionally a brief pause
          const randomFactor = Math.random()
          if (randomFactor > 0.95) {
            // Occasional longer pause (5% chance)
            nextDelay = typewriterSpeed * (1.5 + Math.random())
          } else if (randomFactor > 0.7) {
            // Slightly slower (25% chance)
            nextDelay = typewriterSpeed * (1.1 + Math.random() * 0.3)
          } else if (randomFactor > 0.4) {
            // Normal speed (30% chance)
            nextDelay = typewriterSpeed
          } else {
            // Slightly faster (40% chance)
            nextDelay = typewriterSpeed * (0.7 + Math.random() * 0.3)
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
  }, [isTyping, text, typewriterSpeed])

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

  // Start highlighting effect after specified delay - ONLY ONCE
  useEffect(() => {
    // Only run this effect if typing is done and we haven't highlighted yet
    if (!isDone || !wordInfo || hasHighlighted) return

    const highlightTimer = setTimeout(() => {
      setIsHighlighting(true)

      // Get the total number of characters in the word
      const wordLength = wordInfo.length
      let currentChar = 0

      // Function to highlight the next character (from right to left)
      const highlightNextChar = () => {
        if (currentChar < wordLength) {
          currentChar++
          setHighlightedChars(currentChar)

          // Add a slight random variance to the timing for more natural feel
          const variance = Math.random() * 20 - 10 // +/- 10ms
          const nextDelay = highlightStepDuration + variance

          setTimeout(highlightNextChar, nextDelay)
        } else {
          // Highlighting complete - mark as done to prevent re-highlighting
          setHasHighlighted(true)
        }
      }

      // Start the character-by-character highlighting
      highlightNextChar()
    }, highlightDelay - typewriterStartDelay) // Adjust for the typewriter start delay

    return () => clearTimeout(highlightTimer)
  }, [isDone, highlightDelay, highlightStepDuration, typewriterStartDelay, wordInfo, hasHighlighted])

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

  // Render the text with highlighting
  const renderText = () => {
    if (!wordInfo || !displayedText) {
      return <span>{displayedText}</span>
    }

    const { startIndex, endIndex, actualWord } = wordInfo
    const beforeWord = displayedText.substring(0, startIndex)
    const word = displayedText.substring(startIndex, Math.min(endIndex, displayedText.length))
    const afterWord = displayedText.substring(endIndex)

    // If the word is fully typed, render it with character-by-character highlighting
    if (word === actualWord && highlightedChars > 0) {
      return (
        <>
          {beforeWord}
          <span className="relative inline-block">
            {Array.from(word).map((char, index) => {
              // For right-to-left highlighting, we check if the character should be highlighted
              // by comparing from the end of the word
              const shouldHighlight = index >= word.length - highlightedChars

              return (
                <span key={index} className="relative">
                  {shouldHighlight && (
                    <span
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundColor: highlightColor,
                        borderRadius: "1px",
                        // Add a slight skew to make it look more hand-drawn
                        transform: "skew(-2deg, 0.5deg)",
                      }}
                    />
                  )}
                  <span className="relative z-10">{char}</span>
                </span>
              )
            })}
          </span>
          {afterWord}
        </>
      )
    }

    // Otherwise just return the text as is
    return <span>{displayedText}</span>
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
      <span className={`relative inline-block ${getGlitchClass()}`}>{renderText()}</span>
    </div>
  )
}
