import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Tab {
  label: string
  content: React.ReactNode
}

interface HeroIntercomSectionProps {
  badge?: string
  title: string
  description: string
  primaryCta: { label: string; href?: string }
  secondaryCta?: { label: string; href?: string }
  tabs?: Tab[]
  variant?: "light" | "dark"
  className?: string
}

// Decorative corner dot colors cycling through brand palette
const DOT_COLORS = ["#0B6377", "#35BDC8", "#8B3D17", "#9B6C22"]

function ScreenshotPlaceholder({ isDark, activeTab }: { isDark: boolean; activeTab: number }) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border",
        isDark ? "border-[#1A6872] bg-[#0B363C]" : "border-[#0B6377]/40 bg-[#F2F2F2]"
      )}
      style={{ aspectRatio: "4/3" }}
      aria-hidden="true"
    >
      {/* Corner accent dots */}
      {DOT_COLORS.map((color, i) => (
        <div
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            background: color,
            top: i < 2 ? 16 : undefined,
            bottom: i >= 2 ? 16 : undefined,
            left: i % 2 === 0 ? 16 : undefined,
            right: i % 2 === 1 ? 16 : undefined,
          }}
        />
      ))}

      {/* Simulated app UI skeleton */}
      <div className="absolute inset-0 flex flex-col gap-3 p-8 pt-10">
        {/* Top bar */}
        <div className="flex items-center gap-2">
          <div
            className="h-2 rounded-full w-24"
            style={{ background: isDark ? "#1A6872" : "#92DCE2" }}
          />
          <div
            className="h-2 rounded-full w-16 opacity-60"
            style={{ background: isDark ? "#1A6872" : "#92DCE2" }}
          />
        </div>

        {/* Content rows that shift based on active tab */}
        <div className="flex flex-col gap-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                i === activeTab % 5
                  ? isDark
                    ? "bg-[#35BDC8]/10 border border-[#35BDC8]/30"
                    : "bg-[#0B6377]/8 border border-[#92DCE2]/60"
                  : "border border-transparent"
              )}
            >
              <div
                className="h-7 w-7 rounded-lg shrink-0"
                style={{
                  background:
                    i === activeTab % 5
                      ? isDark ? "#35BDC8" : "#0B6377"
                      : isDark ? "#1A6872" : "#DEF7F9",
                }}
              />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${55 + (i * 17) % 35}%`,
                    background:
                      i === activeTab % 5
                        ? isDark ? "#35BDC8" : "#0B6377"
                        : isDark ? "#1A6872" : "#92DCE2",
                  }}
                />
                <div
                  className="h-1.5 rounded-full opacity-50"
                  style={{
                    width: `${35 + (i * 11) % 30}%`,
                    background: isDark ? "#1A6872" : "#92DCE2",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HeroIntercomSection({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  tabs = [],
  variant = "light",
  className,
}: HeroIntercomSectionProps) {
  const isDark = variant === "dark"
  const [activeTab, setActiveTab] = React.useState(0)
  const titleId = React.useId()
  const tablistId = React.useId()

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
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {badge && (
              <Badge
                variant="outline"
                className={cn(
                  "w-fit text-xs tracking-widest uppercase px-3 py-1 font-medium",
                  isDark
                    ? "border-[#1A6872] text-[#92DCE2] bg-[#0B363C]"
                    : "border-[#0B6377] text-[#0B6377] bg-[#F2F2F2]"
                )}
              >
                {badge}
              </Badge>
            )}

            <h1
              id={titleId}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
              style={{
                fontFamily: "var(--heading)",
                color: isDark ? "#F2F2F2" : "#090E17",
              }}
            >
              {title}
            </h1>

            <p
              className={cn(
                "text-base md:text-lg leading-relaxed max-w-lg",
                isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
              )}
            >
              {description}
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              <Button
                size="lg"
                className={cn(
                  "px-7 h-11 text-sm font-semibold rounded-lg",
                  isDark
                    ? "bg-[#35BDC8] text-black hover:bg-[#2CA0AB]"
                    : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872]"
                )}
                nativeButton={!primaryCta.href}
                render={primaryCta.href ? <a href={primaryCta.href} /> : undefined}
              >
                {primaryCta.label}
              </Button>
              {secondaryCta && (
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "px-7 h-11 text-sm font-semibold rounded-lg bg-transparent",
                    isDark
                      ? "border-[#1A6872] text-[#DEF7F9] hover:bg-[#1A6872]/30"
                      : "border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9]"
                  )}
                  nativeButton={!secondaryCta.href}
                  render={secondaryCta.href ? <a href={secondaryCta.href} /> : undefined}
                >
                  {secondaryCta.label}
                </Button>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Tab selector — underline style */}
            {tabs.length > 0 && (
              <div
                role="tablist"
                id={tablistId}
                aria-label="Feature tabs"
                className={cn(
                  "flex gap-0 border-b",
                  isDark ? "border-[#1A6872]" : "border-[#0B6377]/30"
                )}
              >
                {tabs.map((tab, index) => (
                  <button
                    key={index}
                    role="tab"
                    id={`${tablistId}-tab-${index}`}
                    aria-selected={activeTab === index}
                    aria-controls={`${tablistId}-panel-${index}`}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      "relative px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      isDark
                        ? "focus-visible:ring-[#35BDC8]"
                        : "focus-visible:ring-[#0B6377]",
                      activeTab === index
                        ? isDark
                          ? "text-[#35BDC8]"
                          : "text-[#0B6377]"
                        : isDark
                        ? "text-[#92DCE2]/60 hover:text-[#92DCE2]"
                        : "text-[#1A6872] hover:text-[#090E17]"
                    )}
                  >
                    {tab.label}
                    {activeTab === index && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                        style={{ background: isDark ? "#35BDC8" : "#0B6377" }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Tab content or screenshot */}
            {tabs.length > 0 ? (
              <div>
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    role="tabpanel"
                    id={`${tablistId}-panel-${index}`}
                    aria-labelledby={`${tablistId}-tab-${index}`}
                    hidden={activeTab !== index}
                  >
                    {tab.content ?? (
                      <ScreenshotPlaceholder isDark={isDark} activeTab={index} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ScreenshotPlaceholder isDark={isDark} activeTab={0} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { HeroIntercomSection }
export type { HeroIntercomSectionProps, Tab }
