import { AnimatedLogo } from "@/components/animated-logo"
import { ExternalLinkIcon } from "@/components/external-link-icon"
import { FadeInBackground } from "@/components/fade-in-background"
import { FadeIn } from "@/components/fade-in"

export default function Home() {
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

      {/* Content */}
      <main className="relative z-30 flex min-h-screen flex-col items-center justify-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center space-y-6 px-4">
          {/* Logo Section - Centered on page */}
          <AnimatedLogo />

          {/* Meta Description */}
          <FadeIn delay={500} duration={1200} className="max-w-xl text-center px-4">
            <p className="font-space-mono text-retro-display/80 text-xs md:text-sm font-normal tracking-wide">
              A selective development studio crafting high-impact systems and building long-term intellectual property.
            </p>
          </FadeIn>
        </div>
      </main>

      {/* Get In Touch Button - Bottom Center Tab with mailto link */}
      <FadeIn delay={800} duration={1000} className="group bottom-center-tab">
        <a href="mailto:hello@boldthin.gs" className="block">
          <div className="vintage-button-wrapper">
            <div className="vintage-button">
              <span className="font-space-mono text-xs tracking-wider uppercase flex items-center justify-center">
                GET IN TOUCH <ExternalLinkIcon className="ml-1.5 h-3 w-3" />
              </span>
            </div>
          </div>
        </a>
      </FadeIn>
    </div>
  )
}
