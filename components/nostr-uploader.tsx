"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { SimpleAudioPlayer } from "./simple-audio-player"
import { NostrClient } from "@/lib/nostr-client"
import { cn } from "@/lib/utils"

export function NostrUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)

  const nostrClient = new NostrClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
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
    setError(null)
    setUploadedUrl(null)
    setEventId(null)
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

      // Upload progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          return newProgress < 90 ? newProgress : prev
        })
      }, 300)

      // Upload file to Nostr relay
      const result = await nostrClient.uploadMedia(file, (progress) => {
        if (progress >= 90) {
          clearInterval(progressInterval)
          setUploadProgress(progress)
        }
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setUploadedUrl(result.url)
        setEventId(result.eventId)
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = () => {
    if (urlRef.current) {
      urlRef.current.select()
      document.execCommand("copy")
      // Show a temporary "Copied!" message
      const originalValue = urlRef.current.value
      urlRef.current.value = "Copied!"
      setTimeout(() => {
        if (urlRef.current) urlRef.current.value = originalValue
      }, 1000)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadedUrl(null)
    setEventId(null)
    setError(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full max-w-md">
      {!uploadedUrl ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            "border-retro-display/30 hover:border-retro-display/50",
            isUploading ? "pointer-events-none opacity-70" : "",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
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
                    <p className="text-retro-display/60 text-xs mt-2">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpload}
                      className="px-4 py-2 bg-retro-teal/20 text-retro-teal border border-retro-teal/40 rounded hover:bg-retro-teal/30 transition-colors flex-1"
                    >
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

          {error && (
            <div className="mt-4 text-red-400 text-sm bg-red-400/10 p-3 rounded border border-red-400/30">{error}</div>
          )}

          <div className="mt-6 text-xs text-retro-display/50">
            <p>Supported formats: MP3, WAV, OGG</p>
            <p className="mt-1">Max file size: 50MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-retro-dark border border-retro-display/20 rounded-lg p-6">
          <h3 className="text-retro-display/90 font-space-mono text-lg mb-4">Upload Successful</h3>

          <div className="mb-6">
            <label className="block text-retro-display/70 text-sm mb-1">Media URL:</label>
            <div className="flex">
              <input
                ref={urlRef}
                type="text"
                value={uploadedUrl}
                readOnly
                className="flex-1 bg-black/40 border border-retro-display/30 rounded-l-md p-2 text-retro-display/90 text-sm font-space-mono focus:outline-none focus:ring-1 focus:ring-retro-display/50"
              />
              <button
                onClick={copyToClipboard}
                className="bg-retro-teal/20 text-retro-teal border border-retro-teal/40 border-l-0 rounded-r-md px-3 hover:bg-retro-teal/30 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {eventId && (
            <div className="mb-6">
              <label className="block text-retro-display/70 text-sm mb-1">Event ID:</label>
              <input
                type="text"
                value={eventId}
                readOnly
                className="w-full bg-black/40 border border-retro-display/30 rounded-md p-2 text-retro-display/90 text-sm font-space-mono focus:outline-none"
              />
            </div>
          )}

          <div className="mb-6">
            <SimpleAudioPlayer src={uploadedUrl} />
          </div>

          <button
            onClick={resetUpload}
            className="w-full px-4 py-2 bg-retro-display/10 text-retro-display/80 border border-retro-display/30 rounded hover:bg-retro-display/20 transition-colors"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  )
}
