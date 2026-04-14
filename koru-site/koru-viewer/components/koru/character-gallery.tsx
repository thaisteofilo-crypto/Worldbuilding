"use client"

import { useState } from "react"
import Image from "next/image"

interface GalleryView {
  key: string
  label: string
  src: string | null
}

interface CharacterGalleryProps {
  name: string
  views: GalleryView[]
}

export function CharacterGallery({ name, views }: CharacterGalleryProps) {
  const firstWithImage = views.find((v) => v.src !== null)
  const [activeKey, setActiveKey] = useState<string>(
    firstWithImage?.key ?? views[0]?.key ?? "frente"
  )

  const activeView = views.find((v) => v.key === activeKey) ?? views[0]

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "2/3", backgroundColor: "var(--surface)" }}
      >
        {activeView?.src ? (
          <Image
            src={activeView.src}
            alt={`${name} — ${activeView.label}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-15"
              style={{ color: "var(--foreground)" }}
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
              {activeView?.label}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails row */}
      <div className="flex gap-2">
        {views.map((view) => {
          const isActive = view.key === activeKey
          return (
            <button
              key={view.key}
              onClick={() => setActiveKey(view.key)}
              aria-label={`Ver ${view.label} de ${name}`}
              aria-pressed={isActive}
              className="relative overflow-hidden rounded-lg flex-shrink-0 transition-all duration-200"
              style={{
                width: 64,
                height: 64,
                backgroundColor: "var(--surface)",
                border: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid var(--border)",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {view.src ? (
                <Image
                  src={view.src}
                  alt={`${name} — ${view.label}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-20"
                    style={{ color: "var(--foreground)" }}
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                </div>
              )}
              {/* Label overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 py-0.5 flex items-center justify-center"
                style={{
                  backgroundColor: isActive
                    ? "oklch(from var(--accent) l c h / 0.85)"
                    : "oklch(0 0 0 / 0.45)",
                }}
              >
                <span
                  className="font-sans leading-none"
                  style={{
                    fontSize: "9px",
                    color: isActive ? "var(--background)" : "var(--foreground)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {view.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
