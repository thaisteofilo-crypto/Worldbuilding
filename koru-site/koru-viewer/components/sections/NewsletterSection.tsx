import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check } from "lucide-react"

interface NewsletterSectionProps {
  badge?: string
  title: string
  subtitle?: string
  placeholder?: string
  ctaLabel?: string
  successMessage?: string
  perks?: string[]
  variant?: "light" | "dark"
  align?: "center" | "left"
  className?: string
}

function NewsletterSection({
  badge,
  title,
  subtitle,
  placeholder = "voce@exemplo.com",
  ctaLabel = "Inscrever",
  successMessage = "Quase lá — confira sua caixa de entrada.",
  perks = [],
  variant = "light",
  align = "center",
  className,
}: NewsletterSectionProps) {
  const isDark = variant === "dark"
  const [submitted, setSubmitted] = React.useState(false)
  const titleId = React.useId()
  const inputId = React.useId()

  return (
    <section
      className={cn(
        "w-full px-6 py-20 md:py-28",
        isDark ? "bg-black" : "bg-white",
        className
      )}
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "mx-auto max-w-3xl flex flex-col gap-6",
          align === "center" && "items-center text-center",
          align === "left" && "items-start text-left"
        )}
      >
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
              "text-base md:text-lg max-w-xl leading-relaxed",
              isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
            )}
          >
            {subtitle}
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
          className={cn(
            "w-full max-w-md flex flex-col sm:flex-row gap-2 mt-2",
            align === "center" && "mx-auto"
          )}
          aria-describedby={submitted ? `${inputId}-success` : undefined}
        >
          <label htmlFor={inputId} className="sr-only">
            E-mail
          </label>
          <div className="relative flex-1">
            <Mail
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
              )}
              aria-hidden="true"
            />
            <Input
              id={inputId}
              type="email"
              required
              aria-required="true"
              placeholder={placeholder}
              disabled={submitted}
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            nativeButton
            disabled={submitted}
            className={cn(
              "h-11 px-6 text-sm font-semibold rounded-lg shrink-0",
              isDark
                ? "bg-[#35BDC8] text-[#090E17] hover:bg-[#2CA0AB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35BDC8]"
                : "bg-[#0B6377] text-[#F2F2F2] hover:bg-[#1A6872] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B6377]"
            )}
          >
            {submitted ? (
              <>
                <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                Inscrito
              </>
            ) : (
              ctaLabel
            )}
          </Button>
        </form>

        {submitted && (
          <p
            id={`${inputId}-success`}
            role="status"
            className={cn(
              "text-sm font-medium",
              isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
            )}
          >
            {successMessage}
          </p>
        )}

        {perks.length > 0 && (
          <ul
            className={cn(
              "flex flex-wrap gap-x-5 gap-y-2 mt-2",
              align === "center" && "justify-center"
            )}
          >
            {perks.map((perk, i) => (
              <li
                key={i}
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs",
                  isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
                )}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    isDark ? "text-[#35BDC8]" : "text-[#0B6377]"
                  )}
                  aria-hidden="true"
                />
                {perk}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export { NewsletterSection }
export type { NewsletterSectionProps }
