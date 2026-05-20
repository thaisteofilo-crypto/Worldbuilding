import * as React from "react"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

export interface HeroCometSectionProps {
  eyebrow?: string
  title: string
  titleItalic?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  screenshotContent?: React.ReactNode
  className?: string
}

function HeroCometSection({
  eyebrow = "A new product from Acme",
  title,
  titleItalic,
  subtitle,
  ctaLabel = "Download",
  ctaHref = "#",
  screenshotContent,
  className,
}: HeroCometSectionProps) {
  const titleId = React.useId()

  // Build the heading: insert italic word(s) at end, or fall back to plain title
  const heading = titleItalic ? (
    <>
      {title}{" "}
      <em className="not-italic italic font-normal">{titleItalic}</em>
    </>
  ) : (
    title
  )

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-white px-6 pb-24 pt-20",
        className
      )}
      aria-labelledby={titleId}
    >
      {/* ── Decorative floating circles ── */}

      {/* Left top circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-20 h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, #35BDC8 0%, #0B6377 45%, #0B363C 100%)",
          opacity: 0.92,
          filter: "blur(2px)",
        }}
      />

      {/* Left bottom circle (smaller, partially off-screen) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-24 h-[220px] w-[220px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 55%, #0B6377 0%, #0B363C 80%)",
          opacity: 0.7,
          filter: "blur(4px)",
        }}
      />

      {/* Right circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-10 h-[380px] w-[380px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 40%, #35BDC8 0%, #0B6377 35%, #0B363C 75%)",
          opacity: 0.88,
          filter: "blur(3px)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        {/* Eyebrow */}
        {eyebrow && (
          <p className="text-sm font-medium tracking-wide text-[#1A6872]">
            {eyebrow}
          </p>
        )}

        {/* Heading */}
        <h1
          id={titleId}
          className="text-5xl font-normal leading-tight tracking-tight md:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--heading)", color: "#090E17" }}
        >
          {heading}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="max-w-xl text-base leading-relaxed text-[#1A6872] md:text-lg">
            {subtitle}
          </p>
        )}

        {/* CTA button */}
        <a
          href={ctaHref}
          className={cn(
            "mt-2 inline-flex items-center gap-2.5 rounded-lg px-7 py-3.5",
            "bg-[#0B6377] text-[#F2F2F2] text-sm font-semibold",
            "shadow-sm transition-colors duration-150 hover:bg-[#1A6872]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
          )}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {ctaLabel}
        </a>
      </div>

      {/* ── Browser mockup ── */}
      <div className="relative z-10 mx-auto mt-14 max-w-4xl">
        <div
          className={cn(
            "overflow-hidden rounded-2xl",
            "shadow-[0_24px_60px_-8px_rgba(9,14,23,0.18),0_8px_24px_-4px_rgba(9,14,23,0.10)]",
            "border border-[#090E17]/8"
          )}
        >
          {/* Browser chrome top bar */}
          <div className="flex items-center gap-2 bg-[#E8E8E8] px-4 py-3" aria-hidden="true">
            {/* Traffic-light dots — decorative */}
            <span className="h-3 w-3 rounded-full bg-[#C72211]/70" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-[#9B6C22]/70" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-[#707C36]/70" aria-hidden="true" />

            {/* Address bar pill */}
            <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-[#D4D4D4]/80 px-3">
              <span className="text-[11px] text-[#090E17]/50 font-medium select-none">
                New Tab
              </span>
            </div>
          </div>

          {/* Inner content area */}
          <div className="relative flex min-h-[340px] flex-col items-center justify-center bg-[#0B363C] md:min-h-[420px]">
            {screenshotContent ?? (
              <DefaultScreenshotPlaceholder />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Default placeholder shown when no screenshotContent is provided ── */
function DefaultScreenshotPlaceholder() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 px-8 py-12">
      {/* Simulated cosmic background grid */}
      <div
        className="absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 40%, #35BDC8 0%, transparent 55%), " +
            "radial-gradient(circle at 20% 80%, #0B6377 0%, transparent 40%), " +
            "radial-gradient(circle at 80% 70%, #114F56 0%, transparent 40%)",
        }}
      />

      {/* Search bar mockup */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#F2F2F2]/10 px-5 py-3.5 backdrop-blur-sm">
        <p className="text-sm text-[#DEF7F9]/50 select-none">Ask anything…</p>
      </div>

      {/* Icon row */}
      <div className="relative z-10 flex items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F2F2F2]/10"
            aria-hidden="true"
          >
            <div className="h-3 w-3 rounded-sm bg-[#92DCE2]/40" />
          </div>
        ))}
      </div>

      {/* Star dots scattered */}
      {[
        { top: "15%", left: "12%" },
        { top: "28%", left: "78%" },
        { top: "62%", left: "8%" },
        { top: "72%", left: "88%" },
        { top: "45%", left: "92%" },
        { top: "10%", left: "55%" },
      ].map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute h-1 w-1 rounded-full bg-[#92DCE2]/60"
          style={pos}
        />
      ))}
    </div>
  )
}

export { HeroCometSection }
export type { HeroCometSectionProps as HeroCometProps }
