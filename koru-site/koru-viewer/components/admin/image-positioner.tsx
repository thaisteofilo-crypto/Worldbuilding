"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface ImagePosition {
  x: number // 0-100
  y: number // 0-100
  scale: number // 1-2
}

const DEFAULT_POS: ImagePosition = { x: 50, y: 50, scale: 1 }

// Debounce save to API
let saveTimer: ReturnType<typeof setTimeout> | null = null

function savePositionToAPI(key: string, pos: ImagePosition) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fetch("/api/image-positions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, ...pos }),
    }).catch(console.error)
  }, 300)
}

export function ImagePositioner({
  imageKey,
  src,
  alt,
  aspectRatio,
  onPositionChange,
}: {
  imageKey: string
  src: string
  alt: string
  aspectRatio?: string
  onPositionChange?: (pos: ImagePosition) => void
}) {
  const [editing, setEditing] = useState(false)
  const [pos, setPos] = useState<ImagePosition>(DEFAULT_POS)
  const [saving, setSaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Load position from API on mount
  useEffect(() => {
    fetch(`/api/image-positions?key=${encodeURIComponent(imageKey)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.position) {
          setPos({ x: data.position.x, y: data.position.y, scale: data.position.scale ?? 1 })
        }
      })
      .catch(() => {})
  }, [imageKey])

  const updatePos = useCallback(
    (newPos: ImagePosition) => {
      setPos(newPos)
      setSaving(true)
      savePositionToAPI(imageKey, newPos)
      // Clear saving indicator after debounce
      setTimeout(() => setSaving(false), 600)
      onPositionChange?.(newPos)
    },
    [imageKey, onPositionChange]
  )

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editing) return
    isDragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handlePointerMove(e)
  }, [editing])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!editing || !isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
      updatePos({ ...pos, x: Math.round(x), y: Math.round(y) })
    },
    [editing, pos, updatePos]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  return (
    <div className="relative group/positioner">
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ aspectRatio }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full transition-transform duration-150"
          style={{
            objectFit: "cover",
            objectPosition: `${pos.x}% ${pos.y}%`,
            transform: `scale(${pos.scale})`,
            cursor: editing ? "crosshair" : "default",
          }}
          draggable={false}
        />

        {/* Editing overlay */}
        {editing && (
          <>
            <div
              className="absolute inset-0"
              style={{ background: "oklch(0 0 0 / 0.3)", pointerEvents: "none" }}
            />
            {/* Crosshair at focal point */}
            <div
              className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-white" style={{ boxShadow: "0 0 4px oklch(0 0 0 / 0.5)" }} />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white" style={{ boxShadow: "0 0 2px oklch(0 0 0 / 0.5)" }} />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" style={{ boxShadow: "0 0 2px oklch(0 0 0 / 0.5)" }} />
            </div>
            {/* Position readout */}
            <div className="absolute top-2 left-2 rounded px-2 py-1 font-mono text-[10px] text-white flex items-center gap-2" style={{ background: "oklch(0 0 0 / 0.6)" }}>
              {pos.x}% {pos.y}%
              {saving && <span className="text-white/50">salvando...</span>}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      {editing && (
        <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center gap-2" style={{ background: "oklch(0 0 0 / 0.7)" }}>
          {/* Zoom slider */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="shrink-0 opacity-60">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="range"
            min="100"
            max="200"
            value={pos.scale * 100}
            onChange={(e) => updatePos({ ...pos, scale: Number(e.target.value) / 100 })}
            className="flex-1 h-1 accent-white cursor-pointer"
            style={{ accentColor: "white" }}
          />
          <span className="font-mono text-[10px] text-white/70 w-8 text-right shrink-0">
            {Math.round(pos.scale * 100)}%
          </span>
          {/* Preset positions */}
          <div className="flex gap-0.5 ml-1">
            {[
              { label: "TL", x: 20, y: 20 },
              { label: "T", x: 50, y: 20 },
              { label: "C", x: 50, y: 50 },
              { label: "B", x: 50, y: 80 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => updatePos({ ...pos, x: preset.x, y: preset.y })}
                className="w-5 h-5 rounded text-[8px] font-sans font-bold text-white/80 hover:bg-white/20 transition-colors"
                title={preset.label}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {/* Reset */}
          <button
            onClick={() => updatePos(DEFAULT_POS)}
            className="text-[10px] text-white/60 hover:text-white font-sans ml-1"
          >
            Reset
          </button>
        </div>
      )}

      {/* Toggle edit button - visible on hover */}
      <button
        onClick={() => setEditing(!editing)}
        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-opacity opacity-0 group-hover/positioner:opacity-100"
        style={{
          background: editing ? "var(--accent)" : "oklch(0 0 0 / 0.5)",
          opacity: editing ? 1 : undefined,
        }}
        title={editing ? "Concluir posicionamento" : "Reposicionar imagem"}
      >
        {editing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 9l-3 3 3 3" /><path d="M9 5l3-3 3 3" /><path d="M15 19l3 3-3 3" /><path d="M19 9l3 3-3 3" />
            <line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        )}
      </button>
    </div>
  )
}
