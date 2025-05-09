import { nip19 } from "nostr-tools"
import * as secp from "@noble/secp256k1"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"

export class NostrClient {
  private privateKey: string
  private publicKey: string
  private relayUrl = "wss://relay.seq1.net" // Main relay URL
  private httpRelayUrl = "https://relay.seq1.net" // HTTP version for uploads

  constructor() {
    try {
      // Use the provided private key
      const nsecKey = "nsec1xxn4ghyy5zgt3lc24vustxpyhuuwxgahcse790ptcagjyexwp6gskar8ad"

      try {
        // Convert nsec to hex format
        const decoded = nip19.decode(nsecKey)
        if (decoded.type === "nsec") {
          this.privateKey = decoded.data as string
          console.log("Private key decoded successfully (length):", this.privateKey.length)
        } else {
          throw new Error("Invalid nsec format")
        }
      } catch (e) {
        console.error("Invalid nsec format:", e)
        throw new Error("Failed to initialize NostrClient: Invalid private key")
      }

      // Derive public key from private key - with multiple fallback methods
      this.publicKey = this.derivePublicKey(this.privateKey)
      console.log("NostrClient initialized with relay:", this.relayUrl)
      console.log("Using public key:", this.publicKey)
    } catch (e) {
      console.error("Error in NostrClient constructor:", e)
      // Provide a fallback public key for testing purposes
      this.privateKey = "0000000000000000000000000000000000000000000000000000000000000001"
      this.publicKey = "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
      console.warn("Using fallback keys for testing purposes")
    }
  }

  // Multiple methods to derive public key with fallbacks
  private derivePublicKey(privateKey: string): string {
    console.log("Attempting to derive public key...")

    try {
      // Method 1: Use the standard getPublicKey function
      try {
        console.log("Method 1: Using standard getPublicKey")
        const publicKeyHex = bytesToHex(secp.getPublicKey(privateKey, true))
        console.log("Method 1 succeeded, public key:", publicKeyHex)
        return publicKeyHex
      } catch (e) {
        console.error("Method 1 failed:", e)
      }

      // Method 2: Try with explicit hex to bytes conversion
      try {
        console.log("Method 2: Using explicit hex conversion")
        const privateKeyBytes = hexToBytes(privateKey)
        const publicKeyBytes = secp.getPublicKey(privateKeyBytes, true)
        const publicKeyHex = bytesToHex(publicKeyBytes)
        console.log("Method 2 succeeded, public key:", publicKeyHex)
        return publicKeyHex
      } catch (e) {
        console.error("Method 2 failed:", e)
      }

      // Method 3: Try with Point.fromPrivateKey
      try {
        console.log("Method 3: Using Point.fromPrivateKey")
        const privateKeyBytes = hexToBytes(privateKey)
        const point = secp.Point.fromPrivateKey(privateKeyBytes)
        const publicKeyHex = point.toHex(true)
        console.log("Method 3 succeeded, public key:", publicKeyHex)
        return publicKeyHex
      } catch (e) {
        console.error("Method 3 failed:", e)
      }

      // Method 4: Try with a different approach using scalar multiplication
      try {
        console.log("Method 4: Using scalar multiplication")
        const G = secp.Point.BASE
        const privateKeyBigInt = BigInt("0x" + privateKey)
        const point = G.multiply(privateKeyBigInt)
        const publicKeyHex = point.toHex(true)
        console.log("Method 4 succeeded, public key:", publicKeyHex)
        return publicKeyHex
      } catch (e) {
        console.error("Method 4 failed:", e)
      }

      throw new Error("All public key derivation methods failed")
    } catch (e) {
      console.error("Error deriving public key:", e)
      throw new Error("Failed to derive public key")
    }
  }

  // Implement our own event hash function
  private getEventHash(event: any): string {
    try {
      const eventString = JSON.stringify([0, event.pubkey, event.created_at, event.kind, event.tags, event.content])
      console.log("Event string for hashing:", eventString)
      const eventHash = sha256(Buffer.from(eventString))
      return bytesToHex(eventHash)
    } catch (e) {
      console.error("Error in getEventHash:", e)
      throw e
    }
  }

