import { AnimatedLogo } from "@/components/animated-logo"
import { ContactForm } from "@/components/contact-form"
import { FadeInBackground } from "@/components/fade-in-background"
import { FadeIn } from "@/components/fade-in"
import { Footer } from "@/components/footer"

export default function AltHome() {
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
            <div className="col-span-1 lg:col-span-2 flex items-center justify-center py-12 lg:py-0 px-4">
              <AnimatedLogo />
            </div>

            {/* Contact Form Section */}
            <FadeIn delay={600} duration={1000} className="col-span-1">
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
