"use client"

import { useEffect, useState } from "react"
import { FadeIn } from "./fade-in"

export function AnimatedLogo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <FadeIn delay={300} duration={1200} className="relative flex items-center justify-center w-full h-full">
      <h1
        className="italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-white animate-flicker px-4 text-center"
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <span className={`font-semibold ${mounted ? "bold-glow" : ""}`}>BOLD</span>
        <span className={`font-semibold ${mounted ? "things-glow" : ""}`}>THINGS</span>
      </h1>
    </FadeIn>
  )
}
