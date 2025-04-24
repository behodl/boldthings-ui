"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowRight, AlertCircle, X, RotateCw } from "lucide-react"
import { FadeIn } from "./fade-in"
import { cn } from "@/lib/utils"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [magicCode, setMagicCode] = useState(["", "", "", "", "", ""])
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false)
  const [codeError, setCodeError] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const emailInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle modal opening and closing animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to ensure the modal is in the DOM before starting the animation
      setTimeout(() => {
        setIsClosing(false)
      }, 10)
    } else {
      setIsClosing(true)
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300) // Match this with the CSS transition duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

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

      // Start transition while keeping loading state true
      setIsTransitioning(true)

      // Only set loading to false and change screens after transition completes
      setTimeout(() => {
        setIsEmailSubmitted(true)
        setIsTransitioning(false)
        setIsLoading(false)
      }, 300)
    }, 1000)
  }

  // Update the handleCodeChange function to automatically submit when all digits are filled
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

  // Update the handleCodeSubmit function to handle error transitions better
  const handleCodeSubmit = () => {
    setIsLoading(true)
    setCodeError("")

    // Simulate API call
    setTimeout(() => {
      // First stop loading
      setIsLoading(false)

      // Then show error with a slight delay for smoother transition
      setTimeout(() => {
        setCodeError("Invalid code. Please try again.")
        // Clear the code fields when there's an error
        setMagicCode(["", "", "", "", "", ""])
        // Focus the first input field
        codeInputRefs.current[0]?.focus()
      }, 100)
    }, 1000)
  }

  // Handle going back to email screen - now clears the email field
  const handleBackToEmail = () => {
    // First fade out the error message if it exists
    if (codeError) {
      setCodeError("")
    }

    // Then start the screen transition
    setIsTransitioning(true)

    // Clear the email during the transition so it's not visible to the user
    setTimeout(() => {
      setEmail("")
      setIsEmailSubmitted(false)
      setIsTransitioning(false)

      // Focus the email input after transition completes
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 50)
    }, 300)
  }

  // Handle closing the modal with animation
  const handleClose = () => {
    setIsClosing(true)
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail("")
        setIsEmailSubmitted(false)
        setErrorMessage("")
        setMagicCode(["", "", "", "", "", ""])
        setIsCodeSubmitted(false)
        setCodeError("")
        setIsTransitioning(false)
        setIsLoading(false)
      }, 300)
    }
  }, [isOpen])

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && !isEmailSubmitted && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isEmailSubmitted])

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
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out",
        isClosing ? "opacity-0" : "opacity-100",
      )}
    >
      {/* Backdrop with blur effect */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isClosing ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Modal container */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-10 w-full max-w-[90%] sm:max-w-md mx-2 sm:mx-4 overflow-hidden transition-all duration-300 ease-in-out",
          isClosing ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100",
        )}
      >
        <div className="bg-retro-dark border border-retro-display/20 rounded-md shadow-2xl overflow-hidden">
          {/* Close button - absolute top right corner */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-retro-display/70 hover:text-retro-display transition-colors p-1"
            type="button"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Modal content with proper padding */}
          <div className="p-3 sm:p-5">
            <div className={cn("transition-opacity duration-300", isTransitioning ? "opacity-0" : "opacity-100")}>
              {!isEmailSubmitted ? (
                <FadeIn duration={300}>
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

                    {/* Fixed height container for error message - hidden when not in use */}
                    <div className="h-0">
                      {errorMessage && (
                        <div className="flex items-center text-red-400 text-xs font-space-mono mt-1 transition-opacity duration-300 ease-in-out">
                          <AlertCircle size={12} className="mr-1.5" />
                          {errorMessage}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
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
                </FadeIn>
              ) : (
                <FadeIn duration={300}>
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

                    {/* Error/loading message container with smooth transitions - ONLY FADE, NO SCALE */}
                    <div className="h-5 text-center mb-2 relative">
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out",
                          isLoading ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden={!isLoading}
                      >
                        <div className="flex items-center justify-center text-retro-display/70 font-space-mono text-xs">
                          <RotateCw size={12} className="animate-spin mr-2" />
                          <span>Verifying</span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out",
                          codeError && !isLoading ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden={!codeError || isLoading}
                      >
                        <div className="flex items-center justify-center text-red-400 font-space-mono text-xs">
                          <AlertCircle size={12} className="mr-1.5" />
                          {codeError}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="font-space-mono text-retro-teal/60 hover:text-retro-teal text-xs transition-colors duration-300 ease-in-out"
                        disabled={isLoading}
                      >
                        Use a different email
                      </button>
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
