import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroProductDarkSectionProps {
  eyebrowLabel?: string
  eyebrowTag?: string
  title: string
  backgroundImage?: string
  primaryCta: { label: string; href?: string; icon?: React.ReactNode }
  secondaryCta?: { label: string; href?: string }
  tagline?: string
  className?: string
}

function HeroProductDarkSection({
  eyebrowLabel,
  eyebrowTag,
  title,
  backgroundImage,
  primaryCta,
  secondaryCta,
  tagline,
  className,
}: HeroProductDarkSectionProps) {
  const titleId = React.useId()

  return (
    <section
      className={cn("w-full bg-white px-6 py-10 md:py-14", className)}
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        {/* Photo / hero container */}
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Background: image or gradient fallback */}
          {backgroundImage ? (
            <img
              src={backgroundImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B363C] to-[#090E17]" />
          )}

          {/* Subtle dark overlay for readability on top of photos */}
          {backgroundImage && (
            <div className="absolute inset-0 bg-[#090E17]/40" />
          )}

          {/* Eyebrow row — top of image */}
          {(eyebrowLabel || eyebrowTag) && (
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-10">
              {eyebrowLabel ? (
                <span
                  className="text-[#DEF7F9] text-sm tracking-widest"
                  style={{ fontFamily: "var(--mono, 'Space Mono', monospace)" }}
                >
                  {eyebrowLabel}
                </span>
              ) : (
                <span />
              )}
              {eyebrowTag && (
                <span
                  className="text-[#DEF7F9] text-sm tracking-widest"
                  style={{ fontFamily: "var(--mono, 'Space Mono', monospace)" }}
                >
                  {eyebrowTag}
                </span>
              )}
            </div>
          )}

          {/* Display heading — centered, ~60% from top */}
          <div
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ paddingTop: "8%" }}
          >
            <h1
              id={titleId}
              className="text-center text-[#F2F2F2] px-6 leading-none tracking-tight"
              style={{
                fontFamily: "var(--heading)",
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
              }}
            >
              {title}
            </h1>
          </div>

          {/* CTA buttons — bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-6 py-6 z-10">
            {/* Primary button */}
            {primaryCta.href ? (
              <a
                href={primaryCta.href}
                className={cn(
                  "inline-flex items-center gap-2 px-6 h-11 text-sm font-semibold rounded-lg transition-colors",
                  "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                )}
              >
                {primaryCta.icon && (
                  <span aria-hidden="true">{primaryCta.icon}</span>
                )}
                {primaryCta.label}
              </a>
            ) : (
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 px-6 h-11 text-sm font-semibold rounded-lg transition-colors cursor-pointer",
                  "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                )}
              >
                {primaryCta.icon && (
                  <span aria-hidden="true">{primaryCta.icon}</span>
                )}
                {primaryCta.label}
              </button>
            )}

            {/* Secondary / outline button */}
            {secondaryCta &&
              (secondaryCta.href ? (
                <a
                  href={secondaryCta.href}
                  className={cn(
                    "inline-flex items-center px-6 h-11 text-sm font-semibold rounded-lg transition-colors",
                    "border border-[#DEF7F9]/60 text-[#F2F2F2] hover:bg-[#DEF7F9]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                  )}
                >
                  {secondaryCta.label}
                </a>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center px-6 h-11 text-sm font-semibold rounded-lg transition-colors cursor-pointer",
                    "border border-[#DEF7F9]/60 text-[#F2F2F2] hover:bg-[#DEF7F9]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                  )}
                >
                  {secondaryCta.label}
                </button>
              ))}
          </div>
        </div>

        {/* Tagline below photo */}
        {tagline && (
          <p
            className="text-center text-[#090E17] leading-tight"
            style={{
              fontFamily: "var(--heading)",
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            }}
          >
            {tagline}
          </p>
        )}
      </div>
    </section>
  )
}

export { HeroProductDarkSection }
export type { HeroProductDarkSectionProps }
