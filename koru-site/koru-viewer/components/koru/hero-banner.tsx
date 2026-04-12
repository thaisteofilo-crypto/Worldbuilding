import Image from "next/image"
import fs from "fs"
import path from "path"

interface HeroBannerProps {
  title: string
  subtitle?: string
  accentColor?: string
  imageSrc?: string
  videoSrc?: string
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
}: HeroBannerProps) {
  const hasImage = imageSrc && assetExists(imageSrc)
  const hasVideo = videoSrc && assetExists(videoSrc)

  return (
    <div
      className="relative w-full h-[360px] md:h-[440px] overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
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
      ) : null}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full max-w-3xl mx-auto px-6 md:px-10 pb-8">
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
