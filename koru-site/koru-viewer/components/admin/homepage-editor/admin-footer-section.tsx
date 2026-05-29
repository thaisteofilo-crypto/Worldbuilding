"use client"

import { useRef } from "react"
import Image from "next/image"
import { useEditMode } from "./use-edit-mode"
import { EditableText } from "./editable-text"

interface AdminFooterSectionProps {
  footerImage?: string
  footerVideo?: string
  copyright: string
  copyrightKey: string
  onSave: (key: string, value: string) => Promise<void>
  onBannerUpload?: (file: File, slot: string) => Promise<void>
}

export function AdminFooterSection({
  footerImage,
  footerVideo,
  copyright,
  copyrightKey,
  onSave,
  onBannerUpload,
}: AdminFooterSectionProps) {
  const { isEditing } = useEditMode()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasBanner = !!(footerVideo || footerImage)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !onBannerUpload) return
    const slot = file.type.startsWith("video/") ? "footer-video" : "footer"
    onBannerUpload(file, slot)
    e.target.value = ""
  }

  return (
    <footer
      className="relative flex flex-col items-center justify-end overflow-hidden"
      style={{ minHeight: "40vh", paddingBottom: "3rem" }}
    >
      {footerVideo ? (
        <>
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={footerVideo}
            poster={footerImage}
          />
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.55)" }}
          />
        </>
      ) : footerImage ? (
        <>
          <Image src={footerImage} alt="" fill className="object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.55)" }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-background" />
      )}

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
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-sans font-medium"
            style={{
              background: "oklch(0 0 0 / 0.55)",
              color: "oklch(1 0 0 / 0.85)",
              border: "1px solid oklch(1 0 0 / 0.25)",
            }}
          >
            Banner
          </button>
        </div>
      )}

      <div className="relative z-10 text-center px-4">
        <EditableText
          value={copyright}
          contentKey={copyrightKey}
          onSave={onSave}
          as="p"
          className="font-sans text-xs"
          style={{ color: hasBanner ? "oklch(1 0 0 / 0.45)" : "var(--muted-foreground)" }}
        />
      </div>
    </footer>
  )
}
