import Image from "next/image"
import fs from "fs"
import path from "path"

interface HeroBannerProps {
  title: string
  subtitle?: string
  accentColor?: string
  imageSrc?: string
  videoSrc?: string
  fallbackHue?: number
}

function assetExists(src: string): boolean {
  const filePath = path.join(process.cwd(), "public", src)
  return fs.existsSync(filePath)
}

export function HeroBanner({
  title,
  subtitle,
  accentColor = "var(--gold)",
  imageSrc,
  videoSrc,
  fallbackHue = 65,
}: HeroBannerProps) {
  const hasImage = imageSrc && assetExists(imageSrc)
  const hasVideo = videoSrc && assetExists(videoSrc)

  return (
    <div className="relative w-full h-[360px] md:h-[440px] overflow-hidden">
      {/* Background media */}
      {hasVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : hasImage ? (
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              160deg,
              oklch(0.12 0.03 ${fallbackHue}) 0%,
              oklch(0.08 0.05 ${(fallbackHue + 30) % 360}) 50%,
              oklch(0.06 0.02 ${(fallbackHue - 15 + 360) % 360}) 100%
            )`,
          }}
        />
      )}

      {/* Bottom fade to background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--background) 0%, transparent 30%)",
        }}
      />

      {/* Accent line glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-40"
        style={{ backgroundColor: accentColor }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full max-w-3xl mx-auto px-6 md:px-10 pb-8">
        {subtitle && (
          <p
            className="text-xs uppercase tracking-[0.25em] font-sans mb-3 opacity-70"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
        )}
        <h1
          className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "white",
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
