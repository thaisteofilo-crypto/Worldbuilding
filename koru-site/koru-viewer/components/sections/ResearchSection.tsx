import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  date: string
  title: string
  description?: string
}

interface ArticleCard {
  date: string
  title: string
  imageSrc?: string
  href?: string
}

interface ResearchSectionProps {
  heading: string
  description: string
  timelineEvents?: TimelineEvent[]
  activeEventIndex?: number
  bottomHeading?: string
  bottomLink?: { label: string; href: string }
  articles?: ArticleCard[]
  variant?: "light" | "dark"
  className?: string
}

// ─── Gradient placeholders rotated through brand secondaries ──────────────────
const ARTICLE_GRADIENTS = [
  "linear-gradient(135deg, #0B6377 0%, #8B3D17 60%, #9B6C22 100%)",
  "linear-gradient(135deg, #707C36 0%, #0B6377 50%, #BF505C 100%)",
  "linear-gradient(135deg, #9B6C22 0%, #C72211 55%, #DD560D 100%)",
  "linear-gradient(135deg, #8B3D17 0%, #707C36 50%, #0B6377 100%)",
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimelineTick({ active }: { active?: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 rounded-full",
        active ? "w-[2px] h-5 bg-[#090E17]" : "w-[1px] h-3 bg-[#1A6872]/50",
      )}
      aria-hidden="true"
    />
  )
}

