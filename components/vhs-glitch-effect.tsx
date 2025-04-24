"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function VHSGlitchEffect() {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchType, setGlitchType] = useState<string>("")
  const [glitchIntensity, setGlitchIntensity] = useState<"low" | "medium" | "high">("medium")

  useEffect(() => {
    // Wait a bit before starting glitches to let the page load properly
    const initialDelay = setTimeout(() => {
      const triggerRandomGlitch = () => {
        // Random chance of glitching (approximately once every 20-40 seconds)
        if (Math.random() < 0.04) {
          // Choose a random glitch type
          const glitchTypes = ["horizontal-offset", "vertical-offset", "color-shift", "noise", "tear", "flicker"]
          const randomType = glitchTypes[Math.floor(Math.random() * glitchTypes.length)]

          // Random intensity
          const intensities: ["low", "medium", "high"] = ["low", "medium", "high"]
          const randomIntensity = intensities[Math.floor(Math.random() * intensities.length)]

          setGlitchType(randomType)
          setGlitchIntensity(randomIntensity)
          setIsGlitching(true)

          // Glitch duration between 200ms and 800ms
          const glitchDuration = 200 + Math.random() * 600

          setTimeout(() => {
            setIsGlitching(false)
            setGlitchType("")
          }, glitchDuration)
        }

        // Schedule next potential glitch check (every 2-5 seconds)
        const nextGlitchCheck = 2000 + Math.random() * 3000
        setTimeout(triggerRandomGlitch, nextGlitchCheck)
      }

      // Start the glitch cycle
      triggerRandomGlitch()
    }, 5000) // Wait 5 seconds after component mounts

    return () => {
      clearTimeout(initialDelay)
    }
  }, [])

  if (!isGlitching) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] pointer-events-none",
        `vhs-glitch-${glitchType}`,
        `vhs-glitch-intensity-${glitchIntensity}`,
      )}
      aria-hidden="true"
    />
  )
}
