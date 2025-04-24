import { AnimatedLogo } from "@/components/animated-logo"
import { ClientLoginButton } from "@/components/client-login-button"
import { ContactForm } from "@/components/contact-form"
import { FadeInBackground } from "@/components/fade-in-background"
import { FadeIn } from "@/components/fade-in"
import { Footer } from "@/components/footer"
import { HighlightedTypewriter } from "@/components/highlighted-typewriter"

export default function AltHome() {
  const metaDescription =
    "A selective development studio crafting high-impact systems and building long-term intellectual property."

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with improved fade-in effect */}
      <FadeInBackground
        smallSrc="/images/gradient-background-small.webp"
        mediumSrc="/images/gradient-background-medium.webp"
        largeSrc="/images/gradient-background-large.webp"
        alt="Gradient background"
      />

      {/* Client Login Button - Top Right */}
      <div className="absolute top-4 right-4 z-40" style={{ pointerEvents: "auto" }}>
        <FadeIn delay={6800} duration={1800}>
          <ClientLoginButton />
        </FadeIn>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center">
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 md:p-8">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Logo Section - Takes up most of the space */}
            <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-12 lg:py-0 px-4">
              {/* Container for logo and text with vertical centering */}
              <div className="flex flex-col items-center justify-center">
                <div>
                  <AnimatedLogo />
                </div>

                {/* Meta Description with Typewriter Effect that transitions to highlighted text */}
                <div className="flex items-center justify-center max-w-xl w-full text-center mt-6">
                  <HighlightedTypewriter
                    text={metaDescription}
                    wordToHighlight="selective"
                    className="text-retro-display/80 text-xs md:text-sm font-normal tracking-wide"
                    typewriterSpeed={35}
                    typewriterStartDelay={2500}
                    highlightDelay={7500}
                    highlightColor="rgba(0, 0, 0, 0.5)"
                    highlightStepDuration={80}
                  />
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <FadeIn delay={6800} duration={1800} className="col-span-1">
              <ContactForm />
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={1000} duration={800} className="w-full">
          <Footer />
        </FadeIn>
      </main>
    </div>
  )
}
