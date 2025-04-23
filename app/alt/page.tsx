import { AnimatedLogo } from "@/components/animated-logo"
import { ContactForm } from "@/components/contact-form"
import { FadeInBackground } from "@/components/fade-in-background"
import { FadeIn } from "@/components/fade-in"
import { Footer } from "@/components/footer"
import { TypewriterText } from "@/components/typewriter-text"

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

                {/* Add typewriter text here too with center alignment */}
                <div className="flex items-center justify-center max-w-xl w-full text-center mt-6">
                  <TypewriterText
                    text={metaDescription}
                    className="text-retro-display/80 text-xs md:text-sm font-normal tracking-wide"
                    speed={15} // Faster typing speed
                    startDelay={1500}
                    enableGlitch={true}
                  />
                </div>
              </div>
            </div>

            {/* Contact Form Section */}
            <FadeIn delay={4400} duration={1000} className="col-span-1">
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
