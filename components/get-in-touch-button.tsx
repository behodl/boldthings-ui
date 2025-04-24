"use client"

import { useState, useEffect } from "react"
import { ExternalLinkIcon } from "./external-link-icon"

export function GetInTouchButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Check if modal is open by monitoring the modal-open class on body
  useEffect(() => {
    const checkModalState = () => {
      setIsModalOpen(document.body.classList.contains("modal-open"))
    }

    // Initial check
    checkModalState()

    // Set up a mutation observer to watch for class changes on the body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          checkModalState()
        }
      })
    })

    observer.observe(document.body, { attributes: true })

    return () => observer.disconnect()
  }, [])

  if (isModalOpen) {
    // Don't render the button when modal is open
    return null
  }

  return (
    <div
      className="group bottom-center-tab"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "2rem",
        zIndex: 40,
        opacity: 0,
        transition: "opacity 1800ms ease-in-out",
        animation: "fadeInGetInTouch 1800ms ease-in-out forwards",
        animationDelay: "6800ms",
      }}
    >
      <a href="mailto:hello@boldthin.gs" className="block">
        <div className="vintage-button-wrapper">
          <div className="vintage-button">
            <span className="font-space-mono text-xs tracking-wider uppercase flex items-center justify-center">
              GET IN TOUCH <ExternalLinkIcon className="ml-1.5 h-3 w-3" />
            </span>
          </div>
        </div>
      </a>
    </div>
  )
}
