import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 text-xs font-medium font-mono tracking-wide whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-[#C72211] text-[#F2F2F2] focus-visible:ring-[#C72211]/30 [a]:hover:bg-[#A01D0E] dark:bg-[#C72211] dark:text-[#F2F2F2] dark:focus-visible:ring-[#C72211]/40",
        success:
          "bg-[#4A5724] text-[#F2F2F2] focus-visible:ring-[#4A5724]/30 [a]:hover:bg-[#3A4519] dark:bg-[#C5CC8B] dark:text-[#1A1E08] dark:focus-visible:ring-[#C5CC8B]/40",
        warning:
          "bg-[#7A5519] text-[#F2F2F2] focus-visible:ring-[#7A5519]/30 [a]:hover:bg-[#5E4113] dark:bg-[#E8D4A8] dark:text-[#2A1D08] dark:focus-visible:ring-[#E8D4A8]/40",
        outline:
          "border-[#0B6377] text-[#090E17] dark:border-[#35BDC8] dark:text-[#DEF7F9] [a]:hover:bg-[#DEF7F9] dark:[a]:hover:bg-[#1A6872]/30",
        ghost:
          "text-[#090E17] dark:text-[#F2F2F2] hover:bg-[#DEF7F9] dark:hover:bg-[#1A6872]/30",
        link: "text-[#0B6377] dark:text-[#35BDC8] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
