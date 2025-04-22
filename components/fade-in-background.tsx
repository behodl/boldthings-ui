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
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Preload the images - fixed to avoid destructuring error
    const preloadImages = () => {
      ;[smallSrc, mediumSrc, largeSrc].forEach((src) => {
        if (src) {
          const img = new window.Image()
          img.src = src
        }
      })
    }

    // Try to preload images, but don't block if it fails
    try {
      preloadImages()
    } catch (error) {
      console.error("Error preloading images:", error)
    }

    // Set loaded state when component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true)
      // Small delay before starting the fade-in animation
      const fadeTimer = setTimeout(() => {
        setIsVisible(true)
      }, 100)

      return () => clearTimeout(fadeTimer)
    }, 100)

    return () => clearTimeout(timer)
  }, [smallSrc, mediumSrc, largeSrc])

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <div
        className="absolute inset-0 transition-opacity duration-1500 ease-in-out"
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {/* Small screens */}
        <div className="block sm:hidden h-full w-full relative">
          <Image
            src={smallSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Medium screens */}
        <div className="hidden sm:block md:hidden h-full w-full relative">
          <Image
            src={mediumSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            onLoad={() => setIsLoaded(true)}
          />
        </div>

        {/* Large screens */}
        <div className="hidden md:block h-full w-full relative">
          <Image
            src={largeSrc || "/placeholder.svg"}
            alt={alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </div>
  )
}
