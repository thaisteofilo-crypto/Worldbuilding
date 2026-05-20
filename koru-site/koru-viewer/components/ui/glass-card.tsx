import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.ComponentProps<"div"> {
  variant?: "frosted" | "dark" | "black" | "teal"
  blur?: "sm" | "md" | "lg" | "xl"
}

function GlassCard({
  variant = "frosted",
  blur = "md",
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "rounded-2xl border",
        blur === "sm" && "backdrop-blur-sm",
        blur === "md" && "backdrop-blur-md",
        blur === "lg" && "backdrop-blur-lg",
        blur === "xl" && "backdrop-blur-xl",
        variant === "frosted" && [
          "bg-black/[0.04] border-black/[0.09]",
          "dark:bg-white/10 dark:border-white/25",
          "shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.3)]",
          "dark:shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)]",
          "text-foreground",
        ],
        variant === "teal" && [
          "bg-[#0B717F]/15 border-[#35BDC8]/30",
          "shadow-[0_4px_24px_rgba(11,113,127,0.18),inset_0_1px_0_rgba(53,189,200,0.25)]",
          "text-foreground",
        ],
        variant === "dark" && [
          "bg-black/40 border-white/10",
          "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "text-[#F2F2F2]",
        ],
        variant === "black" && [
          "bg-black/80 border-white/[0.06]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]",
          "text-[#F2F2F2]",
        ],
        className
      )}
      {...props}
    />
  )
}

function GlassCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="glass-card-header" className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
}

function GlassCardTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="glass-card-title" className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
}

function GlassCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="glass-card-description" className={cn("text-sm opacity-75", className)} {...props} />
  )
}

function GlassCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="glass-card-content" className={cn("p-6 pt-0", className)} {...props} />
  )
}

function GlassCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="glass-card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
}

export { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardDescription, GlassCardContent, GlassCardFooter }
