import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CTASectionProps {
  badge?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryCta: { label: string; href?: string }
  secondaryCta?: { label: string; href?: string }
  variant?: "light" | "dark"
  className?: string
}

function CTASection({
  badge,
  title,
  titleHighlight,
  description,
  primaryCta,
  secondaryCta,
  variant = "light",
  className,
}: CTASectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      {/* Inner container with accent border on light, subtle border on dark */}
      <div
        className={cn(
          "mx-auto max-w-4xl rounded-2xl px-8 py-16 md:py-20 flex flex-col items-center text-center gap-6",
          isDark
            ? "border border-[#1A6872] bg-[#0B363C]"
            : "border border-[#0B6377] bg-[#F2F2F2]"
        )}
      >
        {badge && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs tracking-widest uppercase px-3 font-medium font-mono",
              isDark
                ? "border-[#1A6872] text-[#92DCE2] bg-[#0B363C]"
                : "border-[#0B6377] text-[#0B6377] bg-[#DEF7F9]"
            )}
          >
            {badge}
          </Badge>
        )}

        <h2
          id={titleId}
          className={cn(
            "text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-tight max-w-2xl",
            isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
          )}
          style={{ fontFamily: "var(--heading)" }}
        >
          {title}
          {titleHighlight && (
            <>
              {" "}
              <em
                className="not-italic italic"
                style={{ color: isDark ? "#35BDC8" : "#0B6377" }}
              >
                {titleHighlight}
              </em>
            </>
          )}
        </h2>

        {description && (
          <p
            className={cn(
              "text-base md:text-lg leading-relaxed max-w-xl",
              isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
            )}
          >
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Button
            size="lg"
            className={cn(
              "px-7 h-11 text-sm font-semibold rounded-lg",
              isDark
                ? "bg-[#35BDC8] text-[#090E17] hover:bg-[#2CA0AB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
            )}
            nativeButton={!primaryCta.href}
            render={primaryCta.href ? <a href={primaryCta.href} /> : undefined}
          >
            {primaryCta.label}
          </Button>

          {secondaryCta && (
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "px-7 h-11 text-sm font-semibold rounded-lg bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2",
                isDark
                  ? "border-[#1A6872] text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                  : "border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9] focus-visible:outline-[#0B6377]"
              )}
              nativeButton={!secondaryCta.href}
              render={secondaryCta.href ? <a href={secondaryCta.href} /> : undefined}
            >
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

export { CTASection }
export type { CTASectionProps }
