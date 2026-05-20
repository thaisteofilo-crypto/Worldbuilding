"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-[#1A6872] bg-[#F2F2F2] transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3.5 after:-inset-y-3.5 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[#C72211] aria-invalid:ring-3 aria-invalid:ring-[#C72211]/25 aria-invalid:aria-checked:border-[#0B6377] dark:border-[#35BDC8] dark:bg-[#0B363C] data-checked:border-[#0B6377] data-checked:bg-[#0B6377] data-checked:text-[#F2F2F2] dark:data-checked:border-[#35BDC8] dark:data-checked:bg-[#35BDC8] dark:data-checked:text-[#090E17]",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
