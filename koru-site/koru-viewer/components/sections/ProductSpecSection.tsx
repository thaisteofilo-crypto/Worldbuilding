import * as React from "react"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface SpecItem {
  label: string
  value: string
}

interface ProductSpecSectionProps {
  videoHeading?: string
  videoSrc?: string
  thumbnailSrc?: string
  specsHeading: string
  specs: SpecItem[]
  variant?: "light" | "dark"
  className?: string
}

function ProductSpecSection({
  videoHeading = "Watch the keynote",
  videoSrc,
  thumbnailSrc,
  specsHeading,
  specs,
  variant = "light",
  className,
}: ProductSpecSectionProps) {
  const [playing, setPlaying] = React.useState(false)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const headingId = React.useId()

  const isDark = variant === "dark"

  const sectionBg = isDark ? "bg-black" : "bg-white"
  const headingColor = isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
  const specsHeadingColor = isDark ? "text-[#F2F2F2]" : "text-[#090E17]"
  const labelColor = isDark ? "text-[#DEF7F9]" : "text-[#090E17]"
  const valueColor = isDark ? "text-[#92DCE2]" : "text-[#114F56]"
  const dividerColor = isDark ? "border-[#1A6872]" : "border-[#D4D4D4]"

  // Pair specs into rows of 2 columns
  const specRows: [SpecItem, SpecItem | undefined][] = []
  for (let i = 0; i < specs.length; i += 2) {
    specRows.push([specs[i], specs[i + 1]])
  }

  function handlePlayClick() {
    if (videoRef.current) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <section
      className={cn("w-full px-6 py-20 md:py-28", sectionBg, className)}
      aria-labelledby={headingId}
    >
      <div className="mx-auto max-w-5xl">
        {/* Centered video heading */}
        <h2
          id={headingId}
          className={cn(
            "mb-10 text-center text-3xl md:text-4xl lg:text-5xl tracking-tight",
            headingColor
          )}
          style={{ fontFamily: "var(--heading)" }}
        >
          {videoHeading}
        </h2>

        {/* Video area */}
        <div className="mx-auto max-w-[800px]">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#090E17]">
            {videoSrc ? (
              <>
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={thumbnailSrc}
                  controls={playing}
                  className="h-full w-full object-cover"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  aria-label={videoHeading}
                />
                {!playing && (
                  <button
                    onClick={handlePlayClick}
                    className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35BDC8] focus-visible:ring-offset-2"
                    aria-label="Play video"
                    type="button"
                  >
                    {thumbnailSrc && (
                      <img
                        src={thumbnailSrc}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B6377] shadow-lg transition-transform hover:scale-105 active:scale-95">
                      <Play className="h-7 w-7 translate-x-0.5 text-[#F2F2F2]" aria-hidden="true" />
                    </span>
                  </button>
                )}
              </>
            ) : (
              /* Placeholder when no videoSrc */
              <div
                className="flex h-full w-full items-center justify-center"
                aria-hidden="true"
              >
                {thumbnailSrc && (
                  <img
                    src={thumbnailSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B6377] shadow-lg">
                  <Play className="h-7 w-7 translate-x-0.5 text-[#F2F2F2]" aria-hidden="true" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Specs area */}
        <div className="mt-16 flex flex-col gap-0 md:flex-row md:gap-12 lg:gap-20">
          {/* Left col — section heading */}
          <div className="mb-10 shrink-0 md:mb-0 md:w-56 lg:w-64">
            <h3
              className={cn("text-3xl leading-tight tracking-tight", specsHeadingColor)}
              style={{ fontFamily: "var(--heading)" }}
            >
              {specsHeading}
            </h3>
          </div>

          {/* Right col — 2-column spec grid */}
          <div className="flex-1">
            {specRows.map((row, rowIdx) => (
              <div key={rowIdx}>
                {/* Divider above every row */}
                <div className={cn("border-t", dividerColor)} aria-hidden="true" />

                <dl className="grid grid-cols-1 gap-6 py-5 sm:grid-cols-2">
                  {row.map((spec, colIdx) =>
                    spec ? (
                      <div key={colIdx} className="flex flex-col gap-1">
                        <dt className={cn("text-sm font-medium", labelColor)}>{spec.label}</dt>
                        <dd className={cn("text-sm leading-relaxed", valueColor)}>{spec.value}</dd>
                      </div>
                    ) : null
                  )}
                </dl>
              </div>
            ))}

            {/* Bottom divider */}
            <div className={cn("border-t", dividerColor)} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}

export { ProductSpecSection }
export type { ProductSpecSectionProps, SpecItem }
