"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 1000, className }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isInitialRender, setIsInitialRender] = useState(true)

  useEffect(() => {
    // Set initial render to false immediately to prevent flash
    setIsInitialRender(false)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn("transition-opacity ease-in-out", className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        // Hide completely on initial render to prevent flash
        visibility: isInitialRender ? "hidden" : "visible",
      }}
    >
      {children}
    </div>
  )
}