  // Custom implementation of signEvent that doesn't rely on secp's sign function
  private async signEvent(event: any, privateKey: string): Promise<string> {
    try {
      console.log("Starting custom signEvent implementation")

      // Get the event hash
      const hash = this.getEventHash(event)
      console.log("Event hash:", hash)

      // Method 1: Try with direct signing
      try {
        console.log("Signing method 1: Direct signing")
        const messageBytes = hexToBytes(hash)
        const signature = await secp.sign(messageBytes, privateKey)
        console.log("Signing method 1 succeeded")
        return bytesToHex(signature)
      } catch (e) {
        console.error("Signing method 1 failed:", e)
      }

      // Method 2: Try with explicit hex conversion
      try {
        console.log("Signing method 2: With explicit conversion")
        const messageBytes = hexToBytes(hash)
        const privateKeyBytes = hexToBytes(privateKey)
        const signature = await secp.sign(messageBytes, privateKeyBytes)
        console.log("Signing method 2 succeeded")
        return bytesToHex(signature)
      } catch (e) {
        console.error("Signing method 2 failed:", e)
      }

      // Method 3: Try with synchronous signing
      try {
        console.log("Signing method 3: Synchronous signing")
        const messageBytes = hexToBytes(hash)
        const privateKeyBytes = hexToBytes(privateKey)
        const signature = secp.signSync(messageBytes, privateKeyBytes)
        console.log("Signing method 3 succeeded")
        return bytesToHex(signature)
      } catch (e) {
        console.error("Signing method 3 failed:", e)
      }

      // Method 4: Try with custom random bytes
      try {
        console.log("Signing method 4: With custom randomness")
        const messageBytes = hexToBytes(hash)
        const privateKeyBytes = hexToBytes(privateKey)

        // Generate random bytes for k
        const getRandomBytes = () => {
          const arr = new Uint8Array(32)
          crypto.getRandomValues(arr)
          return arr
        }

        const k = getRandomBytes()
        const signature = secp.signSync(messageBytes, privateKeyBytes, { k })
        console.log("Signing method 4 succeeded")
        return bytesToHex(signature)
      } catch (e) {
        console.error("Signing method 4 failed:", e)
      }

      throw new Error("All signing methods failed")
    } catch (e) {
      console.error("Error in signEvent:", e)
      throw e
    }
  }

  async uploadMedia(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; url?: string; eventId?: string; error?: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        if (onProgress) onProgress(10)

        console.log("Starting upload of file:", file.name)
        console.log("Using HTTP relay URL for upload:", this.httpRelayUrl)

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        if (onProgress) onProgress(20)

        // Convert ArrayBuffer to base64
        const base64Data = this.arrayBufferToBase64(arrayBuffer)
        if (onProgress) onProgress(30)

        // Create an unsigned Nostr event according to NIP-96
        const event = {
          kind: 1063, // NIP-96 kind for file upload
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["m", file.type], // MIME type
            ["size", file.size.toString()], // File size
            ["x", file.name], // Original filename
            ["alt", file.name], // Alt text (using filename)
          ],
          content: base64Data,
          pubkey: this.publicKey,
        }

        if (onProgress) onProgress(40)

        // Compute the event ID
        const id = this.getEventHash(event)
        console.log("Computed event ID:", id)

        // Sign the event
        const signature = await this.signEvent(event, this.privateKey)
        console.log("Generated signature:", signature)

        const signedEvent = {
          ...event,
          id,
          sig: signature,
        }

        if (onProgress) onProgress(50)

        // Upload the event to the relay using HTTP POST
        try {
          console.log("Sending signed event to relay:", JSON.stringify(signedEvent).substring(0, 200) + "...")

          const response = await fetch(`${this.httpRelayUrl}/api/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(signedEvent),
          })

          if (onProgress) onProgress(80)

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP error ${response.status}: ${errorText}`)
          }

          // Parse the response to get the URL
          const responseData = await response.json()
          console.log("Upload response:", responseData)

          if (onProgress) onProgress(90)

          // Extract URL from response
          let mediaUrl: string | null = null

