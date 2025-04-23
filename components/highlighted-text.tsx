"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface HighlightedTextProps {
  text: string
  wordToHighlight: string
  className?: string
  delay?: number
  highlightColor?: string
  highlightDuration?: number
}

export function HighlightedText({
  text,
  wordToHighlight,
  className = "",
  delay = 7500, // Delay after page load before highlighting starts
  highlightColor = "rgba(94, 191, 181, 0.5)", // Default to retro-teal with transparency
  highlightDuration = 1200, // Duration of the highlighting animation
}: HighlightedTextProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightProgress, setHighlightProgress] = useState(0)

  // Find the word to highlight and split the text
  const processText = () => {
    const regex = new RegExp(`(${wordToHighlight})`, "i")
    const parts = text.split(regex)
    return parts
  }

  const textParts = processText()

  useEffect(() => {
    // Start the highlighting animation after the specified delay
    const highlightTimer = setTimeout(() => {
      setIsAnimating(true)

      // Animate the highlight progress
      const startTime = Date.now()
      const endTime = startTime + highlightDuration

      const animateHighlight = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / highlightDuration, 1)

        setHighlightProgress(progress)

        if (progress < 1) {
          requestAnimationFrame(animateHighlight)
        } else {
          setIsHighlighted(true)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animateHighlight)
    }, delay)

    return () => clearTimeout(highlightTimer)
  }, [delay, highlightDuration])

  return (
    <span className={cn("relative", className)}>
      {textParts.map((part, index) => {
        if (part.toLowerCase() === wordToHighlight.toLowerCase()) {
          return (
            <span key={index} className="relative inline-block">
              {isAnimating && (
                <span
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundColor: highlightColor,
                    width: `${highlightProgress * 100}%`,
                    transition: "width 50ms linear",
                    borderRadius: "1px",
                    // Add a slight skew to make it look more hand-drawn
                    transform: "skew(-2deg, 0.5deg)",
                    opacity: 0.9,
                  }}
                />
              )}
              {isHighlighted && (
                <span
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundColor: highlightColor,
                    borderRadius: "1px",
                    // Add a slight skew to make it look more hand-drawn
                    transform: "skew(-2deg, 0.5deg)",
                    opacity: 0.9,
                  }}
                />
              )}
              <span className="relative z-10">{part}</span>
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}
