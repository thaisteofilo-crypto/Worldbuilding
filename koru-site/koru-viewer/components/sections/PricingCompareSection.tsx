import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PricingComparePlan {
  name: string
  price: string
  period?: string
  featured?: boolean
  cta?: string
}

interface FeatureRow {
  label: string
  values: (boolean | string)[]
}

interface FeatureGroup {
  category: string
  rows: FeatureRow[]
}

interface PricingCompareSectionProps {
  badge?: string
  title?: string
  subtitle?: string
  plans: PricingComparePlan[]
  groups: FeatureGroup[]
  variant?: "light" | "dark"
  className?: string
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="h-4 w-4 mx-auto"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8l3.5 3.5L13 4.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DashIcon({ color }: { color: string }) {
  return (
    <svg
      className="h-4 w-4 mx-auto"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 8h8"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  )
}

function PricingCompareSection({
  badge,
  title,
  subtitle,
  plans,
  groups,
  variant = "light",
  className,
}: PricingCompareSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  const planCount = plans.length
  // First col is the feature label. Remaining cols are plans.
  // We use a CSS grid with the first col fixed and the rest equal.
  const gridTemplateColumns = `minmax(160px,1fr) repeat(${planCount}, minmax(120px,1fr))`

  const checkColor = isDark ? "#35BDC8" : "#0B6377"
  const dashColor = isDark ? "#1A6872" : "#BCBCBC"

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        {(badge || title || subtitle) && (
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
            {title && (
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
            )}
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
        )}

        {/* Table wrapper — horizontal scroll on mobile */}
        <div className="w-full overflow-x-auto -mx-0">
          <div style={{ minWidth: `${160 + planCount * 140}px` }}>

            {/* Sticky plan header row */}
            <div
              className={cn(
                "grid sticky top-0 z-10 rounded-t-2xl border-b",
                isDark ? "bg-black border-[#35BDC8]" : "bg-white border-[#0B6377]"
              )}
              style={{ gridTemplateColumns }}
            >
              {/* Empty label cell */}
              <div className="py-5 px-4" />

              {/* Plan header cells */}
              {plans.map((plan, pi) => {
                const isFeatured = plan.featured === true
                return (
                  <div
                    key={pi}
                    className={cn(
                      "py-5 px-4 flex flex-col items-center text-center border-l",
                      isFeatured
                        ? isDark
                          ? "bg-[#35BDC8]/10 border-[#35BDC8]/20"
                          : "bg-[#0B6377]/5 border-[#0B6377]/15"
                        : isDark
                        ? "border-white/8"
                        : "border-[#0B6377]/20"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-widest font-mono",
                        isFeatured
                          ? isDark
                            ? "text-[#35BDC8]"
                            : "text-[#0B6377]"
                          : isDark
                          ? "text-[#92DCE2]"
                          : "text-[#1A6872]"
                      )}
                    >
                      {plan.name}
                    </span>
                    <span
                      className={cn(
                        "text-2xl font-normal mt-1 leading-none",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                      style={{ fontFamily: "var(--heading)" }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className={cn(
                          "text-xs mt-0.5",
                          isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                        )}
                      >
                        {plan.period}
                      </span>
                    )}
                    {isFeatured && (
                      <span
                        className={cn(
                          "mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono",
                          isDark
                            ? "bg-[#35BDC8]/20 text-[#35BDC8]"
                            : "bg-[#0B6377] text-[#F2F2F2]"
                        )}
                      >
                        Popular
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Feature groups */}
            {groups.map((group, gi) => (
              <React.Fragment key={gi}>
                {/* Category divider row */}
                <div
                  className={cn(
                    "grid border-b",
                    isDark
                      ? "bg-[#0B363C]/60 border-[#1A6872]"
                      : "bg-[#F2F2F2] border-[#0B6377]"
                  )}
                  style={{ gridTemplateColumns }}
                >
                  <div className="col-span-full py-3 px-4">
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-widest font-mono",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {group.category}
                    </span>
                  </div>
                </div>

                {/* Feature rows */}
                {group.rows.map((row, ri) => {
                  const isEven = ri % 2 === 0
                  return (
                    <div
                      key={ri}
                      className={cn(
                        "grid border-b transition-colors",
                        isDark
                          ? isEven
                            ? "border-[#1A6872] hover:bg-[#0B363C]/40"
                            : "bg-[#0B363C]/30 border-[#1A6872] hover:bg-[#0B363C]/60"
                          : isEven
                          ? "border-[#0B6377]/30 hover:bg-[#F2F2F2]"
                          : "bg-[#DEF7F9]/30 border-[#0B6377]/30 hover:bg-[#DEF7F9]/60"
                      )}
                      style={{ gridTemplateColumns }}
                    >
                      {/* Feature label */}
                      <div className="py-3.5 px-4 flex items-center">
                        <span
                          className={cn(
                            "text-sm",
                            isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
                          )}
                        >
                          {row.label}
                        </span>
                      </div>

                      {/* Value cells */}
                      {row.values.map((val, vi) => {
                        const isFeaturedCol = plans[vi]?.featured === true
                        return (
                          <div
                            key={vi}
                            className={cn(
                              "py-3.5 px-4 flex items-center justify-center border-l",
                              isFeaturedCol
                                ? isDark
                                  ? "bg-[#35BDC8]/[0.07] border-[#35BDC8]/15"
                                  : "bg-[#0B6377]/[0.03] border-[#0B6377]/10"
                                : isDark
                                ? "border-white/8"
                                : "border-[#0B6377]/20"
                            )}
                          >
                            {val === true ? (
                              <span role="img" aria-label="Incluído">
                                <CheckIcon color={checkColor} />
                              </span>
                            ) : val === false ? (
                              <span role="img" aria-label="Não incluído">
                                <DashIcon color={dashColor} />
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "text-xs text-center leading-snug",
                                  isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
                                )}
                              >
                                {val}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}

            {/* CTA footer row */}
            <div
              className={cn(
                "grid rounded-b-2xl border-t",
                isDark
                  ? "bg-black border-[#35BDC8]"
                  : "bg-white border-[#0B6377]"
              )}
              style={{ gridTemplateColumns }}
            >
              {/* Empty label cell */}
              <div className="py-6 px-4" />

              {/* CTA per plan */}
              {plans.map((plan, pi) => {
                const isFeatured = plan.featured === true
                return (
                  <div
                    key={pi}
                    className={cn(
                      "py-6 px-4 flex items-center justify-center border-l",
                      isFeatured
                        ? isDark
                          ? "bg-[#35BDC8]/10 border-[#35BDC8]/20"
                          : "bg-[#0B6377]/5 border-[#0B6377]/15"
                        : isDark
                        ? "border-white/8"
                        : "border-[#0B6377]/20"
                    )}
                  >
                    {plan.cta && (
                      <button
                        type="button"
                        className={cn(
                          "w-full rounded-lg px-4 py-2.5 text-sm font-semibold leading-none transition-all",
                          isFeatured
                            ? isDark
                              ? "bg-[#35BDC8] text-[#090E17] hover:bg-[#2CA0AB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                              : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
                            : isDark
                            ? "border border-[#1A6872] text-[#DEF7F9] hover:bg-[#1A6872]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                            : "border border-[#0B6377] text-[#0B6377] hover:bg-[#DEF7F9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
                        )}
                      >
                        {plan.cta}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export { PricingCompareSection }
export type {
  PricingCompareSectionProps,
  PricingComparePlan,
  FeatureRow,
  FeatureGroup,
}
