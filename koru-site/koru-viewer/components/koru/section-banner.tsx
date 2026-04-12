import Image from "next/image"
import fs from "fs"
import path from "path"

interface SectionBannerProps {
  imageSrc: string
  fallbackHue: number
  alt: string
  overlay?: "strong" | "bottom" | "none"
}

function imageExists(src: string): boolean {
  const filePath = path.join(process.cwd(), "public", src)
  return fs.existsSync(filePath)
}

export function SectionBanner({
  imageSrc,
  fallbackHue,
  alt,
  overlay = "bottom",
}: SectionBannerProps) {
  const hasImage = imageExists(imageSrc)

  return (
    <div className="absolute inset-0">
      {hasImage ? (
        <>
          <Image src={imageSrc} alt={alt} fill className="object-cover" priority />
          {/* Overlay for readability over image */}
          {overlay === "strong" && (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, var(--background) 5%, var(--background)/80 30%, transparent 70%)",
              }}
            />
          )}
          {overlay === "bottom" && (
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, var(--background) 5%, transparent 60%)",
              }}
            />
          )}
        </>
      ) : (
        /* Atmospheric gradient placeholder — adapts to light/dark via oklch lightness */
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{
            background: `linear-gradient(
              160deg,
              oklch(0.90 0.04 ${fallbackHue}) 0%,
              oklch(0.85 0.06 ${(fallbackHue + 30) % 360}) 50%,
              oklch(0.92 0.03 ${(fallbackHue - 15 + 360) % 360}) 100%
            )`,
          }}
        />
      )}
    </div>
  )
}
