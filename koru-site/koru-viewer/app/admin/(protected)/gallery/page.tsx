"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface GalleryImage {
  name: string
  url: string
  created_at: string
  prompt?: string
  tags?: string[]
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [imageName, setImageName] = useState("")
  const [imagePrompt, setImagePrompt] = useState("")
  const [imageTags, setImageTags] = useState("")
  const [selected, setSelected] = useState<GalleryImage | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [editingPrompt, setEditingPrompt] = useState("")
  const [editingTags, setEditingTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [savingPrompt, setSavingPrompt] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  function fetchImages() {
    Promise.all([
      fetch("/api/gallery").then((r) => r.json()),
      fetch("/api/gallery/metadata").then((r) => r.json()),
    ]).then(([galleryData, metaData]) => {
      const metadata = metaData.metadata ?? {}
      const imgs = (galleryData.images ?? []).map((img: GalleryImage) => ({
        ...img,
        prompt: metadata[img.name]?.prompt ?? "",
        tags: metadata[img.name]?.tags ?? [],
      }))
      setImages(imgs)
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchImages()
  }, [])

  // Collect all unique tags across all images
  const allTags = [...new Set(images.flatMap((img) => img.tags ?? []))]

  // Filtered images (search + tag, AND logic)
  const filtered = images.filter((img) => {
    const matchesSearch = !search || img.name.toLowerCase().includes(search.toLowerCase())
    const matchesTag = !activeTag || (img.tags ?? []).includes(activeTag)
    return matchesSearch && matchesTag
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (imageName.trim()) formData.append("name", imageName.trim())

      const res = await fetch("/api/gallery", { method: "POST", body: formData })
      const data = await res.json()

      if (data.error) {
        alert("Erro no upload: " + data.error)
      } else {
        const hasPrompt = imagePrompt.trim()
        const parsedTags = imageTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        if ((hasPrompt || parsedTags.length > 0) && data.name) {
          await fetch("/api/gallery/metadata", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              prompt: imagePrompt.trim(),
              tags: parsedTags,
            }),
          })
        }
        setImageName("")
        setImagePrompt("")
        setImageTags("")
        fetchImages()
      }
    } catch (err) {
      alert("Erro de rede no upload: " + (err instanceof Error ? err.message : String(err)))
      console.error("Upload error:", err)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleDelete(name: string) {
    if (!confirm("Remover esta imagem?")) return
    await Promise.all([
      fetch("/api/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
      fetch("/api/gallery/metadata", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
    ])
    setSelected(null)
    setSelectedIndex(-1)
    fetchImages()
  }

  async function handleSavePrompt() {
    if (!selected) return
    setSavingPrompt(true)
    await fetch("/api/gallery/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selected.name, prompt: editingPrompt, tags: editingTags }),
    })
    setImages((prev) =>
      prev.map((img) =>
        img.name === selected.name
          ? { ...img, prompt: editingPrompt, tags: editingTags }
          : img
      )
    )
    setSelected((prev) =>
      prev ? { ...prev, prompt: editingPrompt, tags: editingTags } : prev
    )
    setSavingPrompt(false)
  }

  const openLightbox = useCallback((img: GalleryImage, index: number) => {
    setSelected(img)
    setSelectedIndex(index)
    setEditingPrompt(img.prompt ?? "")
    setEditingTags(img.tags ?? [])
    setTagInput("")
  }, [])

  const closeLightbox = useCallback(() => {
    setSelected(null)
    setSelectedIndex(-1)
    setTagInput("")
  }, [])

  const goNext = useCallback(() => {
    if (images.length === 0) return
    const next = (selectedIndex + 1) % images.length
    setSelected(images[next])
    setSelectedIndex(next)
    setEditingPrompt(images[next].prompt ?? "")
    setEditingTags(images[next].tags ?? [])
    setTagInput("")
  }, [images, selectedIndex])

  const goPrev = useCallback(() => {
    if (images.length === 0) return
    const prev = (selectedIndex - 1 + images.length) % images.length
    setSelected(images[prev])
    setSelectedIndex(prev)
    setEditingPrompt(images[prev].prompt ?? "")
    setEditingTags(images[prev].tags ?? [])
    setTagInput("")
  }, [images, selectedIndex])

  useEffect(() => {
    if (!selected) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [selected, closeLightbox, goNext, goPrev])

  function toggleSelectId(name: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function enterSelectMode() {
    setSelectMode(true)
    setSelectedIds(new Set())
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  async function handleBulkDelete() {
    const n = selectedIds.size
    if (n === 0) return
    if (!window.confirm(`Excluir ${n} ${n === 1 ? "imagem" : "imagens"}?`)) return
    await Promise.all(
      [...selectedIds].map((name) =>
        Promise.all([
          fetch("/api/gallery", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }),
          fetch("/api/gallery/metadata", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          }),
        ])
      )
    )
    exitSelectMode()
    fetchImages()
  }

  // Determine if save button should be enabled
  const promptChanged = editingPrompt !== (selected?.prompt ?? "")
  const tagsChanged =
    JSON.stringify([...(editingTags)].sort()) !==
    JSON.stringify([...(selected?.tags ?? [])].sort())
  const hasChanges = promptChanged || tagsChanged

  return (
    <div className="w-full">
      {/* Header + upload */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>
              Galeria
            </h1>
            <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
              Cenas e artes do mundo de Koru
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && !selectMode && (
              <span className="font-sans text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                {`${filtered.length}${filtered.length !== images.length ? ` de ${images.length}` : ""} ${images.length === 1 ? "imagem" : "imagens"}`}
              </span>
            )}
            {selectMode ? (
              <>
                <span className="font-sans text-xs tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                  {selectedIds.size} {selectedIds.size === 1 ? "selecionada" : "selecionadas"}
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedIds.size === 0}
                  className="rounded-full px-4 py-2 font-sans text-sm transition-opacity disabled:opacity-30"
                  style={{
                    border: "1px solid oklch(0.55 0.18 20)",
                    color: "oklch(0.65 0.18 20)",
                  }}
                >
                  Excluir selecionadas
                </button>
                <button
                  onClick={exitSelectMode}
                  className="rounded-full px-4 py-2 font-sans text-sm transition-opacity hover:opacity-70"
                  style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                >
                  Cancelar
                </button>
              </>
            ) : (
              images.length > 0 && (
                <button
                  onClick={enterSelectMode}
                  className="rounded-full px-4 py-2 font-sans text-sm transition-opacity hover:opacity-70"
                  style={{ border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                >
                  Selecionar
                </button>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl p-4 glass-card">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label
                className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                Nome da cena (opcional)
              </label>
              <input
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="Ex: floresta-akwu, templo-noturno..."
                className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none"
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="absolute w-0 h-0 opacity-0 overflow-hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm transition-opacity disabled:opacity-50"
              style={{
                background: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {uploading ? "Enviando..." : "Enviar"}
            </button>
          </div>
          <div className="mt-3">
            <label
              className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Prompt usado (opcional)
            </label>
            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              placeholder="Cole aqui o prompt que gerou esta imagem..."
              rows={2}
              className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none resize-y"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div className="mt-3">
            <label
              className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              Tags (opcional)
            </label>
            <input
              value={imageTags}
              onChange={(e) => setImageTags(e.target.value)}
              placeholder="Ex: akwu, noturno, floresta, temiku..."
              className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Search + tag filter */}
      {images.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className="rounded-full px-3 py-1 font-sans text-xs transition-colors"
                  style={
                    activeTag === tag
                      ? { background: "var(--foreground)", color: "var(--background)" }
                      : {
                          background: "var(--surface)",
                          color: "var(--muted-foreground)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Masonry gallery */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--foreground)" }}
          />
        </div>
      ) : images.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="mx-auto mb-4" style={{ color: "var(--muted-foreground)", opacity: 0.3 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma cena na galeria ainda.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl py-16 text-center"
          style={{ border: "1px solid var(--border)" }}
        >
          <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhuma imagem encontrada para esta busca.
          </p>
        </div>
      ) : (
        <div style={{ columns: "400px", columnGap: "8px" }}>
          {filtered.map((img) => {
            const isChecked = selectedIds.has(img.name)
            return (
              <div
                key={img.name}
                className="group relative mb-2 break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
                style={{
                  breakInside: "avoid",
                  outline: selectMode && isChecked ? "2px solid var(--accent)" : "none",
                  outlineOffset: "-2px",
                }}
                onClick={() => {
                  if (selectMode) {
                    toggleSelectId(img.name)
                  } else {
                    openLightbox(img, images.indexOf(img))
                  }
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name.replace(/\.[^.]+$/, "")}
                  className="w-full block transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />

                {/* Checkbox (select mode) */}
                {selectMode && (
                  <div
                    className="absolute top-2 left-2 w-4 h-4 rounded flex items-center justify-center pointer-events-none"
                    style={{
                      background: isChecked ? "var(--accent)" : "oklch(0 0 0 / 0.5)",
                      border: `1.5px solid ${isChecked ? "var(--accent)" : "oklch(1 0 0 / 0.5)"}`,
                    }}
                  >
                    {isChecked && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                )}

                {/* AI prompt indicator */}
                {img.prompt && (
                  <div
                    className="absolute top-2 right-2 font-mono leading-none rounded pointer-events-none"
                    style={{
                      fontSize: "9px",
                      padding: "2px 4px",
                      background: "color-mix(in oklch, var(--accent) 15%, transparent)",
                      border: "1px solid var(--accent)",
                      color: "var(--accent)",
                    }}
                  >
                    AI
                  </div>
                )}

                {/* Hover overlay (only outside select mode) */}
                {!selectMode && (
                  <>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: "linear-gradient(to top, oklch(0 0 0 / 0.6) 0%, oklch(0 0 0 / 0) 50%)",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex-1 mr-2 min-w-0">
                        <p className="font-sans text-xs text-white truncate">
                          {img.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
                        </p>
                        {(img.tags ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(img.tags ?? []).slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="font-sans text-xs rounded-full px-1.5 py-0"
                                style={{ background: "oklch(1 0 0 / 0.15)", color: "oklch(1 0 0 / 0.8)" }}
                              >
                                {tag}
                              </span>
                            ))}
                            {(img.tags ?? []).length > 3 && (
                              <span className="font-sans text-xs" style={{ color: "oklch(1 0 0 / 0.5)" }}>
                                +{(img.tags ?? []).length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(img.name)
                        }}
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{ background: "oklch(0 0 0 / 0.4)" }}
                        title="Excluir"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.92)" }}
          onClick={closeLightbox}
        >
          {/* Nav arrows */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>

          {/* Image + editor */}
          <div className="relative max-w-[92vw] max-h-[92vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt={selected.name}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center gap-4">
              <p className="font-sans text-sm" style={{ color: "oklch(1 0 0 / 0.7)" }}>
                {selected.name.replace(/\.[^.]+$/, "").replace(/-/g, " ")}
              </p>
              <span className="font-sans text-xs tabular-nums" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => handleDelete(selected.name)}
                className="font-sans text-xs transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                Excluir
              </button>
              <button
                onClick={closeLightbox}
                className="ml-2 font-sans text-sm transition-colors"
                style={{ color: "oklch(1 0 0 / 0.5)" }}
              >
                Fechar
              </button>
            </div>

            {/* Prompt + tags editor */}
            <div className="mt-3 w-full max-w-2xl">
              <label
                className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
                style={{ color: "oklch(1 0 0 / 0.35)" }}
              >
                Prompt
              </label>
              <textarea
                value={editingPrompt}
                onChange={(e) => setEditingPrompt(e.target.value)}
                placeholder="Registre o prompt usado para gerar esta imagem..."
                rows={3}
                className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none resize-y"
                style={{
                  background: "oklch(0.15 0 0 / 0.8)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  color: "oklch(1 0 0 / 0.8)",
                }}
              />

              {/* Tags editor */}
              <div className="mt-2">
                <label
                  className="font-sans text-xs tracking-[0.12em] uppercase block mb-1.5"
                  style={{ color: "oklch(1 0 0 / 0.35)" }}
                >
                  Tags
                </label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {editingTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-xs"
                      style={{ background: "oklch(1 0 0 / 0.1)", color: "oklch(1 0 0 / 0.7)" }}
                    >
                      {tag}
                      <button
                        onClick={() => setEditingTags((prev) => prev.filter((t) => t !== tag))}
                        className="opacity-60 hover:opacity-100"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                      e.preventDefault()
                      const newTag = tagInput.trim().replace(/,$/, "")
                      if (newTag && !editingTags.includes(newTag)) {
                        setEditingTags((prev) => [...prev, newTag])
                      }
                      setTagInput("")
                    }
                  }}
                  placeholder="Adicionar tag..."
                  className="w-full rounded-lg px-2 py-1 font-sans text-xs outline-none"
                  style={{
                    background: "oklch(0.15 0 0 / 0.8)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    color: "oklch(1 0 0 / 0.7)",
                  }}
                />
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <button
                  onClick={handleSavePrompt}
                  disabled={savingPrompt || !hasChanges}
                  className="font-sans text-xs px-3 py-1 rounded-full transition-opacity disabled:opacity-30"
                  style={{
                    background: "oklch(1 0 0 / 0.15)",
                    color: "oklch(1 0 0 / 0.7)",
                  }}
                >
                  {savingPrompt ? "Salvando..." : "Salvar"}
                </button>
                {hasChanges && (
                  <span className="font-sans text-xs" style={{ color: "oklch(1 0 0 / 0.3)" }}>
                    alterado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Close X */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