function TimelineCard({
  events,
  activeIndex,
  onPrev,
  onNext,
}: {
  events: TimelineEvent[]
  activeIndex: number
  onPrev: () => void
  onNext: () => void
}) {
  const active = events[activeIndex]
  if (!active) return null

  // Build a visual tick array: 30 ticks, active is at position ~70% right
  const TOTAL_TICKS = 32
  const ACTIVE_TICK = Math.round(TOTAL_TICKS * 0.72)

  return (
    <div className="rounded-2xl bg-[#E7E7E7] pt-36 pb-8 px-8 w-full" role="region" aria-label="Research timeline">
      <div className="relative flex items-center gap-3 select-none">
        {/* Left nav */}
        <button
          onClick={onPrev}
          disabled={activeIndex === 0}
          aria-label="Previous timeline event"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0B6377]/40 bg-[#F2F2F2] transition-opacity",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]",
            activeIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#E0E0E0] cursor-pointer",
          )}
        >
          <ChevronLeft className="h-4 w-4 text-[#090E17]" aria-hidden="true" />
        </button>

        {/* Timeline track */}
        <div className="relative flex-1 flex flex-col items-stretch">
          {/* Active event popup — pinned above the active tick */}
          <div
            className="absolute bottom-[calc(100%+16px)] flex flex-col items-center pointer-events-none"
            style={{ left: `${(ACTIVE_TICK / TOTAL_TICKS) * 100}%`, transform: "translateX(-50%)" }}
            aria-live="polite"
          >
            {/* Tooltip card */}
            <div className="rounded-xl bg-[#F2F2F2] border border-[#0B6377]/40 shadow-sm px-4 py-2.5 text-center min-w-[180px] max-w-[240px]">
              <p className="text-sm font-semibold text-[#090E17] leading-snug">{active.title}</p>
              {active.description && (
                <p className="mt-1 text-xs text-[#1A6872] leading-snug">{active.description}</p>
              )}
              <p className="mt-1.5 text-xs text-[#1A6872] font-medium">{active.date}</p>
            </div>
            {/* Connector line from card to timeline */}
            <div className="w-px h-8 bg-[#1A6872]/60" aria-hidden="true" />
          </div>

          {/* Horizontal rule + ticks */}
          <div className="relative flex items-center h-12">
            {/* Base line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-[#1A6872]/40" aria-hidden="true" />

            {/* Ticks */}
            <div className="relative z-10 flex items-center justify-between w-full" aria-hidden="true">
              {Array.from({ length: TOTAL_TICKS + 1 }).map((_, i) => (
                <TimelineTick key={i} active={i === ACTIVE_TICK} />
              ))}
            </div>

            {/* Active vertical marker line (tall, goes below the rule) */}
            <div
              className="absolute top-1/2 -translate-y-[30%] w-px h-8 bg-[#090E17] z-20 pointer-events-none"
              style={{ left: `${(ACTIVE_TICK / TOTAL_TICKS) * 100}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Right nav */}
        <button
          onClick={onNext}
          disabled={activeIndex === events.length - 1}
          aria-label="Next timeline event"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#0B6377]/40 bg-[#F2F2F2] transition-opacity",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]",
            activeIndex === events.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#E0E0E0] cursor-pointer",
          )}
        >
          <ChevronRight className="h-4 w-4 text-[#090E17]" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function ArticleCardItem({ article, index }: { article: ArticleCard; index: number }) {
  const gradient = ARTICLE_GRADIENTS[index % ARTICLE_GRADIENTS.length]
  const Wrapper = article.href ? "a" : "div"
  const wrapperProps = article.href
    ? { href: article.href, className: "group block rounded-2xl overflow-hidden bg-[#E7E7E7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]" }
    : { className: "group block rounded-2xl overflow-hidden bg-[#E7E7E7]" }

  return (
    <Wrapper {...(wrapperProps as React.ComponentPropsWithoutRef<"a"> & React.ComponentPropsWithoutRef<"div">)}>
      {/* Image area */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        {article.imageSrc ? (
          <img
            src={article.imageSrc}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
          />
        ) : (
          <div
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            style={{ background: gradient }}
            aria-hidden="true"
          />
        )}
        {/* Date badge — absolute top-left over the image */}
        <span className="absolute top-3 left-3 rounded-full bg-[#0B6377] text-[#F2F2F2] text-xs font-medium px-3 py-1 leading-none">
          {article.date}
        </span>
      </div>

      {/* Title */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-[#090E17] leading-snug group-hover:text-[#0B6377] transition-colors">
          {article.title}
        </p>
      </div>
    </Wrapper>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function ResearchSection({
  heading,
  description,
  timelineEvents = [],
  activeEventIndex = 0,
  bottomHeading,
  bottomLink,
  articles = [],
  variant = "light",
  className,
}: ResearchSectionProps) {
  const [activeIdx, setActiveIdx] = React.useState(
    Math.min(activeEventIndex, Math.max(timelineEvents.length - 1, 0)),
  )

  // Sync if prop changes
  React.useEffect(() => {
    setActiveIdx(Math.min(activeEventIndex, Math.max(timelineEvents.length - 1, 0)))
  }, [activeEventIndex, timelineEvents.length])

  const isDark = variant === "dark"
  const sectionId = React.useId()

  const sectionBg = isDark ? "bg-black" : "bg-white"
  const bodyColor = isDark ? "text-[#DEF7F9]" : "text-[#1A6872]"
  const bottomHeadingColor = isDark ? "text-[#DEF7F9]" : "text-[#090E17]"

  return (
    <section
      className={cn("w-full px-6 py-20 md:py-28", sectionBg, className)}
      aria-labelledby={sectionId}
    >
      <div className="mx-auto max-w-6xl flex flex-col gap-12">

        {/* ── TOP: 2-col heading + description ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[40%_55%] gap-8 md:gap-16 items-start">
          <h2
            id={sectionId}
            className="text-[2rem] leading-tight font-normal"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#F2F2F2" : "#090E17",
            }}
          >
            {heading}
          </h2>
          <p className={cn("text-base leading-relaxed", bodyColor)}>
            {description}
          </p>
        </div>

        {/* ── MIDDLE: Timeline card ───────────────────────────────────────────── */}
        {timelineEvents.length > 0 && (
          <TimelineCard
            events={timelineEvents}
            activeIndex={activeIdx}
            onPrev={() => setActiveIdx((i) => Math.max(0, i - 1))}
            onNext={() => setActiveIdx((i) => Math.min(timelineEvents.length - 1, i + 1))}
          />
        )}

        {/* ── BOTTOM: 2-col bottom row ────────────────────────────────────────── */}
        {(bottomHeading || articles.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] gap-8 md:gap-12 items-start">
            {/* Left: small heading + link */}
            <div className="flex flex-col gap-4 justify-between h-full">
              {bottomHeading && (
                <p className={cn("text-sm leading-relaxed", bottomHeadingColor)}>
                  {bottomHeading}
                </p>
              )}
              {bottomLink && (
                <a
                  href={bottomLink.href}
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium rounded-full border px-4 py-2 transition-colors w-fit focus-visible:outline-2 focus-visible:outline-offset-2",
                    isDark
                      ? "border-[#1A6872] text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-[#35BDC8]"
                      : "border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9] focus-visible:outline-[#0B6377]",
                  )}
                >
                  {bottomLink.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Right: article cards side by side */}
            {articles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articles.slice(0, 4).map((article, i) => (
                  <ArticleCardItem key={i} article={article} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export { ResearchSection }
export type { ResearchSectionProps, TimelineEvent, ArticleCard }
