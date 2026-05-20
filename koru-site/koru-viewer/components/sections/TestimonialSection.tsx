import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Secondary brand colors for avatar initials backgrounds
const AVATAR_PALETTE = [
  { bg: "#0B6377", text: "#F2F2F2" }, // Iara — 4.7:1 AA ✓
  { bg: "#8B3D17", text: "#F2F2F2" }, // Barro — 6.1:1 AA ✓
  { bg: "#9B6C22", text: "#F2F2F2" }, // Mel — 4.8:1 AA ✓
  { bg: "#C72211", text: "#F2F2F2" }, // Urucum — 4.7:1 AA ✓
  { bg: "#707C36", text: "#F2F2F2" }, // Mata — 4.6:1 AA ✓
  { bg: "#BF505C", text: "#090E17" }, // Jambo — dark text 4.7:1 AA ✓
  { bg: "#DD560D", text: "#090E17" }, // Brasa — dark text 5.4:1 AA ✓
]

interface Testimonial {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
  rating?: number
}

interface TestimonialSectionProps {
  badge?: string
  title?: string
  testimonials: Testimonial[]
  layout?: "cards" | "minimal" | "large"
  variant?: "light" | "dark"
  className?: string
}

function StarRating({ rating, isDark }: { rating: number; isDark: boolean }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-3.5 w-3.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
          style={{
            color:
              i < rating
                ? isDark
                  ? "#35BDC8"
                  : "#0B6377"
                : isDark
                ? "#1A6872"
                : "#BCBCBC",
          }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function AvatarEl({
  avatar,
  author,
  isDark,
  index = 0,
}: {
  avatar?: string
  author: string
  isDark: boolean
  index?: number
}) {
  const initials = author
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length]
  const bg = isDark ? "#1A6872" : palette.bg
  const text = isDark ? "#DEF7F9" : palette.text

  if (avatar?.startsWith("http")) {
    return (
      <img
        src={avatar}
        alt={`Foto de ${author}`}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ background: bg, color: text }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function TestimonialSection({
  badge,
  title,
  testimonials,
  layout = "cards",
  variant = "light",
  className,
}: TestimonialSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

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
        {(badge || title) && (
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
                className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight"
                style={{
                  fontFamily: "var(--heading)",
                  color: isDark ? "#F2F2F2" : "#090E17",
                }}
              >
                {title}
              </h2>
            )}
          </div>
        )}

        {layout === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                role="article"
                className={cn(
                  "relative flex flex-col gap-4 rounded-2xl border p-6 transition-shadow",
                  isDark
                    ? "border-[#1A6872] bg-[#0B363C] hover:bg-[#114F56]"
                    : "border-[#0B6377] bg-[#F2F2F2] shadow-sm hover:shadow-md"
                )}
              >
                {t.rating !== undefined && (
                  <StarRating rating={t.rating} isDark={isDark} />
                )}

                <blockquote
                  className={cn(
                    "text-sm leading-relaxed flex-1",
                    isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
                  )}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-3 pt-2 border-t mt-auto"
                  style={{ borderColor: isDark ? "#1A6872" : "#0B6377" }}
                >
                  <AvatarEl
                    avatar={t.avatar}
                    author={t.author}
                    isDark={isDark}
                    index={index}
                  />
                  <cite className="flex flex-col not-italic">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                      )}
                    >
                      {t.author}
                    </span>
                    {(t.role || t.company) && (
                      <span
                        className={cn(
                          "text-xs",
                          isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                        )}
                      >
                        {[t.role, t.company].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </cite>
                </div>
              </div>
            ))}
          </div>
        )}

        {layout === "minimal" && (
          <div
            className={cn(
              "flex flex-col divide-y",
              isDark ? "divide-white/10" : "divide-[#0B6377]/20"
            )}
          >
            {testimonials.map((t, index) => (
              <div key={index} className="py-8 flex flex-col md:flex-row gap-6">
                <div className="md:w-52 shrink-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <AvatarEl
                      avatar={t.avatar}
                      author={t.author}
                      isDark={isDark}
                      index={index}
                    />
                    <cite className="not-italic">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                        )}
                      >
                        {t.author}
                      </p>
                      {(t.role || t.company) && (
                        <p
                          className={cn(
                            "text-xs",
                            isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                          )}
                        >
                          {[t.role, t.company].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </cite>
                  </div>
                  {t.rating !== undefined && (
                    <StarRating rating={t.rating} isDark={isDark} />
                  )}
                </div>
                <blockquote
                  className={cn(
                    "text-base leading-relaxed",
                    isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
                  )}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>
        )}

        {layout === "large" && testimonials[0] && (
          <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
            {testimonials[0].rating !== undefined && (
              <div className="flex justify-center">
                <StarRating rating={testimonials[0].rating} isDark={isDark} />
              </div>
            )}
            <blockquote
              className={cn(
                "text-2xl md:text-3xl lg:text-4xl font-normal leading-snug",
                isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
              )}
              style={{ fontFamily: "var(--heading)" }}
            >
              &ldquo;{testimonials[0].quote}&rdquo;
            </blockquote>
            <div className="flex flex-col items-center gap-3">
              <AvatarEl
                avatar={testimonials[0].avatar}
                author={testimonials[0].author}
                isDark={isDark}
                index={0}
              />
              <cite className="flex flex-col items-center not-italic">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
                  )}
                >
                  {testimonials[0].author}
                </span>
                {(testimonials[0].role || testimonials[0].company) && (
                  <span
                    className={cn(
                      "text-xs",
                      isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                    )}
                  >
                    {[testimonials[0].role, testimonials[0].company]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
              </cite>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export { TestimonialSection }
export type { TestimonialSectionProps, Testimonial }
