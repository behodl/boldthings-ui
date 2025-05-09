import type React from "react"
import type { Metadata } from "next"
import { Poppins, Space_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import { AudioPlayer } from "@/components/audio-player"

// Add Poppins font with the weights we need
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Added 500 (medium) weight
  style: ["normal", "italic"],
  variable: "--font-poppins",
})

// Add Space Mono font
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "BOLDTHINGS | Crafting Systems That Endure",
  description:
    "A selective development studio crafting high-impact systems and building long-term intellectual property. We're open to exceptional projects that align with our vision.",
  keywords: "development studio, high-impact systems, long-term IP, tech development, digital innovation",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.png" }],
  },
  openGraph: {
    title: "BOLDTHINGS | Crafting Systems That Endure",
    description:
      "A selective development studio crafting high-impact systems and building long-term intellectual property.",
    url: "https://boldthin.gs",
    siteName: "BOLDTHINGS",
    images: [
      {
        url: "/images/electronic-background.png",
        width: 1200,
        height: 630,
        alt: "BOLDTHINGS",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOLDTHINGS | Crafting Systems That Endure",
    description:
      "A selective development studio crafting high-impact systems and building long-term intellectual property.",
    images: ["/images/electronic-background.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        {/* Fathom Analytics */}
        <Script src="https://cdn.usefathom.com/script.js" data-site="YAZUMJHR" defer />
      </head>
      <body className={`${poppins.variable} ${spaceMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <AudioPlayer
            audioSrc="https://media.boldthin.gs/F4LC0N.mp3"
            className="audio-player-enter"
            key="audio-player"
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
