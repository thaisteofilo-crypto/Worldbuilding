"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Upload, X } from "lucide-react"
import { EditableText } from "./editable-text"
import { useEditMode } from "./use-edit-mode"

interface EditableHeroProps {
  heroImage?: string
  heroVideo?: string
  tagline: string
  bibliaHref: string
  onSave: (key: string, value: string) => Promise<void>
  onBannerUpload?: (file: File, slot: string) => Promise<void>
  onBannerRemove?: (slot: string) => Promise<void>
}

export function EditableHero({
  heroImage,
  heroVideo,
  tagline,
  bibliaHref,
  onSave,
  onBannerUpload,
  onBannerRemove,
}: EditableHeroProps) {
  const { isEditing } = useEditMode()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasBanner = !!(heroVideo || heroImage)
  const bannerExists = !!(heroVideo || heroImage)

  function triggerUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
      fileInputRef.current.click()
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onBannerUpload) return
    const slot = file.type.startsWith("video/") ? "hero-video" : "hero"
    onBannerUpload(file, slot)
  }

  function handleRemove() {
    if (!onBannerRemove) return
    if (heroVideo) onBannerRemove("hero-video")
    else if (heroImage) onBannerRemove("hero")
  }

  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
      style={{ minHeight: "100vh", marginTop: 44 }}
    >
      {/* Background media */}
      {heroVideo ? (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={heroVideo}
            poster={heroImage}
          />
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.4)" }}
          />
        </>
      ) : heroImage ? (
        <>
          <Image
            src={heroImage}
            alt="Korú"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.4)" }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}

      {/* Upload overlay — only in edit mode */}
      {isEditing && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          style={{
            zIndex: 5,
            background: "oklch(0 0 0 / 0.35)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={triggerUpload}
            title="Fazer upload do banner"
            className="flex items-center justify-center w-12 h-12 rounded-full transition-colors"
            style={{
              background: "oklch(1 0 0 / 0.15)",
              border: "1.5px solid oklch(1 0 0 / 0.35)",
              color: "white",
            }}
          >
            <Upload size={20} />
          </button>
          {bannerExists && onBannerRemove && (
            <button
              type="button"
              onClick={handleRemove}
              title="Remover banner"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
              style={{
                background: "oklch(0 0 0 / 0.25)",
                border: "1.5px solid oklch(1 0 0 / 0.25)",
                color: "white",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative px-4 sm:px-8 md:px-16" style={{ zIndex: 10 }}>
        <h1
          className="font-serif leading-[0.85] mb-8"
          style={{
            fontSize: "clamp(6rem, 18vw, 14rem)",
            color: hasBanner ? "white" : "var(--foreground)",
            fontFamily: "var(--font-serif), Georgia, serif",
            textShadow: "none",
          }}
        >
          Korú
        </h1>

        <EditableText
          value={tagline}
          onSave={(value: string) => onSave("hero.tagline", value)}
          className="text-lg md:text-2xl leading-relaxed max-w-xl font-sans mb-8"
          style={{
            color: hasBanner ? "oklch(1 0 0 / 0.9)" : "var(--muted-foreground)",
            textShadow: hasBanner ? "0 1px 8px oklch(0 0 0 / 0.5)" : undefined,
          }}
        />

        {!isEditing && (
          <Link
            href={bibliaHref}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md"
            style={{ animationDelay: "0.7s" }}
          >
            Comecar pela biblia
          </Link>
        )}
      </div>
    </section>
  )
}
