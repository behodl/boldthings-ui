"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { NostrClient } from "@/lib/nostr-client"
import { cn } from "@/lib/utils"
import {
  Check,
  AlertCircle,
  Upload,
  Music,
  Info,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Edit,
  MessageSquare,
  Copy,
} from "lucide-react"

export function MediaPlayerUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [customUrl, setCustomUrl] = useState<string>("")
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)
  const [isTestPlaying, setIsTestPlaying] = useState(false)
  const [testAudioError, setTestAudioError] = useState<string | null>(null)
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [showContactInfo, setShowContactInfo] = useState(false)
  const [contactCopied, setContactCopied] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)
  const customUrlInputRef = useRef<HTMLInputElement>(null)
  const testAudioRef = useRef<HTMLAudioElement>(null)
  const contactEmailRef = useRef<HTMLInputElement>(null)

  const nostrClient = new NostrClient()

  // Clean up test audio on unmount
  useEffect(() => {
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause()
        testAudioRef.current.src = ""
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    // Reset states
    setUploadSuccess(false)
    setError(null)
    setMediaUrl(null)
    setCustomUrl("")
    setIsEditingUrl(false)
    setCopySuccess(false)
    setUploadWarning(null)
    setTestAudioError(null)
    setIsTestPlaying(false)
    setEventId(null)
    setShowContactInfo(false)

    // Check if file is an audio file
    if (!selectedFile.type.startsWith("audio/")) {
      setError("Please select an audio file (MP3, WAV, OGG)")
      return
    }

    // Check file size (limit to 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit")
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleUpload = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)
      setMediaUrl(null)
      setCustomUrl("")
      setIsEditingUrl(false)
      setUploadWarning(null)
      setTestAudioError(null)
      setEventId(null)
      setShowContactInfo(false)

      console.log("Starting upload of file:", file.name)

      // Upload file to Nostr relay using nip96
      const result = await nostrClient.uploadMedia(file, (progress) => {
        setUploadProgress(progress)
      })

      if (result.success && result.eventId) {
        console.log("Upload successful, event ID:", result.eventId)

        // Store the event ID
        setEventId(result.eventId)

        // Set the media URL
        if (result.url) {
          setMediaUrl(result.url)
          setCustomUrl(result.url)
          console.log("Media URL set to:", result.url)
        } else {
          // No URL was returned
          setUploadWarning(
            "The file was uploaded successfully, but no URL was returned. You may need to contact the Blossom relay administrator.",
          )
        }

        setUploadSuccess(true)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err) {
      console.error("Upload failed:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const testAudio = async () => {
    if (!mediaUrl && !customUrl) {
      setTestAudioError("No URL available to test")
      return
    }

    const urlToTest = isEditingUrl ? customUrl : mediaUrl
    if (!urlToTest) return

    setIsTestingAudio(true)
    setTestAudioError(null)

    if (testAudioRef.current) {
      // Stop any current playback
      testAudioRef.current.pause()

      // Set up event handlers
      const handleCanPlay = () => {
        console.log("Audio can play!")
        setIsTestingAudio(false)
        setIsTestPlaying(true)
        testAudioRef.current?.play().catch((err) => {
          console.error("Error playing test audio:", err)
          setTestAudioError("Failed to play audio: " + err.message)
          setIsTestingAudio(false)
        })
      }

      const handleError = () => {
        const error = testAudioRef.current?.error
        const errorMessage = error ? `Error code: ${error.code}, message: ${error.message}` : "Unknown error"
        console.error("Test audio error:", errorMessage)
        setTestAudioError(`Cannot play audio: ${errorMessage}`)
        setIsTestingAudio(false)
      }

      // Add event listeners
      testAudioRef.current.addEventListener("canplay", handleCanPlay, { once: true })
      testAudioRef.current.addEventListener("error", handleError, { once: true })

      // Add a timestamp to bypass cache
      const testUrl = `${urlToTest}?test=${Date.now()}`
      console.log("Testing audio with URL:", testUrl)

      // Set the source and load
      testAudioRef.current.src = testUrl
      testAudioRef.current.load()

      // Set a timeout in case the audio takes too long to load
      setTimeout(() => {
        if (isTestingAudio) {
          setIsTestingAudio(false)
          setTestAudioError("Audio test timed out. The file may not be ready yet or the URL format may be incorrect.")
        }
      }, 10000)

      return () => {
        // Clean up event listeners
        testAudioRef.current?.removeEventListener("canplay", handleCanPlay)
        testAudioRef.current?.removeEventListener("error", handleError)
      }
    }
  }

  const toggleTestAudio = () => {
    if (!testAudioRef.current) return

    if (isTestPlaying) {
      testAudioRef.current.pause()
      setIsTestPlaying(false)
    } else {
      if (testAudioError) {
        // If there was an error, try testing again
        testAudio()
      } else {
        testAudioRef.current.play().catch((err) => {
          console.error("Error playing test audio:", err)
          setTestAudioError("Failed to play audio: " + err.message)
        })
        setIsTestPlaying(true)
      }
    }
  }

  const updateMainAudioPlayer = () => {
    // Only update if the test was successful
    if (testAudioError) {
      setUploadWarning("Please test the audio successfully before updating the player.")
      return
    }

    const urlToUse = isEditingUrl ? customUrl : mediaUrl
    if (!urlToUse) {
      setUploadWarning("No valid URL available to update the player.")
      return
    }

    // Store the URL in localStorage so it persists across page refreshes
    localStorage.setItem("boldthings-custom-audio", urlToUse)

    // Dispatch a custom event that the audio player can listen for
    const event = new CustomEvent("boldthings-audio-update", { detail: { url: urlToUse } })
    window.dispatchEvent(event)

    console.log("Audio player updated with URL:", urlToUse)

    // Update the warning to confirm success
    setUploadWarning("The audio player has been updated with your new track!")
  }

  const copyToClipboard = () => {
    const textToCopy = isEditingUrl ? customUrl : mediaUrl
    if (urlInputRef.current && textToCopy) {
      urlInputRef.current.select()
      document.execCommand("copy")
      setCopySuccess(true)

      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    }
  }

  const copyContactInfo = () => {
    if (contactEmailRef.current) {
      contactEmailRef.current.select()
      document.execCommand("copy")
      setContactCopied(true)

      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setContactCopied(false)
      }, 2000)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadSuccess(false)
    setError(null)
    setUploadProgress(0)
    setMediaUrl(null)
    setCustomUrl("")
    setIsEditingUrl(false)
    setCopySuccess(false)
    setUploadWarning(null)
    setTestAudioError(null)
    setIsTestPlaying(false)
    setIsTestingAudio(false)
    setEventId(null)
    setShowContactInfo(false)

    if (testAudioRef.current) {
      testAudioRef.current.pause()
      testAudioRef.current.src = ""
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value)
  }

  const applyCustomUrl = () => {
    if (customUrl) {
      setMediaUrl(customUrl)
      setIsEditingUrl(false)
      setTestAudioError(null)
    }
  }

  const toggleUrlEdit = () => {
    setIsEditingUrl(!isEditingUrl)
    if (!isEditingUrl && !customUrl && mediaUrl) {
      setCustomUrl(mediaUrl)
    }
    // Focus the input after a short delay to allow the UI to update
    setTimeout(() => {
      if (!isEditingUrl && customUrlInputRef.current) {
        customUrlInputRef.current.focus()
      }
    }, 100)
  }

  const toggleContactInfo = () => {
    setShowContactInfo(!showContactInfo)
  }

  return (
    <div className="w-full max-w-md">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          "border-retro-display/30 hover:border-retro-display/50",
          isUploading ? "pointer-events-none opacity-70" : "",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {uploadSuccess ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-retro-teal/20 p-4 rounded-full border border-retro-teal/40">
                <Check className="h-8 w-8 text-retro-teal" />
              </div>
            </div>
            <h3 className="text-retro-display/90 font-space-mono text-lg">Upload Successful</h3>

            {/* Upload warning if there was an issue */}
            {uploadWarning && (
              <div className="mt-2 text-amber-400 text-sm bg-amber-400/10 p-3 rounded border border-amber-400/30 flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{uploadWarning}</span>
              </div>
            )}

            {/* Media URL display and copy functionality */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-retro-display/70 text-sm text-left">Media URL:</label>
                <button
                  onClick={toggleUrlEdit}
                  className="text-xs text-retro-teal/80 hover:text-retro-teal flex items-center"
                >
                  {isEditingUrl ? "Done" : "Edit"} <Edit className="h-3 w-3 ml-1" />
                </button>
              </div>

              {isEditingUrl ? (
                <div className="flex mb-2">
                  <input
                    ref={customUrlInputRef}
                    type="text"
                    value={customUrl}
                    onChange={handleCustomUrlChange}
                    className="flex-1 bg-black/40 border border-retro-display/30 rounded-l-md p-2 text-retro-display/90 text-sm font-space-mono focus:outline-none focus:ring-1 focus:ring-retro-display/50"
                    placeholder="Enter custom URL format"
                  />
                  <button
                    onClick={applyCustomUrl}
                    className="bg-retro-teal/20 text-retro-teal border border-retro-teal/40 border-l-0 rounded-r-md px-3 hover:bg-retro-teal/30 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex">
                  <input
                    ref={urlInputRef}
                    type="text"
                    value={mediaUrl || ""}
                    readOnly
                    className="flex-1 bg-black/40 border border-retro-display/30 rounded-l-md p-2 text-retro-display/90 text-sm font-space-mono focus:outline-none focus:ring-1 focus:ring-retro-display/50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      "bg-retro-teal/20 text-retro-teal border border-retro-teal/40 border-l-0 rounded-r-md px-3 hover:bg-retro-teal/30 transition-colors",
                      copySuccess ? "bg-retro-teal/40" : "",
                    )}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}

              {/* Open URL in new tab button */}
              {mediaUrl && !isEditingUrl && (
                <div className="mt-2 flex justify-between items-center">
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-retro-teal/80 hover:text-retro-teal flex items-center"
                  >
                    Open in new tab <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>

            {/* Event ID display */}
            {eventId && (
              <div className="mt-4">
                <label className="block text-retro-display/70 text-sm mb-1 text-left">Event ID:</label>
                <input
                  type="text"
                  value={eventId}
                  readOnly
                  className="w-full bg-black/40 border border-retro-display/30 rounded-md p-2 text-retro-display/90 text-sm font-space-mono focus:outline-none"
                />
              </div>
            )}

            {/* Test audio player */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-retro-display/70 text-sm text-left">Test Audio:</label>
                <button
                  onClick={testAudioError ? testAudio : toggleTestAudio}
                  disabled={isTestingAudio}
                  className={cn(
                    "flex items-center px-3 py-1 rounded text-xs",
                    isTestingAudio
                      ? "bg-retro-display/20 text-retro-display/50 cursor-wait"
                      : testAudioError
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : isTestPlaying
                          ? "bg-retro-teal/20 text-retro-teal hover:bg-retro-teal/30"
                          : "bg-retro-display/20 text-retro-display/80 hover:bg-retro-display/30",
                  )}
                >
                  {isTestingAudio ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                      Testing...
                    </>
                  ) : testAudioError ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5" />
                      Retry Test
                    </>
                  ) : isTestPlaying ? (
                    <>
                      <Pause className="h-3 w-3 mr-1.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1.5" />
                      Test Play
                    </>
                  )}
                </button>
              </div>

              {testAudioError && (
                <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/30 mb-2">
                  <p>{testAudioError}</p>
                  <div className="flex justify-between mt-1">
                    <button
                      onClick={toggleContactInfo}
                      className="text-amber-400 hover:text-amber-300 underline text-xs flex items-center"
                    >
                      Contact Blossom Admin <MessageSquare className="h-2.5 w-2.5 ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* Contact info section */}
              {showContactInfo && (
                <div className="mt-2 mb-4 bg-retro-display/10 p-3 rounded border border-retro-display/20">
                  <h4 className="text-retro-display/90 text-sm font-medium mb-2">Contact Blossom Admin</h4>
                  <p className="text-retro-display/70 text-xs mb-2">
                    If you're having trouble with the media URLs, contact the Blossom relay administrator with the
                    following information:
                  </p>
                  <div className="flex mb-2">
                    <input
                      ref={contactEmailRef}
                      type="text"
                      value={`Event ID: ${eventId} - File: ${file?.name || "unknown"} - Uploaded: ${new Date().toISOString()}`}
                      readOnly
                      className="flex-1 bg-black/40 border border-retro-display/30 rounded-l-md p-2 text-retro-display/90 text-xs font-space-mono focus:outline-none"
                    />
                    <button
                      onClick={copyContactInfo}
                      className={cn(
                        "bg-retro-display/20 text-retro-display/80 border border-retro-display/30 border-l-0 rounded-r-md px-3 hover:bg-retro-display/30 transition-colors",
                        contactCopied ? "bg-retro-display/40" : "",
                      )}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-retro-display/70 text-xs">
                    Email:{" "}
                    <a href="mailto:admin@relay.seq1.net" className="text-retro-teal/80 hover:text-retro-teal">
                      admin@relay.seq1.net
                    </a>
                  </p>
                </div>
              )}

              <audio ref={testAudioRef} className="hidden" onEnded={() => setIsTestPlaying(false)} />

              <div className="flex justify-center mt-3">
                <button
                  onClick={updateMainAudioPlayer}
                  disabled={!!testAudioError && !isTestPlaying}
                  className={cn(
                    "px-4 py-2 border rounded transition-colors flex items-center justify-center",
                    testAudioError && !isTestPlaying
                      ? "bg-retro-display/10 text-retro-display/40 border-retro-display/20 cursor-not-allowed"
                      : "bg-retro-teal/20 text-retro-teal border-retro-teal/40 hover:bg-retro-teal/30",
                  )}
                >
                  <Music className="h-4 w-4 mr-2" />
                  Update Main Player
                </button>
              </div>
            </div>

            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-retro-display/10 text-retro-display/80 border border-retro-display/30 rounded hover:bg-retro-display/20 transition-colors mt-2"
            >
              Upload Another File
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/mp3,audio/wav,audio/ogg"
              className="hidden"
              disabled={isUploading}
            />
            {!file ? (
              <>
                <p className="text-retro-display/80 mb-4">Drag and drop an audio file here, or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-retro-teal/20 text-retro-teal border border-retro-teal/40 rounded hover:bg-retro-teal/30 transition-colors"
                  disabled={isUploading}
                >
                  Select File
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="bg-retro-dark p-3 rounded-lg border border-retro-display/20">
                    <p className="text-retro-display/90 font-space-mono text-sm truncate max-w-[250px]">{file.name}</p>
                    <p className="text-retro-display/60 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                {isUploading ? (
                  <div className="w-full">
                    <div className="h-2 w-full bg-retro-display/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-retro-teal transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-retro-display/60 text-sm mt-2">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpload}
                      className="px-4 py-2 bg-retro-teal/20 text-retro-teal border border-retro-teal/40 rounded hover:bg-retro-teal/30 transition-colors flex-1 flex items-center justify-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </button>
                    <button
                      onClick={resetUpload}
                      className="px-4 py-2 bg-retro-purple/20 text-retro-display/80 border border-retro-display/30 rounded hover:bg-retro-purple/30 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/30 flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 text-xs text-retro-display/50">
          <p>Supported formats: MP3, WAV, OGG</p>
          <p className="mt-1">Max file size: 50MB</p>
        </div>
      </div>
    </div>
  )
}
