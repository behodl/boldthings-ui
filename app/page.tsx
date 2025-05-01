import { AnimatedLogo } from "@/components/animated-logo"
import { ClientLoginButton } from "@/components/client-login-button"
import { ExternalLinkIcon } from "@/components/external-link-icon"
import { FadeInBackground } from "@/components/fade-in-background"
import { FadeIn } from "@/components/fade-in"
import { HighlightedTypewriter } from "@/components/highlighted-typewriter"
import { VHSGlitchEffect } from "@/components/vhs-glitch-effect"

export default function Home() {
  const metaDescription =
    "A selective development studio crafting high-impact systems and building long-term intellectual property."

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with improved fade-in effect and responsive sizes */}
      <FadeInBackground
        smallSrc="/images/electronic-background-small.webp"
        mediumSrc="/images/electronic-background-medium.webp"
        largeSrc="/images/electronic-background-large.webp"
        alt="Electronic background"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black bg-opacity-60"></div>

      {/* CRT Effects */}
      <div className="absolute inset-0 z-20 scanline"></div>
      <div className="absolute inset-0 z-20 moving-scanline"></div>
      <div className="absolute inset-0 z-20 crt-overlay"></div>

      {/* VHS Glitch Effect */}
      <VHSGlitchEffect />

      {/* Client Login Button - Top Right - Fades in with logo */}
      <div className="absolute top-4 right-4 z-40" style={{ pointerEvents: "auto" }}>
        <FadeIn delay={300} duration={1200}>
          <ClientLoginButton />
        </FadeIn>
      </div>

      {/* Content */}
      <main className="relative z-30 flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center px-4">
          {/* Container for content with vertical centering */}
          <div className="flex flex-col items-center justify-center">
            {/* Logo Section - Centered on page */}
            <div className="subtle-flicker">
              <AnimatedLogo />
            </div>

            {/* Meta Description with Typewriter Effect that transitions to highlighted text */}
            <div className="flex items-center justify-center max-w-xl w-full text-center px-4 mt-6">
              <HighlightedTypewriter
                text={metaDescription}
                wordToHighlight="selective"
                className="text-retro-display/80 text-xs md:text-sm font-normal tracking-wide"
                typewriterSpeed={35}
                typewriterStartDelay={2500}
                highlightDelay={7500}
                highlightColor="rgba(64, 224, 208, 0.3)"
                highlightStepDuration={80}
                enableGlitch={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Get In Touch Button - Bottom Center Tab with mailto link - Appears after typewriter */}
      <div
        className="group fixed left-1/2 bottom-8 -translate-x-1/2 z-30"
        style={{
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
    </div>
  )
}
