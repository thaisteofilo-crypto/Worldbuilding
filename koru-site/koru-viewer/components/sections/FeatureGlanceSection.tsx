import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Brand secondary colors for portrait card gradient placeholders
const CARD_GRADIENTS: [string, string][] = [
  ["#0B6377", "#1A6872"],   // teal primary
  ["#8B3D17", "#B04F20"],   // rust
  ["#9B6C22", "#C48A2A"],   // amber
  ["#707C36", "#8A9A44"],   // olive
  ["#BF505C", "#D96070"],   // rose
  ["#DD560D", "#F06520"],   // orange
  ["#C72211", "#E03020"],   // crimson
]

interface GlanceItem {
  image?: string
  caption: string
  description?: string
}

interface FeatureGlanceSectionProps {
  badge?: string
  title: string
  items: GlanceItem[]
  variant?: "light" | "dark"
  className?: string
}

function FeatureGlanceSection({
  badge,
  title,
  items,
  variant = "light",
  className,
}: FeatureGlanceSectionProps) {
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
      <div className="mx-auto max-w-7xl flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4">
          {badge && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs tracking-widest uppercase px-3 py-1 font-medium",
                isDark
                  ? "border-[#1A6872] text-[#92DCE2] bg-[#0B363C]"
                  : "border-[#0B6377] text-[#0B6377] bg-[#F2F2F2]"
              )}
            >
              {badge}
            </Badge>
          )}
          <h2
            id={titleId}
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--heading)",
              color: isDark ? "#F2F2F2" : "#090E17",
            }}
          >
            {title}
          </h2>
        </div>

        {/* Portrait card grid — 2 cols mobile → 3 → 5 */}
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 list-none p-0 m-0"
          role="list"
        >
          {items.map((item, index) => {
            const [colorA, colorB] = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

            return (
              <li key={index} className="flex flex-col gap-3">
                {/* Portrait card */}
                <div
                  className={cn(
                    "w-full rounded-xl overflow-hidden",
                    isDark ? "ring-1 ring-[#1A6872]/60" : "ring-1 ring-[#0B6377]/30"
                  )}
                  style={{ aspectRatio: "3/4" }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.caption}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    /* Gradient placeholder */
                    <div
                      className="h-full w-full flex flex-col items-center justify-end p-4"
                      style={{
                        background: `linear-gradient(160deg, ${colorA} 0%, ${colorB} 100%)`,
                      }}
                      aria-hidden="true"
                    >
                      {/* Decorative grid lines */}
                      <div className="absolute inset-0 opacity-10">
                        <div
                          className="h-full w-full"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(0deg,rgba(255,255,255,.15) 0,rgba(255,255,255,.15) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(255,255,255,.15) 0,rgba(255,255,255,.15) 1px,transparent 1px,transparent 32px)",
                          }}
                        />
                      </div>
                      {/* Index number watermark */}
                      <span
                        className="text-7xl font-bold leading-none select-none text-white/20"
                        style={{ fontFamily: "var(--heading)" }}
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="flex flex-col gap-1 px-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                    )}
                  >
                    {item.caption}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        "text-xs leading-relaxed",
                        isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export { FeatureGlanceSection }
export type { FeatureGlanceSectionProps, GlanceItem }
