import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const STEP_ACCENTS = [
  "#0B6377", // Iara
  "#8B3D17", // Barro
  "#9B6C22", // Mel
  "#707C36", // Mata
  "#C72211", // Urucum
]

interface Step {
  title: string
  description: string
  icon?: React.ElementType
}

interface HowItWorksSectionProps {
  badge?: string
  title: string
  subtitle?: string
  steps: Step[]
  layout?: "horizontal" | "vertical"
  variant?: "light" | "dark"
  className?: string
}

function HowItWorksSection({
  badge,
  title,
  subtitle,
  steps,
  layout = "horizontal",
  variant = "light",
  className,
}: HowItWorksSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  const isHorizontal = layout === "horizontal"

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
        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center gap-4">
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs tracking-widest uppercase px-3 font-medium font-mono",
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
            className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight max-w-3xl"
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

        {/* Steps */}
        <ol
          className={cn(
            "relative list-none p-0 m-0",
            isHorizontal
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              : "flex flex-col gap-10 max-w-2xl mx-auto"
          )}
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            const accent = STEP_ACCENTS[index % STEP_ACCENTS.length]
            const isLast = index === steps.length - 1

            return (
              <li
                key={index}
                className={cn(
                  "relative flex",
                  isHorizontal ? "flex-col gap-4" : "gap-5 items-start"
                )}
              >
                {/* Connector line — horizontal layout */}
                {isHorizontal && !isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "hidden lg:block absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px",
                      isDark ? "bg-[#1A6872]" : "bg-[#0B6377]"
                    )}
                  />
                )}

                {/* Connector line — vertical layout */}
                {!isHorizontal && !isLast && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-6 top-12 bottom-[-40px] w-px",
                      isDark ? "bg-[#1A6872]" : "bg-[#0B6377]"
                    )}
                  />
                )}

                {/* Step badge (number + icon) */}
                <div className="relative flex items-center gap-3 shrink-0">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0",
                      isDark
                        ? "bg-[#0B363C] border border-[#1A6872]"
                        : "bg-[#F2F2F2] border-2"
                    )}
                    style={
                      !isDark ? { borderColor: accent } : undefined
                    }
                  >
                    {Icon ? (
                      <Icon
                        className="h-5 w-5"
                        style={{ color: isDark ? "#35BDC8" : accent }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="text-base font-bold leading-none font-mono"
                        style={{ color: isDark ? "#35BDC8" : accent }}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  {Icon && (
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest font-mono",
                        isHorizontal && "hidden"
                      )}
                      style={{ color: isDark ? "#35BDC8" : accent }}
                      aria-hidden="true"
                    >
                      Passo {String(index + 1).padStart(2, "0")}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <p
                    className={cn(
                      "text-base font-semibold leading-snug",
                      isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export { HowItWorksSection }
export type { HowItWorksSectionProps, Step }
