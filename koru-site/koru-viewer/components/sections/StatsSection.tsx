import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const STAT_COLORS_LIGHT = [
  "#0B6377", // Iara
  "#8B3D17", // Barro
  "#C72211", // Urucum
  "#707C36", // Mata
  "#9B6C22", // Mel
  "#DD560D", // Brasa
]

const STAT_COLORS_DARK = [
  "#35BDC8", // Jala
  "#DD560D", // Brasa
  "#92DCE2", // Maré
  "#9B6C22", // Mel
  "#BF505C", // Jambo
  "#C72211", // Urucum
]

interface Stat {
  value: string
  label: string
  description?: string
}

interface StatsSectionProps {
  badge?: string
  title?: string
  stats: Stat[]
  variant?: "light" | "dark" | "bordered"
  className?: string
}

function StatsSection({
  badge,
  title,
  stats,
  variant = "light",
  className,
}: StatsSectionProps) {
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
        {(badge || title) && (
          <div className="mb-14 flex flex-col items-center text-center gap-4">
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
            {title && (
              <h2
                id={titleId}
                className={cn(
                  "text-3xl md:text-4xl font-normal tracking-tight",
                  isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                )}
                style={{ fontFamily: "var(--heading)" }}
              >
                {title}
              </h2>
            )}
          </div>
        )}

        {variant === "bordered" ? (
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#0B6377]/20">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center text-center px-8 py-8 md:py-4 gap-1"
                aria-label={`${stat.value} ${stat.label}`}
              >
                <span
                  className="text-5xl md:text-6xl lg:text-7xl font-normal leading-none"
                  style={{
                    fontFamily: "var(--heading)",
                    color: STAT_COLORS_LIGHT[i % STAT_COLORS_LIGHT.length],
                  }}
                  aria-hidden="true"
                >
                  {stat.value}
                </span>
                <span
                  className="mt-3 text-xs font-semibold uppercase tracking-widest text-[#090E17]"
                  aria-hidden="true"
                >
                  {stat.label}
                </span>
                {stat.description && (
                  <span className="text-sm text-[#114F56] mt-1 max-w-[180px]">
                    {stat.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
            {stats.map((stat, i) => {
              const color = isDark
                ? STAT_COLORS_DARK[i % STAT_COLORS_DARK.length]
                : STAT_COLORS_LIGHT[i % STAT_COLORS_LIGHT.length]
              return (
                <div
                  key={i}
                  className="flex flex-col items-center text-center gap-1"
                  aria-label={`${stat.value} ${stat.label}`}
                >
                  <span
                    className="text-5xl md:text-6xl lg:text-7xl font-normal leading-none"
                    style={{ fontFamily: "var(--heading)", color }}
                    aria-hidden="true"
                  >
                    {stat.value}
                  </span>
                  <span
                    className={cn(
                      "mt-3 text-xs font-semibold uppercase tracking-widest",
                      isDark ? "text-[#92DCE2]" : "text-[#090E17]"
                    )}
                    aria-hidden="true"
                  >
                    {stat.label}
                  </span>
                  {stat.description && (
                    <span
                      className={cn(
                        "text-sm mt-1 max-w-[200px]",
                        isDark ? "text-[#92DCE2]/70" : "text-[#114F56]"
                      )}
                    >
                      {stat.description}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export { StatsSection }
export type { StatsSectionProps, Stat }
