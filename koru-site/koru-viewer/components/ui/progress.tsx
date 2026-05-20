import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

/**
 * Progress bar built on @base-ui/react/progress.
 *
 * Simple usage (renders default track + indicator):
 *   <Progress value={75} />
 *
 * Custom usage (bring your own track):
 *   <Progress value={75}>
 *     <ProgressTrack className="h-1" style={{ background: barColor }}>
 *       <ProgressIndicator style={{ background: accentColor }} />
 *     </ProgressTrack>
 *   </Progress>
 */
function Progress({
  className,
  children,
  value,
  "aria-label": ariaLabel,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      aria-label={ariaLabel ?? "Progresso"}
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    >
      {children ?? (
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      )}
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full",
        className
      )}
      style={{ background: "color-mix(in oklch, var(--foreground) 8%, transparent)" }}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full rounded-full transition-all", className)}
      style={{ background: "var(--accent)" }}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("font-sans text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto font-sans text-sm tabular-nums text-[var(--muted-foreground)]",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}