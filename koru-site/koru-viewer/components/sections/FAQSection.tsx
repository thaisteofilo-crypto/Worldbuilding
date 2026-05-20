import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  badge?: string
  title?: string
  subtitle?: string
  faqs: FAQ[]
  variant?: "light" | "dark"
  layout?: "single" | "two-column"
  className?: string
}

function FAQSection({
  badge,
  title,
  subtitle,
  faqs,
  variant = "light",
  layout = "single",
  className,
}: FAQSectionProps) {
  const isDark = variant === "dark"
  const titleId = React.useId()

  const accordionNode = (
    <Accordion
      className={cn(
        "w-full",
        isDark
          ? [
              "[&_[data-slot=accordion-item]]:border-[#35BDC8]/30",
              "[&_[data-slot=accordion-trigger]]:text-[#F2F2F2]",
              "[&_[data-slot=accordion-content]]:text-[#92DCE2]",
            ].join(" ")
          : [
              "[&_[data-slot=accordion-item]]:border-[#0B6377]/40",
            ].join(" ")
      )}
    >
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger
            className={cn(
              "text-sm font-semibold py-4 text-left hover:no-underline",
              isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
            )}
          >
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>
            <p
              className={cn(
                "text-sm leading-relaxed pb-2",
                isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
              )}
            >
              {faq.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )

  const header = (centered: boolean) => (
    <div className={cn("flex flex-col gap-4", centered && "items-center text-center")}>
      {badge && (
        <Badge
          variant="outline"
          className={cn(
            "w-fit text-xs tracking-widest uppercase px-3 font-medium font-mono",
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
          className="text-3xl md:text-4xl font-normal tracking-tight"
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
            "text-base leading-relaxed max-w-sm",
            isDark ? "text-[#92DCE2]" : "text-[#1A6872]"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )

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
        {layout === "single" ? (
          <div className="flex flex-col gap-10 max-w-3xl mx-auto">
            {(badge || title || subtitle) && header(true)}
            {accordionNode}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="md:sticky md:top-10">
              {header(false)}
            </div>
            <div>{accordionNode}</div>
          </div>
        )}
      </div>
    </section>
  )
}

export { FAQSection }
export type { FAQSectionProps, FAQ }
