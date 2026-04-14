"use client"

import Image from "next/image"
import { useRef, useState, useEffect } from "react"

export interface HeroBannerProps {
  title: string
  subtitle?: string
  accentColor?: string
  fallbackHue?: number
  imageSrc?: string
  videoSrc?: string
}

export function HeroBanner({
  title,
  subtitle,
  accentColor = "var(--gold)",
  imageSrc,
  videoSrc,
}: HeroBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let rafId: number | null = null

    function onScroll() {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        const container = containerRef.current
        if (container) {
          const rect = container.getBoundingClientRect()
          // Only track scroll while the banner is at least partially visible
          if (rect.bottom > 0) {
            setScrollY(window.scrollY)
          }
        }
        rafId = null
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  const hasImage = Boolean(imageSrc)
  const hasVideo = Boolean(videoSrc)

  const parallaxStyle: React.CSSProperties = {
    transform: `translateY(${scrollY * 0.25}px)`,
    willChange: "transform",
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] md:h-[440px] overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Background media — moves at 25% scroll speed for subtle parallax */}
      {hasVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={parallaxStyle}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : hasImage ? (
        <div className="absolute inset-0" style={parallaxStyle}>
          <Image
            src={imageSrc!}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full max-w-3xl mx-auto px-6 md:px-10 pb-8">
        <h1
          className="koru-content-enter font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "white",
            animationDelay: "0.08s",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="koru-content-enter font-sans text-base md:text-lg text-white/70 mt-2 leading-relaxed"
            style={{ animationDelay: "0.22s" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
