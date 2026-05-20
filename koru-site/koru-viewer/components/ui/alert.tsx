import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 *:[svg]:aria-hidden",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-[#FCEBE9] border-[#C72211]/35 text-[#5C0C0C] dark:bg-[#2D0808] dark:border-[#C72211]/45 dark:text-[#FCA5A5] *:data-[slot=alert-description]:text-[#5C0C0C] dark:*:data-[slot=alert-description]:text-[#FCA5A5] *:[svg]:text-[#C72211] dark:*:[svg]:text-[#FCA5A5]",
        success:
          "bg-[#F0F2E1] border-[#4A5724]/35 text-[#2D330F] dark:bg-[#1A1E08] dark:border-[#4A5724]/45 dark:text-[#C5CC8B] *:data-[slot=alert-description]:text-[#2D330F] dark:*:data-[slot=alert-description]:text-[#C5CC8B] *:[svg]:text-[#4A5724] dark:*:[svg]:text-[#C5CC8B]",
        warning:
          "bg-[#FAF1DF] border-[#7A5519]/35 text-[#3F2A0A] dark:bg-[#2A1D08] dark:border-[#7A5519]/45 dark:text-[#E8D4A8] *:data-[slot=alert-description]:text-[#3F2A0A] dark:*:data-[slot=alert-description]:text-[#E8D4A8] *:[svg]:text-[#7A5519] dark:*:[svg]:text-[#E8D4A8]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  role,
  "aria-live": ariaLive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  // destructive → role="alert" (assertive); informational variants → role="status" (polite)
  const resolvedRole = role ?? (variant === "destructive" ? "alert" : "status")
  const resolvedAriaLive = ariaLive ?? (variant === "destructive" ? "assertive" : "polite")
  return (
    <div
      data-slot="alert"
      role={resolvedRole}
      aria-live={resolvedAriaLive}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium font-mono tracking-wide group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
