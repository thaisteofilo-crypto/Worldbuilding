import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-[#0B6377] bg-[#F2F2F2] text-[#090E17] px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#090E17] placeholder:text-[#5E5E5E] dark:border-[#35BDC8] dark:bg-[#0B363C] dark:text-[#F2F2F2] dark:file:text-[#F2F2F2] dark:placeholder:text-[#92DCE2] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[#C72211] aria-invalid:ring-3 aria-invalid:ring-[#C72211]/25 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
