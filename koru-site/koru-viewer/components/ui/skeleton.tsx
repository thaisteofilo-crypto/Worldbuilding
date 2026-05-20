import * as React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("animate-pulse rounded-md bg-[#DEF7F9] dark:bg-[#0B363C]", className)}
      {...props}
    />
  )
}

function SkeletonContainer({
  className,
  "aria-label": ariaLabel = "Carregando...",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-container"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonContainer }
