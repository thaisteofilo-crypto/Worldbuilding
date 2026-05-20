import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HeroSplitProductSectionProps {
  title: string
  description: string
  primaryCta: { label: string; href?: string }
  secondaryCta?: { label: string; href?: string }
  tabs?: string[]
  screenshotContent?: React.ReactNode
  className?: string
}

const DEFAULT_TABS = ["Overview", "Features", "Insights", "System"]

function CornerMarker({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute w-[6px] h-[6px] bg-[#35BDC8] rounded-sm", className)}
    />
  )
}

function HeroSplitProductSection({
  title,
  description,
  primaryCta,
  secondaryCta,
  tabs = DEFAULT_TABS,
  screenshotContent,
  className,
}: HeroSplitProductSectionProps) {
  const [activeTab, setActiveTab] = React.useState(0)
  const titleId = React.useId()
  const tablistId = React.useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "relative w-full bg-white px-6 py-16 md:py-24",
        className
      )}
    >
      {/* Corner markers */}
      <CornerMarker className="top-4 left-4" />
      <CornerMarker className="top-4 right-4" />
      <CornerMarker className="bottom-4 left-4" />
      <CornerMarker className="bottom-4 right-4" />

      <div className="mx-auto max-w-6xl flex flex-col gap-12">
        {/* TOP ROW: 2-column layout */}
        <div className="grid grid-cols-3 gap-8 items-start">
          {/* Left — large bold heading (col-span-2) */}
          <div className="col-span-2">
            <h1
              id={titleId}
              className="text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] font-bold leading-[1.05] tracking-[-0.02em]"
              style={{ fontFamily: "var(--sans)", color: "#090E17" }}
            >
              {title}
            </h1>
          </div>

          {/* Right — description + CTAs (col-span-1) */}
          <div className="col-span-1 flex flex-col gap-5 pt-2">
            <p
              className="text-base leading-relaxed text-[#1A6872]"
              style={{ fontFamily: "var(--sans)" }}
            >
              {description}
            </p>

            <div className="flex flex-col gap-3">
              <Button
                size="lg"
                nativeButton={!primaryCta.href}
                className="w-full justify-center px-6 h-11 text-sm font-semibold bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] rounded-lg"
                render={primaryCta.href ? <a href={primaryCta.href} /> : undefined}
              >
                {primaryCta.label}
              </Button>

              {secondaryCta && (
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={!secondaryCta.href}
                  className="w-full justify-center px-6 h-11 text-sm font-semibold border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9] bg-transparent rounded-lg"
                  render={secondaryCta.href ? <a href={secondaryCta.href} /> : undefined}
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM: Full-width product screenshot area */}
        <div className="w-full rounded-2xl overflow-hidden border border-[#0B6377]/40">
          {/* Tabs bar */}
          <div
            className="flex items-end gap-0 bg-[#F2F2F2] border-b border-[#0B6377]/30 px-4"
            role="tablist"
            aria-label="Product sections"
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                role="tab"
                id={`${tablistId}-tab-${i}`}
                aria-selected={activeTab === i}
                aria-controls={`${tablistId}-panel`}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B6377] focus-visible:ring-offset-2",
                  activeTab === i
                    ? "text-[#0B6377] border-b-2 border-[#0B6377] -mb-px"
                    : "text-[#1A6872] hover:text-[#090E17]"
                )}
                style={{ fontFamily: "var(--sans)" }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Screenshot area */}
          <div
            id={`${tablistId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-tab-${activeTab}`}
            className="relative w-full h-[400px] bg-[#090E17] flex items-center justify-center"
          >
            {screenshotContent ?? (
              <div className="flex flex-col items-center gap-3 select-none pointer-events-none">
                <div className="grid grid-cols-3 gap-2 opacity-20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-10 rounded-md bg-[#35BDC8]/30 border border-[#35BDC8]/20"
                    />
                  ))}
                </div>
                <p
                  className="text-xs text-[#92DCE2] tracking-widest uppercase mt-2"
                  aria-hidden="true"
                  style={{ fontFamily: "var(--mono)" }}
                >
                  Product screenshot
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { HeroSplitProductSection }
export type { HeroSplitProductSectionProps }
