import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap text-[#090E17] dark:text-[#F2F2F2] transition-all outline-none hover:bg-[#DEF7F9] dark:hover:bg-[#1A6872]/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[#C72211] aria-invalid:ring-[#C72211]/25 aria-pressed:bg-[#0B6377] aria-pressed:text-[#F2F2F2] aria-pressed:ring-2 aria-pressed:ring-[#0B6377]/40 dark:aria-pressed:bg-[#35BDC8] dark:aria-pressed:text-[#090E17] dark:aria-pressed:ring-[#35BDC8]/40 data-[state=on]:bg-[#0B6377] data-[state=on]:text-[#F2F2F2] dark:data-[state=on]:bg-[#35BDC8] dark:data-[state=on]:text-[#090E17] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-[#0B6377] dark:border-[#35BDC8] bg-transparent",
      },
      size: {
        default:
          "h-11 min-w-11 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-9 min-w-9 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 min-w-12 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
