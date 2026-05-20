import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SocialLink {
  label: string
  href: string
}

interface MediaHeroSectionProps {
  title: string
  titleLine2?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  mediaContent?: React.ReactNode
  socialLinks?: SocialLink[]
  variant?: "light" | "dark"
  className?: string
}

function MediaHeroSection({
  title,
  titleLine2,
  subtitle,
  ctaLabel,
  ctaHref,
  mediaContent,
  socialLinks,
  variant = "dark",
  className,
}: MediaHeroSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  return (
    <section
      className={cn(
        "relative w-full min-h-[85vh] flex flex-col overflow-hidden",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      {/* Media background layer */}
      {mediaContent ? (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {mediaContent}
          {/* Overlay gradient to ensure text readability */}
          <div
            className={cn(
              "absolute inset-0",
              isDark
                ? "bg-gradient-to-b from-black/70 via-black/40 to-black/90"
                : "bg-gradient-to-b from-white/60 via-white/30 to-white/80"
            )}
          />
        </div>
      ) : (
        /* Radial gradient background when no media */
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {isDark ? (
            <>
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, #0B363C 0%, #000000 60%)" }}
              />
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: "radial-gradient(ellipse 50% 40% at 75% 80%, #114F56 0%, transparent 60%)" }}
              />
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: "radial-gradient(ellipse 40% 30% at 20% 70%, #1A6872 0%, transparent 60%)" }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, #DEF7F9 0%, #ffffff 60%)" }}
              />
              <div
                className="absolute inset-0 opacity-40"
                style={{ background: "radial-gradient(ellipse 50% 40% at 80% 80%, #92DCE2 0%, transparent 60%)" }}
              />
            </>
          )}
        </div>
      )}

      {/* Main content — centered */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-24 md:py-32 text-center">
        {subtitle && (
          <p
            className={cn(
              "mb-5 text-sm font-medium uppercase tracking-widest",
              isDark ? "text-[#92DCE2]" : "text-[#0B6377]"
            )}
          >
            {subtitle}
          </p>
        )}

        <h1
          id={titleId}
          className={cn(
            "max-w-5xl text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[1.05] tracking-tight",
            isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
          )}
          style={{ fontFamily: "var(--heading)" }}
        >
          {title}
          {titleLine2 && (
            <>
              <br />
              <em
                className="not-italic italic"
                style={{ color: isDark ? "#35BDC8" : "#0B6377" }}
              >
                {titleLine2}
              </em>
            </>
          )}
        </h1>

        {ctaLabel && (
          <div className="mt-10">
            <Button
              size="lg"
              variant="outline"
              nativeButton={!ctaHref}
              className={cn(
                "px-8 h-12 text-sm font-semibold tracking-wide rounded-lg",
                isDark
                  ? "border-[#35BDC8] text-[#35BDC8] hover:bg-[#35BDC8]/10 bg-transparent"
                  : "border-[#0B6377] text-[#0B6377] hover:bg-[#0B6377]/5 bg-transparent"
              )}
              render={ctaHref ? <a href={ctaHref} /> : undefined}
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom row — social links */}
      {socialLinks && socialLinks.length > 0 && (
        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-1 px-6 py-5 border-t",
            isDark ? "border-[#1A6872]/50" : "border-[#0B6377]/30"
          )}
        >
          <span
            className={cn(
              "mr-4 text-xs font-semibold uppercase tracking-widest",
              isDark ? "text-[#92DCE2]" : "text-[#0B6377]"
            )}
          >
            Follow us
          </span>
          <div className="flex items-center gap-1">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  isDark
                    ? "text-[#92DCE2] hover:text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                    : "text-[#0B6377] hover:text-[#090E17] hover:bg-[#92DCE2]/20 focus-visible:outline-[#0B6377]"
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${link.label} (opens in new tab)`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export { MediaHeroSection }
export type { MediaHeroSectionProps, SocialLink }
