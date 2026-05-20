import * as React from "react"
import { cn } from "@/lib/utils"

interface SocialLink {
  label: string
  href: string
}

interface HeroDarkMediaSectionProps {
  titleLine1: string
  titleLine2: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  backgroundImage?: string
  socialLinks?: SocialLink[]
  className?: string
}

function HeroDarkMediaSection({
  titleLine1,
  titleLine2,
  subtitle,
  ctaLabel,
  ctaHref,
  backgroundImage,
  socialLinks,
  className,
}: HeroDarkMediaSectionProps) {
  const titleId = React.useId()

  const backgroundStyle: React.CSSProperties = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {}

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative w-full min-h-screen flex flex-col",
        !backgroundImage &&
          "bg-gradient-to-b from-[#0B363C] via-[#090E17] to-[#09080F]",
        className
      )}
      style={backgroundStyle}
    >
      {/* Overlay gradient when using background image */}
      {backgroundImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#0B363C]/60 via-[#090E17]/70 to-[#090E17]/90 pointer-events-none"
        />
      )}

      {/* Main content — grows to fill vertical space */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <h1
          id={titleId}
          className="text-[3rem] leading-[1.05] md:text-[5rem] lg:text-[6rem] font-normal tracking-tight text-[#F2F2F2]"
          style={{ fontFamily: "var(--heading)" }}
        >
          <span className="block">{titleLine1}</span>
          <span className="block">{titleLine2}</span>
        </h1>

        {subtitle && (
          <p
            className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-[#92DCE2]"
          >
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <div className="mt-10">
            <a
              href={ctaHref ?? "#"}
              className={cn(
                "inline-flex items-center justify-center gap-2",
                "rounded-lg border border-[#1A6872] px-8 py-3",
                "text-sm font-medium tracking-wide text-[#DEF7F9]",
                "transition-colors duration-200",
                "hover:bg-[#1A6872]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35BDC8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090E17]"
              )}
            >
              {ctaLabel}
            </a>
          </div>
        )}
      </div>

      {/* Bottom social row */}
      {socialLinks && socialLinks.length > 0 && (
        <div className="relative z-10 border-t border-[#1A6872]/40 px-6 py-5">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <span className="text-xs uppercase tracking-widest text-[#92DCE2]"
              style={{ fontFamily: "var(--mono, ui-monospace, monospace)" }}>
              Follow us
            </span>
            <div className="flex items-center gap-5">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-xs uppercase tracking-widest text-[#DEF7F9] transition-colors duration-200 hover:text-[#F2F2F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${link.label} (opens in new tab)`}
                  style={{ fontFamily: "var(--mono, ui-monospace, monospace)" }}
                >
                  {link.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export { HeroDarkMediaSection }
export type { HeroDarkMediaSectionProps, SocialLink }
