import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Secondary brand colors for company logo backgrounds
const ACCENT_PALETTE = [
  "#0B6377", // Iara — primary teal
  "#8B3D17", // Barro — rust
  "#9B6C22", // Mel — amber
  "#707C36", // Mata — olive
  "#C72211", // Urucum — crimson
  "#BF505C", // Jambo — rose
  "#DD560D", // Brasa — orange
]

interface TestimonialGridItem {
  company: string
  companyInitial: string
  quote?: string
  stat?: { value: string; label: string }
  accentColor?: string // for corner dots and stat color
  featured?: boolean   // if true: bg uses brand color
}

interface TestimonialGridSectionProps {
  badge?: string
  title?: string
  subtitle?: string
  items: TestimonialGridItem[]
  variant?: "light" | "dark"
  className?: string
}

function TestimonialGridItem({
  item,
  index,
  isDark,
}: {
  item: TestimonialGridItem
  index: number
  isDark: boolean
}) {
  const accent = item.accentColor ?? ACCENT_PALETTE[index % ACCENT_PALETTE.length]
  const isFeatured = item.featured === true

  const cardBase = cn(
    "relative flex flex-col rounded-2xl border p-5 transition-all duration-200",
    "min-h-[280px] overflow-hidden"
  )

  const cardTheme = isFeatured
    ? "bg-[#0B6377] border-transparent shadow-xl"
    : isDark
    ? "bg-[#0B363C] border-[#1A6872] hover:bg-[#114F56]"
    : "bg-[#F2F2F2] border-[#0B6377] shadow-sm hover:shadow-md"

  // Company logo initial box — featured: lighter teal bg with F2F2F2 text; non-featured: accent bg with F2F2F2 text
  const logoBoxBg = isFeatured ? "#1A6872" : accent
  const logoBoxText = "#F2F2F2"
  const logoBox = (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold leading-none select-none"
      style={{ background: logoBoxBg, color: logoBoxText }}
      aria-hidden="true"
    >
      {item.companyInitial}
    </div>
  )

  // "Read more →" link
  const readMoreColor = isFeatured
    ? "#DEF7F9"
    : isDark
    ? "#35BDC8"
    : "#0B6377"

  const quoteColor = isFeatured
    ? "#F2F2F2"
    : isDark
    ? "#DEF7F9"
    : "#090E17"

  const muteColor = isFeatured
    ? "#DEF7F9"
    : isDark
    ? "#92DCE2"
    : "#1A6872"

  const companyColor = isFeatured
    ? "#F2F2F2"
    : isDark
    ? "#F2F2F2"
    : "#090E17"

  const statColor = isFeatured ? "#DEF7F9" : accent

  return (
    <article className={cn(cardBase, cardTheme)} aria-label={`Depoimento de ${item.company}`}>
      {/* Top row: logo + Read more */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          {logoBox}
          <span
            className="text-sm font-semibold leading-tight"
            style={{ color: companyColor }}
          >
            {item.company}
          </span>
        </div>

        <a
          href="#"
          className="shrink-0 flex items-center gap-0.5 text-xs font-medium underline-offset-2 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{ color: readMoreColor }}
          onClick={(e) => e.preventDefault()}
          aria-label={`Ler mais sobre ${item.company}`}
        >
          Leia mais
          <svg
            className="h-3 w-3 ml-0.5"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path d="M2.5 6h7M6.5 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Quote body */}
      {item.quote && (
        <blockquote
          className="flex-1 text-sm leading-relaxed mb-4"
          style={{ color: quoteColor }}
        >
          &ldquo;{item.quote}&rdquo;
        </blockquote>
      )}

      {/* Bottom: stat OR muted fallback */}
      <div className="mt-auto">
        {item.stat ? (
          <div className="flex flex-col gap-0.5">
            <span
              className="text-3xl font-normal leading-none tracking-tight"
              style={{ fontFamily: "var(--heading)", color: statColor }}
              aria-label={`${item.stat.value} — ${item.stat.label}`}
            >
              {item.stat.value}
            </span>
            <span
              className="text-xs font-medium mt-1"
              style={{ color: muteColor }}
            >
              {item.stat.label}
            </span>
          </div>
        ) : (
          <p className="text-xs" style={{ color: muteColor }}>
            Caso de sucesso
          </p>
        )}
      </div>
    </article>
  )
}

function TestimonialGridSection({
  badge,
  title,
  subtitle,
  items,
  variant = "light",
  className,
}: TestimonialGridSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        {(badge || title || subtitle) && (
          <div className="mb-12 flex flex-col items-center text-center gap-4">
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

            {title && (
              <h2
                id={titleId}
                className={cn(
                  "text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight max-w-3xl",
                  isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                )}
                style={{ fontFamily: "var(--heading)" }}
              >
                {title}
              </h2>
            )}

            {subtitle && (
              <p
                className={cn(
                  "text-base md:text-lg max-w-2xl leading-relaxed",
                  isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <TestimonialGridItem
              key={index}
              item={item}
              index={index}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { TestimonialGridSection }
export type { TestimonialGridSectionProps, TestimonialGridItem }
