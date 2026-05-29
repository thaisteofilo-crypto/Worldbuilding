"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { EditableText } from "./editable-text"
import { useEditMode } from "./use-edit-mode"

interface EditableSectionProps {
  title: string
  titleKey: string
  description?: string
  descriptionKey?: string
  label?: string
  labelKey?: string
  bannerUrl?: string
  videoUrl?: string
  bannerSlot: string
  children: React.ReactNode
  onSave: (key: string, value: string) => Promise<void>
  onBannerUpload?: (file: File, slot: string) => Promise<void>
}

export function EditableSection({
  title,
  titleKey,
  description,
  descriptionKey,
  label,
  labelKey,
  bannerUrl,
  videoUrl,
  bannerSlot,
  children,
  onSave,
  onBannerUpload,
}: EditableSectionProps) {
  const { isEditing } = useEditMode()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasBanner = !!(videoUrl || bannerUrl)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onBannerUpload) return
    onBannerUpload(file, bannerSlot)
    e.target.value = ""
  }

  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden py-10 md:py-16 px-4 md:px-16"
      style={{ minHeight: "100vh" }}
    >
      {/* Background layer */}
      {videoUrl ? (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={videoUrl}
            poster={bannerUrl}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)",
            }}
          />
        </>
      ) : bannerUrl ? (
        <>
          <Image
            src={bannerUrl}
            alt=""
            fill
            className="object-cover"
            priority={false}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0 0 0 / 0.7) 0%, oklch(0 0 0 / 0.3) 50%, oklch(0 0 0 / 0.15) 100%)",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}

      {/* Upload button (edit mode only) */}
      {isEditing && onBannerUpload && (
        <div className="absolute top-4 right-4 z-20">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-sans font-medium transition-colors"
            style={{
              background: "oklch(0 0 0 / 0.55)",
              color: "oklch(1 0 0 / 0.85)",
              border: "1px solid oklch(1 0 0 / 0.25)",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Banner
          </button>
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10">
        {label !== undefined && labelKey && (
          <div className="mb-3">
            <EditableText
              value={label}
              contentKey={labelKey}
              onSave={onSave}
              as="p"
              className="font-sans text-xs uppercase tracking-[0.18em]"
              style={{
                color: hasBanner ? "oklch(1 0 0 / 0.55)" : "var(--muted-foreground)",
              }}
            />
          </div>
        )}

        <EditableText
          value={title}
          contentKey={titleKey}
          onSave={onSave}
          as="h2"
          className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-4 md:mb-6"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: hasBanner ? "white" : "var(--foreground)",
            textShadow: hasBanner ? "0 2px 12px oklch(0 0 0 / 0.4)" : undefined,
          }}
        />

        {description !== undefined && descriptionKey && (
          <EditableText
            value={description}
            contentKey={descriptionKey}
            onSave={onSave}
            as="p"
            className="font-sans text-lg md:text-xl leading-relaxed max-w-2xl mb-6 md:mb-8"
            style={{
              color: hasBanner ? "oklch(1 0 0 / 0.85)" : "var(--muted-foreground)",
              textShadow: hasBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
            }}
          />
        )}

        {children}
      </div>
    </section>
  )
}
