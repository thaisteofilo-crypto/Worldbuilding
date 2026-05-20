import * as React from "react"
import { cn } from "@/lib/utils"

// Rotating secondary brand colors for stat values
const TICKER_COLORS_LIGHT = [
  "#0B6377", // Iara
  "#8B3D17", // Barro
  "#9B6C22", // Mel
  "#707C36", // Mata
  "#C72211", // Urucum
  "#BF505C", // Jambo
  "#DD560D", // Brasa
]

const TICKER_COLORS_DARK = [
  "#35BDC8", // Jala
  "#DD560D", // Brasa
  "#9B6C22", // Mel
  "#BF505C", // Jambo
  "#92DCE2", // Maré
  "#C72211", // Urucum
  "#707C36", // Mata
]

interface TickerStat {
  value: string
  label: string
}

interface StatsTickerSectionProps {
  stats: TickerStat[]
  variant?: "light" | "dark"
  className?: string
}

function StatsTickerSection({
  stats,
  variant = "light",
  className,
}: StatsTickerSectionProps) {
  const isDark = variant === "dark"
  const colors = isDark ? TICKER_COLORS_DARK : TICKER_COLORS_LIGHT

  // Duplicate the array so the marquee loop is seamless
  const row1 = [...stats, ...stats]
  const row2 = [...stats, ...stats]

  return (
    <section
      className={cn(
        "w-full overflow-hidden py-12 md:py-16",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-label="Statistics ticker"
    >
      {/* Keyframe animations + reduced-motion pause */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-row-1,
          .ticker-row-2 {
            animation-play-state: paused !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6" aria-hidden="true">
        {/* Row 1 — left to right */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div
            className="ticker-row-1 flex items-center gap-0 whitespace-nowrap w-max"
            style={{ animation: "marquee 25s linear infinite" }}
            aria-hidden="true"
          >
            {row1.map((stat, i) => (
              <TickerItem
                key={i}
                stat={stat}
                color={colors[i % colors.length]}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Row 2 — right to left */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div
            className="ticker-row-2 flex items-center gap-0 whitespace-nowrap w-max"
            style={{ animation: "marquee-reverse 20s linear infinite" }}
            aria-hidden="true"
          >
            {row2.map((stat, i) => (
              <TickerItem
                key={i}
                // Offset palette so row 2 starts on a different color
                stat={stat}
                color={colors[(i + 3) % colors.length]}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Accessible fallback — visually hidden, readable by screen readers */}
      <ul className="sr-only">
        {stats.map((stat, i) => (
          <li key={i}>
            {stat.value} — {stat.label}
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Internal sub-component
// ---------------------------------------------------------------------------

interface TickerItemProps {
  stat: TickerStat
  color: string
  isDark: boolean
}

function TickerItem({ stat, color, isDark }: TickerItemProps) {
  return (
    <span className="inline-flex items-center gap-5 px-6 md:px-8">
      {/* Stat block */}
      <span className="inline-flex flex-col items-center gap-1 text-center">
        <span
          className="text-4xl md:text-5xl font-normal leading-none"
          style={{ fontFamily: "var(--heading)", color }}
        >
          {stat.value}
        </span>
        <span
          className={cn(
            "text-[10px] md:text-xs font-mono font-semibold uppercase tracking-widest leading-none",
            isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
          )}
        >
          {stat.label}
        </span>
      </span>

      {/* Separator */}
      <span
        className={cn(
          "inline-block w-px h-10 shrink-0",
          isDark ? "bg-white/15" : "bg-[#0B6377]/40"
        )}
        aria-hidden="true"
      />
    </span>
  )
}

export { StatsTickerSection }
export type { StatsTickerSectionProps, TickerStat }
