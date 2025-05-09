"use client"

import { useState, useRef, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordProtectionProps {
  onAuthentication: (success: boolean) => void
  correctCode: string
}

export function PasswordProtection({ onAuthentication, correctCode }: PasswordProtectionProps) {
  const [code, setCode] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    codeInputRefs.current[0]?.focus()
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    // Only allow digits
    if (!/^\d*$/.test(value)) {
      return
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      codeInputRefs.current[index + 1]?.focus()
    }

    // If this is the last digit and it's filled, automatically submit
    if (value && index === 3) {
      // Check if all digits are filled
      const allFilled = newCode.every((digit) => digit.trim() !== "")
      if (allFilled) {
        // Small delay to allow the UI to update before submitting
        setTimeout(() => {
          handleSubmit(newCode)
        }, 300)
      }
    }
  }

  const handleSubmit = (codeArray = code) => {
    setIsLoading(true)
    setError("")

    // Simulate API call
    setTimeout(() => {
      const enteredCode = codeArray.join("")
      console.log(`Comparing entered code: "${enteredCode}" with correct code: "${correctCode}"`)

      if (enteredCode === correctCode) {
        onAuthentication(true)
      } else {
        setError("Invalid code. Please try again.")
        setCode(["", "", "", ""])
        codeInputRefs.current[0]?.focus()
        setIsLoading(false)
      }
    }, 800)
  }

  return (
    <div className="bg-retro-dark border border-retro-display/20 rounded-md shadow-2xl p-6 w-full max-w-sm">
      <div className="text-center mb-6">
        <h2 className="text-xl font-space-mono text-retro-display mb-2">Access Required</h2>
        <p className="text-sm text-retro-display/70">Enter the 4-digit code to continue</p>
      </div>

      <div className="flex justify-center space-x-3 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (codeInputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            className="w-12 h-14 text-center bg-black/40 border border-retro-display/30 rounded-md text-retro-display font-space-mono text-xl focus:outline-none focus:ring-1 focus:ring-retro-display/50 focus:border-retro-display/50"
            disabled={isLoading}
          />
        ))}
      </div>

      {error && (
        <div className="flex items-center justify-center text-red-400 text-sm mb-4">
          <AlertCircle size={14} className="mr-1.5" />
          {error}
        </div>
      )}

      <button
        onClick={() => handleSubmit()}
        disabled={code.some((digit) => digit === "") || isLoading}
        className={cn(
          "w-full flex items-center justify-center px-4 py-3 border border-retro-display/40 rounded-md",
          "text-sm font-space-mono tracking-wider uppercase text-retro-display/90",
          "hover:bg-retro-display/10 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {isLoading ? "Verifying..." : "Continue"}
      </button>
    </div>
  )
}
