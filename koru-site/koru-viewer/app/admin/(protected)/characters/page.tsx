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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sizeWarning, setSizeWarning] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Revoke previous preview URL if any
    if (previewUrl) URL.revokeObjectURL(previewUrl)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSizeWarning(null)

    // Validate dimensions
    const img = new window.Image()
    img.onload = () => {
      if (img.naturalWidth < 400 || img.naturalHeight < 400) {
        setSizeWarning(
          `Imagem pequena (${img.naturalWidth}x${img.naturalHeight}px). Recomendado: minimo 400x400px.`
        )
      }
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl

    onUpload(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  // Revoke preview URL when upload completes (url prop updated) or on unmount
  useEffect(() => {
    if (!uploading && previewUrl) {
      setPreviewUrl(null)
    }
  }, [uploading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayUrl = url || previewUrl || null

  return (
    <div className="flex flex-col">
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          ...(!displayUrl ? { aspectRatio: "16/9" } : {}),
        }}
      >
        {displayUrl ? (
          url ? (
            <ImagePositioner
              imageKey={`char-${character.slug}-${view.key}`}
              src={url}
              alt={`${character.name}: ${view.label}`}
              aspectRatio="16/9"
            />
          ) : (
            // Local preview before upload completes
            <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl!}
                alt={`preview: ${view.label}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )
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

      {/* Dimension warning */}
      {sizeWarning && (
        <p
          className="mt-1 font-sans text-xs leading-snug"
          style={{ color: "oklch(0.72 0.13 75)" }}
        >
          {sizeWarning}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="font-sans text-xs tracking-[0.08em] uppercase" style={{ color: "var(--muted-foreground)" }}>
          {view.label}
        </span>
        <div className="flex gap-1">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="absolute w-0 h-0 opacity-0 overflow-hidden" />
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

function NewCharacterForm({ onCreated }: { onCreated: (char: Character) => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", role: "", species: "", morphology: "" })

  function handleChange(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        onCreated(data.character)
        setForm({ name: "", slug: "", role: "", species: "", morphology: "" })
        setOpen(false)
      } else {
        const data = await res.json()
        alert(data.error || "Erro ao criar personagem")
      }
    } catch {
      alert("Erro de rede")
    }
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-5 py-2 font-sans text-sm transition-opacity hover:opacity-80 flex items-center gap-2"
        style={{ background: "var(--foreground)", color: "var(--background)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Novo personagem
      </button>
    )
  }

  const fieldStyle = {
    background: "var(--background)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  }

  return (
    <div className="rounded-xl p-5 glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg" style={{ color: "var(--foreground)" }}>Novo personagem</h3>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full w-7 h-7 flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Nome *</label>
          <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required
            className="mt-1 w-full rounded-lg px-3 py-2 font-sans text-sm outline-none" style={fieldStyle} placeholder="Ex: Temiku" />
        </div>
        <div>
          <label className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Slug *</label>
          <input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required
            className="mt-1 w-full rounded-lg px-3 py-2 font-sans text-sm outline-none" style={fieldStyle} placeholder="temiku" />
        </div>
        <div>
          <label className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Papel</label>
          <input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="mt-1 w-full rounded-lg px-3 py-2 font-sans text-sm outline-none" style={fieldStyle} placeholder="Protagonista, Antagonista..." />
        </div>
        <div>
          <label className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Especie</label>
          <input value={form.species} onChange={(e) => setForm((p) => ({ ...p, species: e.target.value }))}
            className="mt-1 w-full rounded-lg px-3 py-2 font-sans text-sm outline-none" style={fieldStyle} placeholder="Azuri, Onkweri, Hibrido..." />
        </div>
        <div className="md:col-span-2">
          <label className="font-sans text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--muted-foreground)" }}>Morfologia</label>
          <textarea value={form.morphology} onChange={(e) => setForm((p) => ({ ...p, morphology: e.target.value }))} rows={2}
            className="mt-1 w-full rounded-lg px-3 py-2 font-sans text-sm outline-none resize-y" style={fieldStyle}
            placeholder="Quadrupede com chifres, pelagem..." />
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end pt-1">
          <button type="button" onClick={() => setOpen(false)}
            className="rounded-full px-4 py-1.5 font-sans text-xs" style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving || !form.name.trim()}
            className="rounded-full px-5 py-1.5 font-sans text-xs transition-opacity disabled:opacity-50"
            style={{ background: "var(--foreground)", color: "var(--background)" }}>
            {saving ? "Criando..." : "Criar personagem"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [charImages, setCharImages] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchCharacters = () => {
    Promise.all([
      fetch("/api/characters").then((r) => r.json()),
      fetch("/api/characters/image").then((r) => r.json()),
    ]).then(([charData, imageData]) => {
      setCharacters(charData.characters || [])
      setCharImages(imageData.images || {})
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchCharacters()
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

  async function deleteCharacter(id: string, name: string) {
    if (!confirm(`Remover ${name}? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    const res = await fetch("/api/characters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setCharacters((prev) => prev.filter((c) => c.id !== id))
    } else {
      const data = await res.json()
      alert(data.error || "Erro ao remover personagem")
    }
    setDeleting(null)
  }

  async function moveCharacter(id: string, direction: "up" | "down") {
    const index = characters.findIndex((c) => c.id === id)
    if (direction === "up" && index === 0) return
    if (direction === "down" && index === characters.length - 1) return

    const swapIndex = direction === "up" ? index - 1 : index + 1
    const newChars = [...characters]
    ;[newChars[index], newChars[swapIndex]] = [newChars[swapIndex], newChars[index]]
    setCharacters(newChars)

    await Promise.all([
      fetch("/api/characters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newChars[index].id, order_index: index }),
      }),
      fetch("/api/characters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: newChars[swapIndex].id, order_index: swapIndex }),
      }),
    ])
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

  function handleCharacterCreated(char: Character) {
    setCharacters((prev) => [...prev, char])
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Personagens</h1>
          <p className="mt-1 font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
            {characters.length} personagens, use ↑↓ para reordenar, clique nos campos para editar
          </p>
        </div>
        <NewCharacterForm onCreated={handleCharacterCreated} />
      </div>

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
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCharacter(char.id, "up")}
                    disabled={characters.indexOf(char) === 0}
                    className="w-6 h-6 flex items-center justify-center rounded transition-opacity hover:opacity-100 disabled:opacity-20"
                    style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                    title="Mover para cima"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveCharacter(char.id, "down")}
                    disabled={characters.indexOf(char) === characters.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded transition-opacity hover:opacity-100 disabled:opacity-20"
                    style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                    title="Mover para baixo"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>
                <h2 className="font-serif text-xl flex-1" style={{ color: "var(--foreground)" }}>{char.name}</h2>
                <span className="font-sans text-xs" style={{ color: "var(--muted-foreground)" }}>{char.slug}</span>
                {/* Delete button */}
                <button
                  onClick={() => deleteCharacter(char.id, char.name)}
                  disabled={deleting === char.id}
                  className="group ml-2 w-7 h-7 flex items-center justify-center rounded-full transition-colors disabled:opacity-50"
                  style={{ color: "var(--muted-foreground)", border: "1px solid var(--border)" }}
                  title="Remover personagem"
                >
                  {deleting === char.id ? (
                    <span className="font-sans text-[10px]">...</span>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className="transition-colors group-hover:stroke-red-400">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 3 image views */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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

              {/* Quote */}
              {char.quote && (
                <div className="mb-4 px-4 py-3 rounded-lg" style={{ background: "var(--surface)", borderLeft: "2px solid var(--muted-foreground)" }}>
                  <p className="font-serif text-sm italic leading-relaxed" style={{ color: "var(--foreground)", opacity: 0.8 }}>
                    &ldquo;{char.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Character details — identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <EditableField label="Papel" value={char.role ?? ""} onSave={(v) => saveField(char.id, "role", v)} />
                <EditableField label="Especie" value={char.species ?? ""} onSave={(v) => saveField(char.id, "species", v)} />
                <EditableField label="Status" value={char.status ?? ""} onSave={(v) => saveField(char.id, "status", v)} />
              </div>

              {/* Character details — physical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-3 mt-2" style={{ borderTop: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                <EditableField label="Morfologia" value={char.morphology ?? ""} onSave={(v) => saveField(char.id, "morphology", v)} multiline />
                <EditableField label="Habilidade" value={char.ability ?? ""} onSave={(v) => saveField(char.id, "ability", v)} multiline />
                <EditableField label="Marca (Isilo-Ori)" value={char.mark ?? ""} onSave={(v) => saveField(char.id, "mark", v)} multiline />
              </div>

              {/* Character details — world */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-3 mt-2" style={{ borderTop: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                <EditableField label="Origem" value={char.origin ?? ""} onSave={(v) => saveField(char.id, "origin", v)} />
                <EditableField label="Localização" value={char.location ?? ""} onSave={(v) => saveField(char.id, "location", v)} />
                <EditableField label="Citação" value={char.quote ?? ""} onSave={(v) => saveField(char.id, "quote", v)} />
              </div>

              {/* Description — full width */}
              <div className="pt-3 mt-2" style={{ borderTop: "1px solid color-mix(in oklch, var(--border) 50%, transparent)" }}>
                <EditableField label="Descrição" value={char.description ?? ""} onSave={(v) => saveField(char.id, "description", v)} multiline />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
