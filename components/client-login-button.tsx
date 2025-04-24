"use client"

import { useState, useCallback } from "react"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoginModal } from "./login-modal"

interface ClientLoginButtonProps {
  className?: string
}

export function ClientLoginButton({ className }: ClientLoginButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback(() => {
    // Add modal-open class immediately when opening
    document.body.classList.add("modal-open")
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    // Don't remove the modal-open class here - let the modal component handle it
    // This ensures proper timing with the fade-out animation
    setIsModalOpen(false)
  }, [])

  return (
    <>
      <button
        onClick={openModal}
        className={cn("block cursor-pointer z-50", className)}
        type="button"
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 border border-retro-display/30 rounded-md hover:border-retro-display/60 transition-colors">
          <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5 text-retro-display/80" />
          <span className="font-space-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-retro-display/80">
            CLIENT LOGIN
          </span>
        </div>
      </button>

      <LoginModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}
