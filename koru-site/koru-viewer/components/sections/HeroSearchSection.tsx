import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight } from "lucide-react"

interface HeroSearchSectionProps {
  title: string
  subtitle?: string
  placeholder?: string
  suggestions?: string[]
  variant?: "light" | "dark"
  className?: string
}

function HeroSearchSection({
  title,
  subtitle,
  placeholder = "Ask anything…",
  suggestions = [],
  variant = "dark",
  className,
}: HeroSearchSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  return (
    <section
      className={cn(
        "w-full px-6 py-24 md:py-36",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-3xl flex flex-col items-center text-center gap-8">
        {/* Wordmark / logo area */}
        <div className="flex flex-col items-center gap-3">
          {/* Brand dot accent */}
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{ background: isDark ? "#35BDC8" : "#0B6377" }}
            aria-hidden="true"
          >
            <Search className="h-5 w-5" style={{ color: isDark ? "#090E17" : "#F2F2F2" }} />
          </div>

          <h1
            id={titleId}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#F2F2F2" : "#090E17",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              className={cn(
                "text-base md:text-lg max-w-xl leading-relaxed mt-1",
                isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Search input — visual only */}
        <div
          className={cn(
            "w-full flex items-center gap-3 px-4 rounded-xl border h-14 transition-colors",
            isDark
              ? "bg-[#0B363C]/60 border-[#1A6872] hover:border-[#35BDC8]/60"
              : "bg-[#F2F2F2] border-[#0B6377] hover:border-[#1A6872] shadow-sm"
          )}
          role="search"
          aria-label="Search bar (visual)"
        >
          <Search
            className="h-4 w-4 shrink-0"
            style={{ color: isDark ? "#35BDC8" : "#0B6377" }}
            aria-hidden="true"
          />
          <span
            className={cn(
              "flex-1 text-left text-sm truncate",
              isDark ? "text-[#92DCE2]/70" : "text-[#090E17]/70"
            )}
          >
            {placeholder}
          </span>
          <div
            className={cn(
              "shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
              isDark
                ? "bg-[#35BDC8] text-[#090E17]"
                : "bg-[#0B6377] text-[#F2F2F2]"
            )}
            aria-hidden="true"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Suggestion chips */}
        {suggestions.length > 0 && (
          <div
            className="flex flex-wrap justify-center gap-2"
            role="list"
            aria-label="Suggested searches"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                role="listitem"
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium cursor-default transition-colors",
                  isDark
                    ? "border-[#1A6872] bg-[#0B363C]/50 text-[#DEF7F9] hover:bg-[#1A6872]/40 hover:border-[#35BDC8]/50"
                    : "border-[#0B6377] bg-[#F2F2F2] text-[#0B6377] hover:bg-[#DEF7F9] hover:border-[#1A6872]"
                )}
              >
                <Search
                  className="h-3 w-3 shrink-0"
                  style={{ color: isDark ? "#35BDC8" : "#0B6377" }}
                  aria-hidden="true"
                />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export { HeroSearchSection }
export type { HeroSearchSectionProps }
