import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface BentoItem {
  title: string
  description?: string
  icon?: React.ElementType
  span?: "1" | "2" | "full"
  accentColor?: string
  stat?: string
}

interface BentoGridSectionProps {
  badge?: string
  title: string
  subtitle?: string
  items: BentoItem[]
  variant?: "light" | "dark"
  className?: string
}

function BentoGridSection({
  badge,
  title,
  subtitle,
  items,
  variant = "light",
  className,
}: BentoGridSectionProps) {
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center gap-4">
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs tracking-widest uppercase px-3 font-medium font-mono",
                isDark
                  ? "border-white/10 text-[#92DCE2] bg-white/5"
                  : "border-[#090E17]/10 text-[#0B6377] bg-[#0B6377]/5"
              )}
            >
              {badge}
            </Badge>
          )}
          <h2
            id={titleId}
            className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#F2F2F2" : "#090E17",
            }}
          >
            {title}
          </h2>
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

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((item, index) => {
            const Icon = item.icon
            // Dark mode: unify stats + icons in Alva for AA contrast on Una bg
            const accent = isDark ? "#77C5D5" : (item.accentColor ?? "#0B6377")
            const isWide = item.span === "2"
            const isFull = item.span === "full"
            const hasStat = Boolean(item.stat)

            return (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6 transition-all duration-200",
                  // col span
                  isWide && "sm:col-span-2 lg:col-span-2",
                  isFull && "sm:col-span-2 lg:col-span-3",
                  hasStat && !isWide && !isFull ? "p-6" : isWide || isFull ? "p-8" : "p-6",
                  isDark
                    ? "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                    : "bg-[#F2F2F2] border-[#0B6377]/30 shadow-sm hover:shadow-md"
                )}
              >
                {/* Stat — displayed prominently at top when present */}
                {item.stat && (
                  <>
                    <span className="sr-only">{item.stat} — </span>
                    <span
                      className={cn(
                        "block font-normal leading-none mb-3",
                        isWide || isFull ? "text-6xl md:text-7xl" : "text-5xl"
                      )}
                      style={{ fontFamily: "var(--heading)", color: accent }}
                      aria-hidden="true"
                    >
                      {item.stat}
                    </span>
                  </>
                )}

                {/* Icon */}
                {Icon && (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 shrink-0"
                    style={{ background: `${accent}26` }}
                    aria-hidden="true"
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: accent }}
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Text */}
                <div className="flex flex-col gap-2 mt-auto">
                  <p
                    className={cn(
                      "font-semibold",
                      isWide || isFull ? "text-lg" : "text-base",
                      isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { BentoGridSection }
export type { BentoGridSectionProps, BentoItem }
