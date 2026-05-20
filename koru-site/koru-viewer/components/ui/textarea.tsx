import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-border bg-background px-3 py-2 text-base font-sans text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50 resize-none md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }