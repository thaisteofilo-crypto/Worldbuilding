import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Rotates through primary + secondary brand colors for icon variety
const ICON_PALETTE = [
  { bg: "#0B6377", text: "#F2F2F2" }, // Iara — primary teal
  { bg: "#8B3D17", text: "#F2F2F2" }, // Barro — rust
  { bg: "#9B6C22", text: "#F2F2F2" }, // Mel — amber
  { bg: "#707C36", text: "#F2F2F2" }, // Mata — olive
  { bg: "#C72211", text: "#F2F2F2" }, // Urucum — crimson
  { bg: "#BF505C", text: "#F2F2F2" }, // Jambo — rose
  { bg: "#DD560D", text: "#090E17" }, // Brasa — orange (3.1:1 — use dark text for AA)
]

interface Feature {
  icon?: React.ElementType
  title: string
  description: string
}

interface FeatureSectionProps {
  badge?: string
  title: string
  subtitle?: string
  features: Feature[]
  columns?: 2 | 3 | 4
  layout?: "cards" | "minimal" | "numbered"
  variant?: "light" | "dark"
  className?: string
}

function FeatureSection({
  badge,
  title,
  subtitle,
  features,
  columns = 3,
  layout = "cards",
  variant = "light",
  className,
}: FeatureSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns]

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

        <ul className={cn("grid grid-cols-1 gap-6 list-none p-0 m-0", gridCols)}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            const palette = ICON_PALETTE[index % ICON_PALETTE.length]

            if (layout === "cards") {
              return (
                <li
                  key={index}
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl border p-6 transition-colors",
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                      : "border-[#0B6377]/40 bg-[#F2F2F2] hover:bg-[#DEF7F9]/40"
                  )}
                >
                  {Icon && (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: palette.bg }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: palette.text }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                    >
                      {feature.title}
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </li>
              )
            }

            if (layout === "minimal") {
              return (
                <li key={index} className="flex gap-4 items-start">
                  {Icon && (
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5"
                      style={{ background: palette.bg }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: palette.text }}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                    >
                      {feature.title}
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </li>
              )
            }

            if (layout === "numbered") {
              return (
                <li key={index} className="relative flex flex-col gap-3 pt-2">
                  <span
                    className="absolute -top-2 left-0 text-7xl font-bold leading-none select-none pointer-events-none"
                    style={{
                      fontFamily: "var(--heading)",
                      color: palette.bg,
                      opacity: 0.12,
                    }}
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 mt-6 flex flex-col gap-2">
                    {Icon && (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl mb-1"
                        style={{ background: palette.bg }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: palette.text }}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                    <p
                      className={cn(
                        "text-base font-semibold",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                    >
                      {feature.title}
                    </p>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {feature.description}
                    </p>
                  </div>
                </li>
              )
            }

            return null
          })}
        </ul>
      </div>
    </section>
  )
}

export { FeatureSection }
export type { FeatureSectionProps, Feature }
