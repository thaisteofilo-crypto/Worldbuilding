import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface LogoItem {
  name: string
  initial: string
}

interface LogoMarqueeSectionProps {
  badge?: string
  title?: string
  logos: LogoItem[]
  variant?: "light" | "dark"
  className?: string
}

// Each logo card rendered inside the track
function LogoCard({
  item,
  isDark,
}: {
  item: LogoItem
  isDark: boolean
}) {
  const accentColor = isDark ? "#35BDC8" : "#0B6377"

  return (
    <div
      className={cn(
        "flex-shrink-0 flex flex-col items-center justify-center gap-1 rounded-xl border select-none",
        isDark
          ? "bg-white/5 border-white/10"
          : "bg-[#F2F2F2] border-[#0B6377]/20"
      )}
      style={{ width: 120, height: 48 }}
      aria-hidden="true"
    >
      <span
        className="text-xs font-bold leading-none"
        style={{ color: accentColor }}
      >
        {item.initial}
      </span>
      <span
        className="text-[10px] leading-none font-medium truncate max-w-[100px] px-2 text-center"
        style={{
          color: isDark ? "#92DCE2" : "#1A6872",
        }}
      >
        {item.name}
      </span>
    </div>
  )
}

function LogoMarqueeSection({
  badge,
  title,
  logos,
  variant = "light",
  className,
}: LogoMarqueeSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  // Duplicate logos twice to guarantee a seamless loop even with few items
  const row1 = [...logos, ...logos]
  const row2 = [...logos, ...logos]

  return (
    <section
      className={cn(
        "w-full py-16 overflow-hidden",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={title ? titleId : undefined}
    >
      {/* ── Keyframe definitions ─────────────────────────────────────── */}
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; }
        }
      `}</style>

      {/* ── Optional header ──────────────────────────────────────────── */}
      {(badge || title) && (
        <div className="flex flex-col items-center gap-4 mb-12 px-6">
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
          {title && (
            <h2
              id={titleId}
              className="text-2xl md:text-3xl font-normal tracking-tight text-center max-w-xl"
              style={{
                fontFamily: "var(--heading)",
                color: isDark ? "#F2F2F2" : "#090E17",
              }}
            >
              {title}
            </h2>
          )}
        </div>
      )}

      {/* Accessible fallback — visually hidden, readable by screen readers */}
      <ul className="sr-only" aria-label="Partner logos">
        {logos.map((logo, i) => (
          <li key={i}>{logo.name}</li>
        ))}
      </ul>

      {/* ── Marquee rows ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4" aria-hidden="true">
        {/* Row 1: scrolls left → */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            className="marquee-track flex gap-4"
            style={{
              animation: "marquee-left 30s linear infinite",
              width: "max-content",
            }}
          >
            {row1.map((item, i) => (
              <LogoCard key={`r1-${i}`} item={item} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Row 2: scrolls right ← (opposite direction) */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div
            className="marquee-track flex gap-4"
            style={{
              animation: "marquee-right 30s linear infinite",
              width: "max-content",
            }}
          >
            {row2.map((item, i) => (
              <LogoCard key={`r2-${i}`} item={item} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { LogoMarqueeSection }
export type { LogoMarqueeSectionProps, LogoItem }
