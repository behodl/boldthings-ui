"use client"

import { useEffect, useState } from "react"
import { FadeIn } from "./fade-in"

export function AnimatedLogo() {
  const [mounted, setMounted] = useState(false)
  const [glowReady, setGlowReady] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add a shorter delay before starting the glow effect
    const glowTimer = setTimeout(() => {
      setGlowReady(true)
    }, 800) // Reduced from 1200ms to 800ms

    return () => clearTimeout(glowTimer)
  }, [])

  return (
    <FadeIn delay={300} duration={1200} className="relative flex items-center justify-center w-full h-full">
      <h1
        className="italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white animate-flicker px-4 text-center relative"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <span className={`font-semibold ${glowReady ? "bold-glow" : ""}`}>BOLD</span>
        <span className={`font-semibold ${glowReady ? "things-glow" : ""}`}>THINGS</span>
        <span
          className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl not-italic font-normal tracking-tighter opacity-70 absolute"
          style={{
            marginLeft: "0.2em",
            top: "0.5em", // Align with the top of the "S"
          }}
        >
          ™
        </span>
      </h1>
    </FadeIn>
  )
}
