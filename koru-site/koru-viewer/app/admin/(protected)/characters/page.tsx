"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { ImagePositioner } from "@/components/admin/image-positioner"
import type { Character } from "@/lib/database.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton, SkeletonContainer } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, X, ChevronUp, ChevronDown, Trash2, Pencil, Search } from "lucide-react"

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
        className="relative overflow-hidden rounded-xl bg-muted border border-border"
        style={{
          ...(!displayUrl ? { aspectRatio: "16/9" } : {}),
        }}
      >
        {displayUrl ? (
          url ? (
            <ImagePositioner
              imageKey={`char-${character.slug}-${view.key}`}
              src={url}
              alt={`${character.name} — ${view.label}`}
              aspectRatio="16/9"
            />
          ) : (
            // Local preview before upload completes
            <div style={{ aspectRatio: "16/9", position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl!}
                alt={`preview — ${view.label}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Pencil size={36} className="text-muted-foreground opacity-30" strokeWidth={0.8} />
            <span className="font-sans text-xs text-muted-foreground">
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
        <p className="mt-1 font-sans text-xs leading-snug text-muted-foreground">
          {sizeWarning}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="font-sans text-xs tracking-[0.08em] uppercase text-muted-foreground">
          {view.label}
        </span>
        <div className="flex gap-1">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="absolute w-0 h-0 opacity-0 overflow-hidden" />
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            size="xs"
          >
            {url ? "Trocar" : "Enviar"}
          </Button>
          {url && (
            <Button
              onClick={onRemove}
              disabled={uploading}
              variant="outline"
              size="xs"
            >
              Remover
            </Button>
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
        <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">{label}</p>
        {multiline ? (
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} autoFocus
            className="mt-1 min-h-0 font-sans text-xs leading-relaxed resize-vertical py-1"
          />
        ) : (
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
            className="mt-1 font-sans text-xs h-7"
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
          />
        )}
        <div className="mt-1 flex gap-1">
          <Button onClick={save} disabled={saving} size="xs" className="uppercase">
            {saving ? "..." : "Salvar"}
          </Button>
          <Button onClick={cancel} variant="outline" size="xs" className="uppercase">
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer rounded px-1 py-0.5 transition-colors hover:bg-muted" onClick={startEdit}>
      <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-sans text-xs leading-relaxed text-foreground">
        {value}
        <span className="ml-1 inline-block opacity-0 transition-opacity group-hover:opacity-50">
          <Pencil size={10} className="inline" />
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
      <Button
        onClick={() => setOpen(true)}
      >
        <Plus size={14} />
        Novo personagem
      </Button>
    )
  }

  return (
    <GlassCard>
      <GlassCardContent className="pt-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-foreground">Novo personagem</h3>
        <Button
          onClick={() => setOpen(false)}
          variant="outline"
          size="icon-xs"
        >
          <X size={12} />
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Nome *</Label>
          <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required
            className="mt-1 font-sans text-sm" placeholder="Ex: Temiku" />
        </div>
        <div>
          <Label className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Slug *</Label>
          <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required
            className="mt-1 font-sans text-sm" placeholder="temiku" />
        </div>
        <div>
          <Label className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Papel</Label>
          <Input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className="mt-1 font-sans text-sm" placeholder="Protagonista, Antagonista..." />
        </div>
        <div>
          <Label className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Especie</Label>
          <Input value={form.species} onChange={(e) => setForm((p) => ({ ...p, species: e.target.value }))}
            className="mt-1 font-sans text-sm" placeholder="Azuri, Onkweri, Hibrido..." />
        </div>
        <div className="md:col-span-2">
          <Label className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">Morfologia</Label>
          <Textarea value={form.morphology} onChange={(e) => setForm((p) => ({ ...p, morphology: e.target.value }))} rows={2}
            className="mt-1 min-h-0 font-sans text-sm resize-y py-2"
            placeholder="Quadrupede com chifres, pelagem..." />
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end pt-1">
          <Button type="button" onClick={() => setOpen(false)} variant="outline" size="sm">
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !form.name.trim()} size="sm">
            {saving ? "Criando..." : "Criar personagem"}
          </Button>
        </div>
      </form>
      </GlassCardContent>
    </GlassCard>
  )
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [charImages, setCharImages] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Character | null>(null)

  // Filters — client-side
  const [search, setSearch] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null)

  const [loadError, setLoadError] = useState<string | null>(null)

  const speciesOptions = useMemo(() => {
    const set = new Set<string>()
    for (const c of characters) {
      const s = c.species?.trim()
      if (s) set.add(s)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))
  }, [characters])

  const normalizedSearch = search.trim().toLowerCase()
  const isFiltering = normalizedSearch !== "" || speciesFilter !== null

  const filteredCharacters = useMemo(() => {
    if (!isFiltering) return characters
    return characters.filter((c) => {
      if (
        normalizedSearch &&
        !c.name.toLowerCase().includes(normalizedSearch) &&
        !c.slug.toLowerCase().includes(normalizedSearch)
      ) {
        return false
      }
      if (speciesFilter && (c.species?.trim() ?? "") !== speciesFilter) return false
      return true
    })
  }, [characters, normalizedSearch, speciesFilter, isFiltering])

  const fetchCharacters = () => {
    const timeout = setTimeout(() => {
      setLoading(false)
      setLoadError("O servidor demorou mais de 10s para responder. A lista pode estar incompleta.")
    }, 10000)

    Promise.all([
      fetch("/api/characters").then((r) => r.json()),
      fetch("/api/characters/image").then((r) => r.json()),
    ]).then(([charData, imageData]) => {
      clearTimeout(timeout)
      setCharacters(charData.characters || [])
      setCharImages(imageData.images || {})
      setLoading(false)
    }).catch(() => {
      clearTimeout(timeout)
      setLoading(false)
      setLoadError("Não foi possível carregar os personagens.")
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

  async function deleteCharacter(character: Character) {
    setConfirmDelete(null)
    setDeleting(character.id)
    const res = await fetch("/api/characters", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: character.id }),
    })
    if (res.ok) {
      setCharacters((prev) => prev.filter((c) => c.id !== character.id))
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
        <h1 className="font-serif text-3xl text-foreground">Personagens</h1>
        {/* Character card skeletons */}
        <SkeletonContainer className="mt-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="overflow-hidden">
              <GlassCardContent className="pt-4">
                <div className="flex items-center gap-4">
                  {/* Avatar placeholder */}
                  <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Skeleton className="h-4 rounded w-32" />
                    <Skeleton className="h-3 rounded w-24" />
                    <Skeleton className="h-3 rounded w-48" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="w-20 h-20 rounded-lg" />
                    ))}
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </SkeletonContainer>
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
          <h1 className="font-serif text-3xl text-foreground">Personagens</h1>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            {isFiltering
              ? `${filteredCharacters.length} de ${characters.length} personagens`
              : `${characters.length} personagens`}
            {" — use ↑↓ para reordenar — clique nos campos para editar"}
          </p>
          {loadError && (
            <p
              className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-block"
              style={{
                color: "hsl(var(--destructive))",
                background: "hsl(var(--destructive) / 0.08)",
                border: "1px solid hsl(var(--destructive) / 0.25)",
              }}
            >
              {loadError}
            </p>
          )}
        </div>
        <NewCharacterForm onCreated={handleCharacterCreated} />
      </div>

      {/* Search + species filter */}
      {characters.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome..."
              aria-label="Buscar personagem por nome"
              className="h-8 w-56 pl-8 font-sans text-xs"
            />
          </div>
          {speciesOptions.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground">
                Espécie
              </span>
              {speciesOptions.map((sp) => {
                const active = speciesFilter === sp
                return (
                  <Button
                    key={sp}
                    onClick={() => setSpeciesFilter(active ? null : sp)}
                    variant="outline"
                    size="xs"
                    className="font-sans"
                    style={active ? {
                      background: "hsl(var(--primary) / 0.18)",
                      borderColor: "hsl(var(--primary))",
                      color: "hsl(var(--foreground))",
                      fontWeight: 600,
                    } : undefined}
                  >
                    {sp}
                  </Button>
                )
              })}
            </div>
          )}
          {isFiltering && (
            <Button
              onClick={() => { setSearch(""); setSpeciesFilter(null) }}
              variant="ghost"
              size="xs"
              className="font-sans"
            >
              <X size={11} />
              Limpar
            </Button>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {characters.length === 0 ? (
          <GlassCard className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-muted-foreground">Nenhum personagem encontrado.</p>
            <p className="mt-1 font-sans text-xs text-muted-foreground">
              Execute <code className="font-mono text-foreground">node scripts/seed-characters.mjs</code> para popular.
            </p>
          </GlassCard>
        ) : filteredCharacters.length === 0 ? (
          <GlassCard className="px-5 py-10 text-center">
            <p className="font-sans text-sm text-muted-foreground">
              Nenhum personagem corresponde à busca ou aos filtros.
            </p>
          </GlassCard>
        ) : (
          filteredCharacters.map((char) => (
            <GlassCard key={char.id} className="p-5">
              {/* Character name header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 shrink-0 rounded" style={{
                  background: char.gradient ?? `color-mix(in srgb, ${char.accent_color ?? "hsl(var(--primary))"} 30%, hsl(var(--muted)))`,
                  border: `1px solid ${char.accent_color ?? "hsl(var(--border-shadcn))"}`,
                }} />
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <Button
                    onClick={() => moveCharacter(char.id, "up")}
                    disabled={isFiltering || characters.indexOf(char) === 0}
                    variant="outline"
                    size="icon-xs"
                    className="rounded"
                    title={isFiltering ? "Limpe a busca/filtros para reordenar" : "Mover para cima"}
                  >
                    <ChevronUp size={10} />
                  </Button>
                  <Button
                    onClick={() => moveCharacter(char.id, "down")}
                    disabled={isFiltering || characters.indexOf(char) === characters.length - 1}
                    variant="outline"
                    size="icon-xs"
                    className="rounded"
                    title={isFiltering ? "Limpe a busca/filtros para reordenar" : "Mover para baixo"}
                  >
                    <ChevronDown size={10} />
                  </Button>
                </div>
                <h2 className="font-serif text-xl flex-1 text-foreground">{char.name}</h2>
                <span className="font-sans text-xs text-muted-foreground">{char.slug}</span>
                {/* Incomplete badge — shown when any required narrative field is empty */}
                {(["morphology", "ability", "mark", "origin", "location", "quote", "description"] as const).some(
                  (field) => !char[field] || (char[field] as string).trim() === ""
                ) && (
                  <Badge variant="destructive" className="text-[10px] uppercase tracking-wide shrink-0">
                    Incompleto
                  </Badge>
                )}
                {/* Delete button */}
                <Button
                  onClick={() => setConfirmDelete(char)}
                  disabled={deleting === char.id}
                  variant="outline"
                  size="icon-xs"
                  className="ml-2"
                  title="Remover personagem"
                >
                  {deleting === char.id ? (
                    <span className="font-sans text-[10px]">...</span>
                  ) : (
                    <Trash2 size={12} />
                  )}
                </Button>
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
                <div className="mb-4 px-4 py-3 rounded-lg bg-muted" style={{ borderLeft: "2px solid hsl(var(--muted-foreground))" }}>
                  <p className="font-serif text-sm italic leading-relaxed text-foreground" style={{ opacity: 0.8 }}>
                    &ldquo;{char.quote}&rdquo;
                  </p>
                </div>
              )}

              {/* Character details — identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-4 border-t border-border">
                <EditableField label="Papel" value={char.role ?? ""} onSave={(v) => saveField(char.id, "role", v)} />
                <EditableField label="Especie" value={char.species ?? ""} onSave={(v) => saveField(char.id, "species", v)} />
                <EditableField label="Status" value={char.status ?? ""} onSave={(v) => saveField(char.id, "status", v)} />
              </div>

              {/* Character details — physical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-3 mt-2 border-t border-border/50">
                <EditableField label="Morfologia" value={char.morphology ?? ""} onSave={(v) => saveField(char.id, "morphology", v)} multiline />
                <EditableField label="Habilidade" value={char.ability ?? ""} onSave={(v) => saveField(char.id, "ability", v)} multiline />
                <EditableField label="Marca (Isilo-Ori)" value={char.mark ?? ""} onSave={(v) => saveField(char.id, "mark", v)} multiline />
              </div>

              {/* Character details — world */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 pt-3 mt-2 border-t border-border/50">
                <EditableField label="Origem" value={char.origin ?? ""} onSave={(v) => saveField(char.id, "origin", v)} />
                <EditableField label="Localização" value={char.location ?? ""} onSave={(v) => saveField(char.id, "location", v)} />
                <EditableField label="Citação" value={char.quote ?? ""} onSave={(v) => saveField(char.id, "quote", v)} />
              </div>

              {/* Description — full width */}
              <div className="pt-3 mt-2 border-t border-border/50">
                <EditableField label="Descrição" value={char.description ?? ""} onSave={(v) => saveField(char.id, "description", v)} multiline />
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null) }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Remover personagem
            </DialogTitle>
            <DialogDescription className="font-sans">
              Remover <strong className="text-foreground">{confirmDelete?.name}</strong>?
              {" "}Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { if (confirmDelete) deleteCharacter(confirmDelete) }}
            >
              <Trash2 size={12} />
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
