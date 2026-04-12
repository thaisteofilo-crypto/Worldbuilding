"use client"

import { useEffect, useState, useRef } from "react"
import { ImagePositioner } from "@/components/admin/image-positioner"
import type { Character } from "@/lib/database.types"

const VIEWS = [
  { key: "front", label: "Frente" },
  { key: "profile", label: "Perfil" },
  { key: "back", label: "Costa" },
] as const

type ViewKey = (typeof VIEWS)[number]["key"]

function ViewImageSlot({
  character,
  view,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  character: Character
  view: { key: ViewKey; label: string }
  url?: string
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          ...(!url ? { aspectRatio: "2/3" } : {}),
        }}
      >
        {url ? (
          <ImagePositioner
            imageKey={`char-${character.slug}-${view.key}`}
            src={url}
            alt={`${character.name} — ${view.label}`}
            aspectRatio="2/3"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" style={{ color: "var(--muted-foreground)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              {view.label}
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-white text-sm font-sans">Enviando...</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-sans text-xs tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {view.label}
        </span>
        <div className="flex gap-1">
          <input ref={inputRef} type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            if (inputRef.current) inputRef.current.value = ""
          }} className="absolute w-0 h-0 opacity-0 overflow-hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full px-3 py-1 font-sans text-[11px] transition-opacity disabled:opacity-50"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            {url ? "Trocar" : "Enviar"}
          </button>
          {url && (
            <button
              onClick={onRemove}
              disabled={uploading}
              className="rounded-full px-3 py-1 font-sans text-[11px] transition-opacity disabled:opacity-50"
              style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
            >
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function EditableField({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setDraft(value)
    setEditing(true)
  }

  async function save() {
    if (draft === value) { setEditing(false); return }
    setSaving(true)
    await onSave(draft)
    setSaving(false)
    setEditing(false)
  }

  function cancel() { setDraft(value); setEditing(false) }

  if (editing) {
    return (
      <div>
        <p className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</p>
        {multiline ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus
            className="mt-1 w-full rounded px-2 py-1 font-sans text-xs leading-relaxed outline-none"
            style={{ background: "var(--background)", border: "1px solid var(--foreground)", color: "var(--foreground)", resize: "vertical" }}
          />
        ) : (
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            className="mt-1 w-full rounded px-2 py-1 font-sans text-xs outline-none"
            style={{ background: "var(--background)", border: "1px solid var(--foreground)", color: "var(--foreground)" }}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
          />
        )}
        <div className="mt-1 flex gap-1">
          <button onClick={save} disabled={saving}
            className="rounded px-2 py-0.5 font-sans text-[10px] uppercase"
            style={{ background: "var(--foreground)", color: "var(--background)" }}>
            {saving ? "..." : "Salvar"}
          </button>
          <button onClick={cancel}
            className="rounded px-2 py-0.5 font-sans text-[10px] uppercase"
            style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-[var(--surface)]" onClick={startEdit}>
      <p className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>{label}</p>
      <p className="mt-0.5 font-sans text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
        {value}
        <span className="ml-1 inline-block opacity-0 transition-opacity group-hover:opacity-50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
        </span>
      </p>
    </div>
  )
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [charImages, setCharImages] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/characters").then((r) => r.json()),
      fetch("/api/characters/image").then((r) => r.json()),
    ]).then(([charData, imageData]) => {
      setCharacters(charData.characters || [])
      setCharImages(imageData.images || {})
      setLoading(false)
    })
  }, [])

  function updateCharacter(id: string, updates: Partial<Character>) {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  async function saveField(id: string, field: string, value: string) {
    const res = await fetch("/api/characters", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, [field]: value }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Erro ao salvar")
      return
    }
    updateCharacter(id, { [field]: value } as Partial<Character>)
  }

  async function handleUpload(character: Character, view: ViewKey, file: File) {
    const uploadKey = `${character.slug}-${view}`
    setUploading(uploadKey)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("characterId", character.id)
    formData.append("slug", character.slug)
    formData.append("view", view)

    const res = await fetch("/api/characters/image", { method: "POST", body: formData })
    const data = await res.json()

    if (data.url) {
      setCharImages((prev) => ({
        ...prev,
        [character.slug]: { ...prev[character.slug], [view]: data.url },
      }))
      if (view === "front") {
        updateCharacter(character.id, { image_url: data.url })
      }
    } else {
      alert(data.error || "Erro ao enviar imagem")
    }
    setUploading(null)
  }

  async function handleRemove(character: Character, view: ViewKey) {
    const uploadKey = `${character.slug}-${view}`
    setUploading(uploadKey)

    await fetch("/api/characters/image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: character.id, slug: character.slug, view }),
    })

    setCharImages((prev) => {
      const updated = { ...prev[character.slug] }
      delete updated[view]
      return { ...prev, [character.slug]: updated }
    })
    if (view === "front") {
      updateCharacter(character.id, { image_url: null })
    }
    setUploading(null)
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Personagens</h1>
        <p className="mt-4 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Personagens</h1>
      <p className="mt-1 font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
        {characters.length} personagens — 3 vistas por personagem (frente, perfil, costa) — clique nos campos para editar
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {characters.length === 0 ? (
          <div className="rounded-xl px-5 py-10 text-center glass-card">
            <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum personagem encontrado.</p>
            <p className="mt-1 font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
              Execute <code className="font-mono" style={{ color: "var(--foreground)" }}>node scripts/seed-characters.mjs</code> para popular.
            </p>
          </div>
        ) : (
          characters.map((char) => (
            <div key={char.id} className="rounded-xl p-5 glass-card">
              {/* Character name header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 shrink-0 rounded" style={{
                  background: char.gradient ?? `color-mix(in oklch, ${char.accent_color ?? "var(--accent)"} 30%, var(--surface))`,
                  border: `1px solid ${char.accent_color ?? "var(--border)"}`,
                }} />
                <h2 className="font-serif text-xl" style={{ color: "var(--foreground)" }}>{char.name}</h2>
                <span className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>{char.slug}</span>
              </div>

              {/* 3 image views */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {VIEWS.map((view) => (
                  <ViewImageSlot
                    key={view.key}
                    character={char}
                    view={view}
                    url={charImages[char.slug]?.[view.key]}
                    uploading={uploading === `${char.slug}-${view.key}`}
                    onUpload={(file) => handleUpload(char, view.key, file)}
                    onRemove={() => handleRemove(char, view.key)}
                  />
                ))}
              </div>

              {/* Character details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                {char.role && <EditableField label="Papel" value={char.role} onSave={(v) => saveField(char.id, "role", v)} />}
                {char.morphology && <EditableField label="Morfologia" value={char.morphology} onSave={(v) => saveField(char.id, "morphology", v)} multiline />}
                {char.ability && <EditableField label="Habilidade" value={char.ability} onSave={(v) => saveField(char.id, "ability", v)} multiline />}
                {char.status && <EditableField label="Status" value={char.status} onSave={(v) => saveField(char.id, "status", v)} />}
                {char.origin && <EditableField label="Origem" value={char.origin} onSave={(v) => saveField(char.id, "origin", v)} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
