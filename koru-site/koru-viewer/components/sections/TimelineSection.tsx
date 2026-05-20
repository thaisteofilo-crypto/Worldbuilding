import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

interface TimelineEvent {
  date: string
  title: string
  description?: string
}

interface TimelineSectionProps {
  badge?: string
  title: string
  description?: string
  link?: { label: string; href: string }
  events: TimelineEvent[]
  variant?: "light" | "dark"
  className?: string
}

function TimelineSection({
  badge,
  title,
  description,
  link,
  events,
  variant = "light",
  className,
}: TimelineSectionProps) {
  const isDark = variant === "dark"
  const [activeIndex, setActiveIndex] = React.useState(0)
  const titleId = React.useId()
  const trackId = React.useId()

  const activeEvent = events[activeIndex] ?? null

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">

          {/* Left column — heading + description + link */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-16">
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "w-fit text-xs tracking-widest uppercase px-3 py-1 font-medium",
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
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
              style={{
                fontFamily: "var(--heading)",
                color: isDark ? "#F2F2F2" : "#090E17",
              }}
            >
              {title}
            </h2>

            {description && (
              <p
                className={cn(
                  "text-base leading-relaxed",
                  isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                )}
              >
                {description}
              </p>
            )}

            {link && (
              <a
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors w-fit",
                  isDark
                    ? "text-[#35BDC8] hover:text-[#77C5D5]"
                    : "text-[#0B6377] hover:text-[#1A6872]"
                )}
              >
                {link.label}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}

            {/* Active event card — visible on lg+ beside the left column */}
            {activeEvent && (
              <div
                className={cn(
                  "hidden lg:flex flex-col gap-2 rounded-2xl border p-5 mt-4",
                  isDark
                    ? "border-[#35BDC8]/40 bg-[#0B363C]"
                    : "border-[#0B6377]/30 bg-[#DEF7F9]/40"
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest font-mono",
                    isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                  )}
                >
                  {activeEvent.date}
                </span>
                <p
                  className={cn(
                    "text-base font-semibold leading-snug",
                    isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                  )}
                >
                  {activeEvent.title}
                </p>
                {activeEvent.description && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-[#DEF7F9]/70" : "text-[#1A6872]"
                    )}
                  >
                    {activeEvent.description}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column — horizontal timeline scrubber + vertical event list */}
          <div className="flex flex-col gap-8">

            {/* Horizontal scrubber track */}
            <div
              className="relative"
              role="group"
              aria-labelledby={trackId}
            >
              <p id={trackId} className="sr-only">
                Timeline de eventos — selecione um evento para ver detalhes
              </p>

              {/* Track line */}
              <div
                className={cn(
                  "relative h-px w-full rounded-full",
                  isDark ? "bg-[#1A6872]" : "bg-[#0B6377]/30"
                )}
              >
                {/* Filled progress */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${events.length > 1 ? (activeIndex / (events.length - 1)) * 100 : 100}%`,
                    background: isDark ? "#35BDC8" : "#0B6377",
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Marker dots */}
              <div className="relative flex justify-between mt-0" aria-hidden="true">
                {events.map((event, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    title={event.date}
                    className={cn(
                      "-mt-2 h-4 w-4 rounded-full border-2 transition-all duration-200 cursor-pointer outline-none",
                      "focus-visible:ring-2 focus-visible:ring-offset-2",
                      isDark
                        ? "focus-visible:ring-[#35BDC8] focus-visible:ring-offset-black"
                        : "focus-visible:ring-[#0B6377] focus-visible:ring-offset-white",
                      index <= activeIndex
                        ? isDark
                          ? "border-[#35BDC8] bg-[#35BDC8]"
                          : "border-[#0B6377] bg-[#0B6377]"
                        : isDark
                        ? "border-[#1A6872] bg-black"
                        : "border-[#0B6377]/40 bg-white"
                    )}
                    aria-label={`Ir para evento: ${event.date} — ${event.title}`}
                    aria-pressed={activeIndex === index}
                  >
                    {/* Active pulse ring */}
                    {activeIndex === index && (
                      <span
                        className="absolute inset-0 rounded-full animate-ping opacity-40 motion-reduce:animate-none"
                        style={{
                          background: isDark ? "#35BDC8" : "#0B6377",
                          animationDuration: "1.8s",
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Date labels below markers */}
              <div className="flex justify-between mt-3">
                {events.map((event, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-wide font-mono transition-colors outline-none cursor-pointer",
                      "focus-visible:underline",
                      index === activeIndex
                        ? isDark
                          ? "text-[#35BDC8]"
                          : "text-[#0B6377]"
                        : isDark
                        ? "text-[#1A6872] hover:text-[#92DCE2]"
                        : "text-[#1A6872] hover:text-[#0B6377]"
                    )}
                    aria-label={`Ir para ${event.date}`}
                    tabIndex={-1}
                  >
                    {event.date}
                  </button>
                ))}
              </div>
            </div>

            {/* Vertical event list */}
            <ol className="relative flex flex-col gap-0 list-none p-0 m-0">
              {/* Vertical connecting line */}
              <div
                className={cn(
                  "absolute left-[7px] top-2 bottom-2 w-px",
                  isDark ? "bg-[#1A6872]" : "bg-[#0B6377]/30"
                )}
                aria-hidden="true"
              />

              {events.map((event, index) => {
                const isActive = index === activeIndex
                return (
                  <li key={index} className="relative pl-8 pb-8 last:pb-0">
                    {/* Marker */}
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 transition-all duration-200 outline-none cursor-pointer",
                        "focus-visible:ring-2 focus-visible:ring-offset-2",
                        isDark
                          ? "focus-visible:ring-[#35BDC8] focus-visible:ring-offset-black"
                          : "focus-visible:ring-[#0B6377] focus-visible:ring-offset-white",
                        isActive
                          ? isDark
                            ? "border-[#35BDC8] bg-[#35BDC8]"
                            : "border-[#0B6377] bg-[#0B6377]"
                          : isDark
                          ? "border-[#1A6872] bg-black"
                          : "border-[#0B6377]/40 bg-white"
                      )}
                      aria-label={`${event.date} — ${event.title}`}
                      aria-pressed={isActive}
                    />

                    {/* Event content */}
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "w-full text-left rounded-xl p-4 transition-all duration-200 outline-none cursor-pointer",
                        "focus-visible:ring-2",
                        isDark
                          ? "focus-visible:ring-[#35BDC8]"
                          : "focus-visible:ring-[#0B6377]",
                        isActive
                          ? isDark
                            ? "bg-[#0B363C] border border-[#35BDC8]/40"
                            : "bg-[#DEF7F9]/50 border border-[#0B6377]/25"
                          : isDark
                          ? "border border-transparent hover:bg-[#0B363C]/50"
                          : "border border-transparent hover:bg-[#F2F2F2]"
                      )}
                    >
                      <span
                        className={cn(
                          "block text-xs font-semibold uppercase tracking-widest mb-1 font-mono",
                          isActive
                            ? isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                            : isDark ? "text-[#92DCE2]/60" : "text-[#1A6872]"
                        )}
                      >
                        {event.date}
                      </span>
                      <span
                        className={cn(
                          "block text-sm font-semibold leading-snug",
                          isDark ? "text-[#F2F2F2]" : "text-[#090E17]",
                          !isActive && "opacity-70"
                        )}
                      >
                        {event.title}
                      </span>
                      {event.description && isActive && (
                        <span
                          className={cn(
                            "block text-sm leading-relaxed mt-1.5",
                            isDark ? "text-[#DEF7F9]/70" : "text-[#090E17]/65"
                          )}
                        >
                          {event.description}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* Active event card — mobile only (lg hidden) */}
            {activeEvent && (
              <div
                className={cn(
                  "lg:hidden flex flex-col gap-2 rounded-2xl border p-5",
                  isDark
                    ? "border-[#35BDC8]/40 bg-[#0B363C]"
                    : "border-[#0B6377]/30 bg-[#DEF7F9]/40"
                )}
                aria-live="polite"
                aria-atomic="true"
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-widest font-mono",
                    isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                  )}
                >
                  {activeEvent.date}
                </span>
                <p
                  className={cn(
                    "text-base font-semibold",
                    isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                  )}
                >
                  {activeEvent.title}
                </p>
                {activeEvent.description && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-[#DEF7F9]/70" : "text-[#1A6872]"
                    )}
                  >
                    {activeEvent.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { TimelineSection }
export type { TimelineSectionProps, TimelineEvent }
