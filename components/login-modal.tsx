"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, AlertCircle, X, RotateCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Form state
  const [email, setEmail] = useState("")
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [magicCode, setMagicCode] = useState(["", "", "", "", "", ""])
  const [codeError, setCodeError] = useState("")

  // Animation state
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const emailInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle modal visibility with pre-rendering
  useEffect(() => {
    if (isOpen) {
      // First make the modal visible without animation
      setIsVisible(true)
      setIsClosing(false)

      // Prevent background scrolling
      document.body.style.overflow = "hidden"

      // Force browser to acknowledge the modal is in the DOM before animating
      // This prevents the flash on first render
      const animationFrame = requestAnimationFrame(() => {
        // This empty frame ensures the browser has processed the DOM changes
        requestAnimationFrame(() => {
          // Now it's safe to animate
        })
      })

      return () => cancelAnimationFrame(animationFrame)
    } else {
      setIsClosing(true)

      // Wait for animation to complete before removing the modal
      const timer = setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = "" // Restore scrolling

        // Reset form state after modal is fully hidden
        setTimeout(() => {
          setEmail("")
          setIsEmailSubmitted(false)
          setErrorMessage("")
          setMagicCode(["", "", "", "", "", ""])
          setCodeError("")
          setIsLoading(false)
        }, 100)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && !isEmailSubmitted && emailInputRef.current) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isOpen, isEmailSubmitted])

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    // Simulate API call
    setTimeout(() => {
      // Check for validation errors
      if (!email.includes("@")) {
        setErrorMessage("Please enter a valid email address")
        setIsLoading(false)
        return
      }

      // Start transition
      setIsAnimating(true)

      // Change screens after transition completes
      setTimeout(() => {
        setIsEmailSubmitted(true)
        setIsAnimating(false)
        setIsLoading(false)

        // Focus first code input after transition
        setTimeout(() => {
          codeInputRefs.current[0]?.focus()
        }, 100)
      }, 300)
    }, 1000)
  }

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newCode = [...magicCode]
    newCode[index] = value
    setMagicCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
    // If this is the last digit and it's filled, automatically submit
    else if (value && index === 5) {
      // Check if all digits are filled
      const allFilled = newCode.every((digit) => digit.trim() !== "")
      if (allFilled) {
        // Small delay to allow the UI to update before submitting
        setTimeout(() => {
          handleCodeSubmit()
        }, 300)
      }
    }
  }

  // Handle code submission
  const handleCodeSubmit = () => {
    setIsLoading(true)
    setCodeError("")

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setCodeError("Invalid code. Please try again.")
      setMagicCode(["", "", "", "", "", ""])
      codeInputRefs.current[0]?.focus()
    }, 1000)
  }

  // Handle going back to email screen
  const handleBackToEmail = () => {
    setIsAnimating(true)

    setTimeout(() => {
      setEmail("")
      setIsEmailSubmitted(false)
      setIsAnimating(false)

      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }, 300)
  }

  // Handle closing the modal with animation
  const handleClose = () => {
    onClose()
  }

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen && !isClosing) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, isClosing])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen && !isClosing) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, isClosing])

  if (!isVisible && !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        opacity: isClosing ? 0 : 1,
        transition: "opacity 500ms ease-out",
        zIndex: 9999, // Explicitly set a very high z-index
      }}
    >
      {/* Backdrop without blur effect */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          opacity: isClosing ? 0 : 1,
          transition: "opacity 500ms ease-out",
        }}
        onClick={handleClose}
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-[90%] sm:max-w-md mx-auto"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translateY(${isClosing ? "4px" : "0"})`,
          opacity: isClosing ? 0 : 1,
          transition: "opacity 500ms ease-out, transform 500ms ease-out",
        }}
      >
        <div className="bg-retro-dark border border-retro-display/20 rounded-md shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-retro-display/60 hover:text-retro-display transition-colors p-1.5 rounded-sm hover:bg-black/20"
            type="button"
            aria-label="Close"
          >
            <X size={14} />
          </button>

          {/* Modal content */}
          <div className="p-5">
            <div className={cn("transition-opacity duration-300", isAnimating ? "opacity-0" : "opacity-100")}>
              {!isEmailSubmitted ? (
                <div className="animate-fade-in">
                  <form onSubmit={handleEmailSubmit}>
                    <div className="mb-1">
                      <label htmlFor="email" className="block font-space-mono text-xs text-retro-display/80 mb-1">
                        Email
                      </label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-black/40 border border-retro-display/30 rounded-md text-retro-display/90 text-sm font-space-mono focus:outline-none focus:ring-1 focus:ring-retro-display/50 focus:border-retro-display/50 placeholder-retro-teal/60"
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>

                    {/* Error message */}
                    <div className="h-4 mb-1">
                      {errorMessage && (
                        <div className="flex items-center text-red-400 text-xs font-space-mono animate-fade-in">
                          <AlertCircle size={12} className="mr-1.5" />
                          {errorMessage}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "w-full flex items-center justify-center px-4 py-2.5 border border-retro-display/40 rounded-md",
                          "text-xs font-space-mono tracking-wider uppercase text-retro-display/90",
                          "hover:bg-retro-display/10 transition-colors",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                        )}
                      >
                        {isLoading ? (
                          <>
                            <span className="mr-2">CONTINUE</span>
                            <RotateCw size={12} className="animate-spin" />
                          </>
                        ) : (
                          <>
                            CONTINUE
                            <ArrowRight size={12} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="font-space-mono text-xs text-retro-display/90">
                        If your account exists, we've sent a magic code to <span className="font-medium">{email}</span>
                      </p>
                    </div>
                    <div className="text-center mb-2">
                      <p className="font-space-mono text-xs text-retro-display/70">
                        Enter the 6-digit code to continue
                      </p>
                    </div>

                    <div className="flex justify-center space-x-1 sm:space-x-2 mb-4">
                      {magicCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (codeInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          className="w-7 sm:w-9 h-8 sm:h-10 text-center bg-black/40 border border-retro-display/30 rounded-md text-retro-display font-space-mono text-base focus:outline-none focus:ring-1 focus:ring-retro-display/50 focus:border-retro-display/50"
                          disabled={isLoading}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {/* Error/loading message */}
                    <div className="h-5 text-center mb-2">
                      {isLoading && (
                        <div className="flex items-center justify-center text-retro-display/70 font-space-mono text-xs animate-fade-in">
                          <RotateCw size={12} className="animate-spin mr-2" />
                          <span>Verifying</span>
                        </div>
                      )}
                      {codeError && !isLoading && (
                        <div className="flex items-center justify-center text-red-400 font-space-mono text-xs animate-fade-in">
                          <AlertCircle size={12} className="mr-1.5" />
                          {codeError}
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="font-space-mono text-retro-teal/60 hover:text-retro-teal text-xs transition-colors"
                        disabled={isLoading}
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
