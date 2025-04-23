"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface FadeInBackgroundProps {
  smallSrc: string
  mediumSrc: string
  largeSrc: string
  alt: string
}

export function FadeInBackground({ smallSrc, mediumSrc, largeSrc, alt }: FadeInBackgroundProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Simple approach without any destructuring
  useEffect(() => {
    // Set a timeout to ensure we show the background even if images are slow to load
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500) // Reduced from 1500ms to 500ms for much faster initial display

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 z-0 bg-black overflow-hidden">
      {/* Container with fixed position and dimensions */}
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transitionDuration: "1200ms", // Reduced from 2000ms to 1200ms for faster fade
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", // Smooth easing function
        }}
      >
        {/* Small screens */}
        <div className="block sm:hidden h-full w-full relative">
          <div className="absolute inset-0 bg-black" /> {/* Placeholder while loading */}
          <Image
            src={smallSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>

        {/* Medium screens */}
        <div className="hidden sm:block md:hidden h-full w-full relative">
          <div className="absolute inset-0 bg-black" /> {/* Placeholder while loading */}
          <Image
            src={mediumSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>

        {/* Large screens */}
        <div className="hidden md:block h-full w-full relative">
          <div className="absolute inset-0 bg-black" /> {/* Placeholder while loading */}
          <Image
            src={largeSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>
      </div>
    </div>
  )
}
