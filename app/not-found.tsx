"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage immediately
    router.replace("/")
  }, [router])

  // This content won't be visible since we're redirecting immediately
  return null
}
