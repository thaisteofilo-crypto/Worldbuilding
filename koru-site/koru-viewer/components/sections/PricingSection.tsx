import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface PricingPlan {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta: string
  featured?: boolean
  accentColor?: string
}

interface PricingSectionProps {
  badge?: string
  title: string
  subtitle?: string
  plans: PricingPlan[]
  variant?: "light" | "dark"
  className?: string
}

// Secondary brand colors for non-featured plan left-border accents
const PLAN_ACCENTS = [
  "#0B6377", // Iara
  "#8B3D17", // Barro
  "#9B6C22", // Mel
  "#707C36", // Mata
  "#BF505C", // Jambo
]

function PricingSection({
  badge,
  title,
  subtitle,
  plans,
  variant = "light",
  className,
}: PricingSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

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
        <div className="mb-12 flex flex-col items-center text-center gap-4">
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
            className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight"
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

        {/* Plans grid */}
        <div
          className={cn(
            "grid grid-cols-1 gap-6",
            plans.length === 2 && "md:grid-cols-2 max-w-3xl mx-auto",
            plans.length === 3 && "md:grid-cols-3",
            plans.length >= 4 && "md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {plans.map((plan, index) => {
            const accent = plan.accentColor ?? PLAN_ACCENTS[index % PLAN_ACCENTS.length]
            const isFeatured = plan.featured === true

            if (isFeatured) {
              // Featured card: brand teal (#0B6377) background, light text
              return (
                <div
                  key={index}
                  className="relative flex flex-col rounded-2xl overflow-hidden shadow-2xl scale-[1.02] bg-[#0B6377]"
                  aria-label={`Plano ${plan.name} — recomendado`}
                >
                  {/* Popular badge */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#090E17] bg-[#DEF7F9] px-2 py-0.5 rounded-full font-mono">
                      Popular
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#DEF7F9]">
                      {plan.name}
                    </p>
                    <div className="mt-4 flex items-end gap-1">
                      <span
                        className="text-4xl md:text-5xl font-normal leading-none text-[#F2F2F2]"
                        style={{ fontFamily: "var(--heading)" }}
                        aria-label={plan.period ? `${plan.price} ${plan.period}` : undefined}
                      >
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm mb-1 text-[#DEF7F9]" aria-hidden="true">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="mt-2 text-sm leading-relaxed text-[#DEF7F9]">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  <div className="mx-6 border-t border-[#1A6872]" />

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <ul className="flex flex-col gap-2.5">
                      {plan.features.map((feature, fi) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 text-xs font-bold shrink-0 text-[#DEF7F9]" aria-hidden="true">
                            ✓
                          </span>
                          <span className="text-[#F2F2F2]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 pt-0 mt-auto">
                    <Button
                      className="w-full h-10 text-sm font-semibold rounded-lg bg-[#DEF7F9] text-[#090E17] hover:bg-[#92DCE2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DEF7F9]"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </div>
              )
            }

            // Regular card
            return (
              <div
                key={index}
                className={cn(
                  "relative flex flex-col rounded-2xl border overflow-hidden transition-shadow",
                  isDark
                    ? "bg-[#0B363C] border-[#1A6872] hover:bg-[#114F56]"
                    : "bg-[#F2F2F2] border-[#0B6377] shadow-sm hover:shadow-md"
                )}
              >
                <div className="p-6 flex flex-col gap-1">
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-widest",
                      isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                    )}
                  >
                    {plan.name}
                  </p>
                  <div className="mt-4 flex items-end gap-1">
                    <span
                      className={cn(
                        "text-4xl md:text-5xl font-normal leading-none",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                      style={{ fontFamily: "var(--heading)" }}
                      aria-label={plan.period ? `${plan.price} ${plan.period}` : undefined}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={cn(
                          "text-sm mb-1",
                          isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                        )}
                        aria-hidden="true"
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {plan.description && (
                    <p
                      className={cn(
                        "mt-2 text-sm leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {plan.description}
                    </p>
                  )}
                </div>

                <div
                  className={cn(
                    "mx-6 border-t",
                    isDark ? "border-[#1A6872]" : "border-[#0B6377]"
                  )}
                />

                <div className="p-6 flex flex-col gap-3 flex-1">
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={cn(
                            "mt-0.5 text-xs font-bold shrink-0",
                            isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                          )}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span
                          className={cn(
                            isDark ? "text-[#92DCE2]" : "text-[#090E17]"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <Button
                    className="w-full h-10 text-sm font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: isDark
                        ? "#35BDC8"
                        : accent,
                      color: isDark ? "#090E17" : "#F2F2F2",
                    }}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { PricingSection }
export type { PricingSectionProps, PricingPlan }