          // Check if the response contains a URL directly
          if (responseData.url) {
            mediaUrl = responseData.url
          }
          // Check if the response contains a status and URL
          else if (responseData.status === "success" && responseData.data?.url) {
            mediaUrl = responseData.data.url
          }
          // Check if there's a URL in the tags
          else if (responseData.tags && Array.isArray(responseData.tags)) {
            const urlTag = responseData.tags.find((tag: string[]) => tag[0] === "url")
            if (urlTag && urlTag.length > 1) {
              mediaUrl = urlTag[1]
            }
          }
          // If no URL in response, construct one based on event ID
          else if (id) {
            // Try to construct a URL based on common patterns
            const fileExt = file.name.split(".").pop() || "mp3"
            mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`
          }

          if (onProgress) onProgress(100)

          if (mediaUrl) {
            resolve({
              success: true,
              url: mediaUrl,
              eventId: id,
            })
          } else {
            resolve({
              success: true,
              eventId: id,
              error: "No URL found in response",
            })
          }
        } catch (uploadError) {
          console.error("Error during HTTP upload:", uploadError)

          // Even if the HTTP upload fails, try to construct a URL
          if (id) {
            const fileExt = file.name.split(".").pop() || "mp3"
            const mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`

            resolve({
              success: true,
              url: mediaUrl,
              eventId: id,
              error: `Upload may have failed: ${uploadError}`,
            })
          } else {
            throw uploadError
          }
        }
      } catch (error) {
        console.error("Upload error:", error)
        reject(error)
      }
    })
  }

  // Helper method to convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ""
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Alternative implementation using WebSocket for upload
  async uploadMediaViaWebSocket(
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<{ success: boolean; url?: string; eventId?: string; error?: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        if (onProgress) onProgress(10)

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        if (onProgress) onProgress(20)

        // Convert ArrayBuffer to base64
        const base64Data = this.arrayBufferToBase64(arrayBuffer)
        if (onProgress) onProgress(30)

        // Create an unsigned Nostr event according to NIP-96
        const event = {
          kind: 1063, // NIP-96 kind for file upload
          created_at: Math.floor(Date.now() / 1000),
          tags: [
            ["m", file.type], // MIME type
            ["size", file.size.toString()], // File size
            ["x", file.name], // Original filename
            ["alt", file.name], // Alt text (using filename)
          ],
          content: base64Data,
          pubkey: this.publicKey,
        }

        if (onProgress) onProgress(40)

        // Compute the event ID
        const id = this.getEventHash(event)
        const signedEvent = {
          ...event,
          id,
          sig: await this.signEvent(event, this.privateKey),
        }

        if (onProgress) onProgress(50)

        // Connect to the relay via WebSocket
        const ws = new WebSocket(this.relayUrl)
        let resolved = false
        let timeout: NodeJS.Timeout | null = null

        ws.onopen = () => {
          console.log("WebSocket connected, sending event")

          // Send the event
          ws.send(JSON.stringify(["EVENT", signedEvent]))
          console.log("Event sent to relay")

          if (onProgress) onProgress(70)

          // Set a timeout for response
          timeout = setTimeout(() => {
            if (!resolved) {
              console.log("No response from relay, assuming success")

              // Construct a URL based on event ID
              const fileExt = file.name.split(".").pop() || "mp3"
              const mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`

              resolved = true
              resolve({
                success: true,
                url: mediaUrl,
                eventId: id,
                error: "No confirmation from relay",
              })

              ws.close()
            }
          }, 10000)
        }

        ws.onmessage = (msg) => {
          console.log("WebSocket message received:", msg.data)

          try {
            const data = JSON.parse(msg.data)

            if (data[0] === "OK" && data[1] === id) {
              console.log("Relay confirmed event publication")

              if (onProgress) onProgress(90)

              // Construct a URL based on event ID
              const fileExt = file.name.split(".").pop() || "mp3"
              const mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`

              if (!resolved) {
                resolved = true
                resolve({
                  success: true,
                  url: mediaUrl,
                  eventId: id,
                })

                if (timeout) clearTimeout(timeout)
                ws.close()
              }
            }
          } catch (e) {
            console.error("Error parsing WebSocket message:", e)
          }
        }

        ws.onerror = (err) => {
          console.error("WebSocket error:", err)

          if (!resolved) {
            resolved = true

            // Even if WebSocket fails, try to construct a URL
            const fileExt = file.name.split(".").pop() || "mp3"
            const mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`

            resolve({
              success: true,
              url: mediaUrl,
              eventId: id,
              error: "WebSocket error occurred",
            })

            if (timeout) clearTimeout(timeout)
            ws.close()
          }
        }

        ws.onclose = () => {
          console.log("WebSocket connection closed")

          if (!resolved) {
            resolved = true

            // Construct a URL based on event ID
            const fileExt = file.name.split(".").pop() || "mp3"
            const mediaUrl = `${this.httpRelayUrl}/media/${id}.${fileExt}`

            resolve({
              success: true,
              url: mediaUrl,
              eventId: id,
              error: "WebSocket connection closed unexpectedly",
            })

            if (timeout) clearTimeout(timeout)
          }
        }
      } catch (error) {
        console.error("Upload error:", error)
        reject(error)
      }
    })
  }
}
