import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps {
  badge?: string
  title: string
  titleHighlight?: string
  subtitle?: string
  description?: string
  primaryCta?: { label: string; href?: string }
  secondaryCta?: { label: string; href?: string }
  variant?: "light" | "dark"
  align?: "left" | "center"
  className?: string
}

function HeroSection({
  badge,
  title,
  titleHighlight,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  variant = "light",
  align = "center",
  className,
}: HeroSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  return (
    <section
      className={cn(
        "w-full px-6 py-24 md:py-32",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "mx-auto max-w-4xl flex flex-col gap-6",
          align === "center" && "items-center text-center",
          align === "left" && "items-start text-left"
        )}
      >
        {badge && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs tracking-widest uppercase px-3 py-1 font-medium font-mono",
              isDark
                ? "border-white/10 text-[#92DCE2] bg-white/5"
                : "border-[#090E17]/10 text-[#0B6377] bg-[#0B6377]/5"
            )}
          >
            {badge}
          </Badge>
        )}

        <h1
          id={titleId}
          className="text-4xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight"
          style={{
            fontFamily: "var(--heading)",
            color: isDark ? "#F2F2F2" : "#090E17",
          }}
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
        </h1>

        {subtitle && (
          <p
            className="text-xl md:text-2xl font-medium"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#92DCE2" : "#1A6872",
            }}
          >
            {subtitle}
          </p>
        )}

        {description && (
          <p
            className={cn(
              "text-base md:text-lg max-w-2xl leading-relaxed",
              isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
            )}
          >
            {description}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div
            className={cn(
              "flex flex-wrap gap-3 mt-2",
              align === "center" && "justify-center"
            )}
          >
            {primaryCta && (
              <Button
                size="lg"
                nativeButton={!primaryCta.href}
                className={cn(
                  "px-7 h-11 text-sm font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2",
                  isDark
                    ? "bg-[#35BDC8] text-[#090E17] hover:bg-[#2CA0AB] focus-visible:outline-[#35BDC8]"
                    : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-[#0B6377]"
                )}
                render={primaryCta.href ? <a href={primaryCta.href} /> : undefined}
              >
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Button
                size="lg"
                variant="outline"
                nativeButton={!secondaryCta.href}
                className={cn(
                  "px-7 h-11 text-sm font-semibold rounded-lg bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2",
                  isDark
                    ? "border-[#1A6872] text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                    : "border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9] focus-visible:outline-[#0B6377]"
                )}
                render={secondaryCta.href ? <a href={secondaryCta.href} /> : undefined}
              >
                {secondaryCta.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export { HeroSection }
export type { HeroSectionProps }
