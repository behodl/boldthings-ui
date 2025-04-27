"use client"

import { useEffect, useState } from "react"
import { FadeIn } from "./fade-in"

export function AnimatedLogo() {
  const [mounted, setMounted] = useState(false)
  const [glowReady, setGlowReady] = useState(false)
  const [isFlickering, setIsFlickering] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add a shorter delay before starting the glow effect
    const glowTimer = setTimeout(() => {
      setGlowReady(true)
    }, 800) // Reduced from 1200ms to 800ms

    // Set up sporadic flickering effect
    const setupFlickerEffect = () => {
      // Random chance of flickering (approximately once every 20-60 seconds)
      if (Math.random() < 0.05) {
        setIsFlickering(true)

        // Flicker duration between 100ms and 300ms
        const flickerDuration = 100 + Math.random() * 200

        setTimeout(() => {
          setIsFlickering(false)
        }, flickerDuration)
      }

      // Schedule next potential flicker check (every 5-15 seconds)
      const nextFlickerCheck = 5000 + Math.random() * 10000
      setTimeout(setupFlickerEffect, nextFlickerCheck)
    }

    // Start the flicker cycle after a delay
    const flickerStartTimer = setTimeout(setupFlickerEffect, 5000)

    return () => {
      clearTimeout(glowTimer)
      clearTimeout(flickerStartTimer)
    }
  }, [])

  return (
    <FadeIn delay={300} duration={1200} className="relative flex items-center justify-center w-full h-full">
      <h1
        className={`italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white px-4 text-center relative ${isFlickering ? "opacity-30" : ""}`}
        style={{
          fontFamily: "var(--font-poppins), sans-serif",
          transition: isFlickering ? "none" : "opacity 100ms ease-out",
        }}
      >
        <span className={`font-semibold ${glowReady ? "bold-glow" : ""}`}>BOLD</span>
        <span className={`font-semibold ${glowReady ? "things-glow" : ""}`}>THINGS</span>
        <span className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl not-italic font-normal tracking-tighter opacity-70 absolute top-[calc(0.5em-3px)] sm:top-[calc(0.5em-3px)] md:top-[calc(0.5em-3px)] lg:top-[0.5em] xl:top-[0.5em]">
          ™
        </span>
      </h1>
    </FadeIn>
  )
}
