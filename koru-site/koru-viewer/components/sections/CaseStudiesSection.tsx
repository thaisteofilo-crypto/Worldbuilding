import * as React from "react"
import { cn } from "@/lib/utils"

interface CaseStudy {
  company: string
  logoSrc?: string
  description: string
  stat: string
  statLabel: string
  href?: string
}

interface CaseStudiesSectionProps {
  title?: string
  subtitle?: string
  items: CaseStudy[]
  variant?: "light" | "dark"
  className?: string
}

function CompanyLogo({ company, logoSrc, dark }: { company: string; logoSrc?: string; dark: boolean }) {
  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={company}
        className="h-7 max-w-[120px] object-contain"
        style={{ filter: dark ? "brightness(0) invert(1) sepia(1) hue-rotate(155deg) saturate(2)" : "none" }}
      />
    )
  }
  return (
    <span
      className="text-sm font-semibold tracking-tight"
      style={{ color: dark ? "#DEF7F9" : "#090E17" }}
    >
      {company}
    </span>
  )
}

function CaseStudyCard({ item, dark }: { item: CaseStudy; dark: boolean }) {
  const cardBg = dark ? "bg-[#0B363C]" : "bg-[#F2F2F2]"
  const statColor = dark ? "#35BDC8" : "#0B6377"
  const statLabelColor = dark ? "#92DCE2" : "#114F56"
  const descriptionColor = dark ? "#DEF7F9" : "#090E17"
  const readMoreColor = dark ? "#35BDC8" : "#0B6377"
  const readMoreBorder = dark ? "#1A6872" : "#0B6377"
  const readMoreHoverBg = dark ? "#1A6872" : "#DEF7F9"

  return (
    <article
      className={cn(
        "relative flex flex-col gap-0 rounded-2xl p-6 overflow-hidden",
        cardBg,
        "transition-shadow duration-200 hover:shadow-lg"
      )}
    >
      {/* Top row: logo + read more */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <CompanyLogo company={item.company} logoSrc={item.logoSrc} dark={dark} />

        {item.href ? (
          <a
            href={item.href}
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: readMoreColor,
              borderColor: readMoreBorder,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = readMoreHoverBg
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.background = "transparent"
            }}
            aria-label={`Ler mais sobre ${item.company}`}
          >
            Read more →
          </a>
        ) : (
          <span
            className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-default select-none"
            style={{
              color: readMoreColor,
              borderColor: readMoreBorder,
            }}
            aria-hidden="true"
          >
            Read more →
          </span>
        )}
      </div>

      {/* Description */}
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: descriptionColor }}
      >
        {item.description}
      </p>

      {/* Spacer pushes stat to bottom */}
      <div className="mt-6" />

      {/* Bottom: big stat + label */}
      <div className="flex flex-col gap-0.5">
        <span
          className="text-5xl font-bold leading-none"
          style={{
            color: statColor,
            fontFamily: "var(--heading)",
          }}
          aria-label={`${item.stat} — ${item.statLabel}`}
        >
          {item.stat}
        </span>
        <span
          className="text-xs mt-1"
          style={{ color: statLabelColor }}
        >
          {item.statLabel}
        </span>
      </div>
    </article>
  )
}

function CaseStudiesSection({
  title,
  subtitle,
  items,
  variant = "light",
  className,
}: CaseStudiesSectionProps) {
  const dark = variant === "dark"
  const sectionBg = dark ? "bg-black" : "bg-white"
  const headingColor = dark ? "#F2F2F2" : "#090E17"
  const subtitleColor = dark ? "#92DCE2" : "#1A6872"
  const titleId = React.useId()

  return (
    <section
      className={cn("w-full px-6 py-20 md:py-28", sectionBg, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        {(title || subtitle) && (
          <div className="mb-12 flex flex-col gap-3 items-center text-center">
            {title && (
              <h2
                id={titleId}
                className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
                style={{ fontFamily: "var(--heading)", color: headingColor }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="max-w-2xl text-base md:text-lg leading-relaxed"
                style={{ color: subtitleColor }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <CaseStudyCard key={`${item.company}-${index}`} item={item} dark={dark} />
          ))}
        </div>
      </div>
    </section>
  )
}

export { CaseStudiesSection }
export type { CaseStudiesSectionProps, CaseStudy }
