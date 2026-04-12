"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GlossaryTermProps {
  term: string
  definition: string
  category: string
  children: React.ReactNode
}

export function GlossaryTerm({ term, definition, category, children }: GlossaryTermProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className="cursor-help border-b border-dotted transition-colors"
            style={{ borderColor: "var(--gold)", color: "inherit" }}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs rounded-xl px-4 py-3 shadow-lg"
          style={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p className="font-serif text-sm font-medium mb-1" style={{ color: "var(--gold)" }}>
            {term}
          </p>
          <p className="font-sans text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
            {definition}
          </p>
          <p className="font-sans text-[10px] uppercase tracking-wider mt-2" style={{ color: "var(--muted-foreground)" }}>
            {category}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
