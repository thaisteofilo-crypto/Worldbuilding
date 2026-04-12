"use client"

import { useEffect, useState, useRef } from "react"
import { ImagePositioner } from "@/components/admin/image-positioner"

const cardSlots = [
  { section: "Bíblia do Mundo", items: [
    { key: "biblia-parte-00", label: "Parte 00 — Introdução" },
    { key: "biblia-parte-01", label: "Parte 01 — Física e Cosmologia" },
    { key: "biblia-parte-02", label: "Parte 02 — Geografia" },
    { key: "biblia-parte-03", label: "Parte 03 — Ecossistema" },
    { key: "biblia-parte-04", label: "Parte 04 — Criaturas" },
    { key: "biblia-parte-05", label: "Parte 05 — Personagens" },
    { key: "biblia-parte-06", label: "Parte 06 — Regras" },
    { key: "biblia-parte-07", label: "Parte 07 — Cultura" },
    { key: "biblia-parte-08", label: "Parte 08 — Linha do Tempo" },
  ]},
  { section: "Livro", items: [
    { key: "livro-01", label: "Capítulo 1" },
    { key: "livro-02", label: "Capítulo 2" },
    { key: "livro-03", label: "Capítulo 3" },
    { key: "livro-04", label: "Capítulo 4" },
    { key: "livro-05", label: "Capítulo 5" },
    { key: "livro-06", label: "Capítulo 6" },
    { key: "livro-epilogo", label: "Epílogo" },
  ]},
  { section: "Referências", items: [
    { key: "ref-planeta-dos-abutres", label: "Planeta dos Abutres" },
    { key: "ref-harry-potter", label: "Harry Potter" },
    { key: "ref-a-mao-esquerda-da-escuridao", label: "A Mão Esquerda da Escuridão" },
    { key: "ref-os-despossuidos", label: "Os Despossuídos" },
    { key: "ref-as-cronicas-de-narnia", label: "As Crônicas de Nárnia" },
  ]},
]

export default function CardImagesPage() {
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)

  function fetchImages() {
    fetch("/api/card-images")
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? {})
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchImages()
  }, [])

  async function handleUpload(key: string, file: File) {
    setUploading(key)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("key", key)

    const res = await fetch("/api/card-images", { method: "POST", body: formData })
    const data = await res.json()

    if (data.error) {
      alert(data.error)
    } else {
      fetchImages()
    }
    setUploading(null)
  }

  async function handleRemove(key: string) {
    setUploading(key)
    await fetch("/api/card-images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })
    fetchImages()
    setUploading(null)
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Imagens dos Cards</h1>
        <p className="mt-4 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Carregando...</p>
      </div>
    )
  }

  const filled = Object.keys(images).length
  const total = cardSlots.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Imagens dos Cards</h1>
        <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          {filled} de {total} cards com imagem — tamanho ideal: 800×1200px
        </p>
      </div>

      {cardSlots.map((section) => (
        <div key={section.section} className="mb-8">
          <h2
            className="font-sans text-xs tracking-[0.12em] uppercase mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            {section.section}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {section.items.map((item) => (
              <CardSlot
                key={item.key}
                itemKey={item.key}
                label={item.label}
                url={images[item.key]}
                uploading={uploading === item.key}
                onUpload={(file) => handleUpload(item.key, file)}
                onRemove={() => handleRemove(item.key)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function CardSlot({
  itemKey,
  label,
  url,
  uploading,
  onUpload,
  onRemove,
}: {
  itemKey: string
  label: string
  url?: string
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      className="rounded-xl overflow-hidden glass-card"
    >
      <div
        className="relative flex items-center justify-center"
        style={{ background: "var(--surface)", ...(!url ? { aspectRatio: "2/3" } : {}) }}
      >
        {url ? (
          <ImagePositioner
            imageKey={`card-${itemKey}`}
            src={url}
            alt={label}
            aspectRatio="2/3"
          />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" style={{ color: "var(--muted-foreground)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="text-white text-xs font-sans">Enviando...</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-sans text-sm mb-2 leading-tight" style={{ color: "var(--foreground)" }}>
          {label}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute w-0 h-0 opacity-0 overflow-hidden"
        />
        <div className="flex gap-1">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded px-2.5 py-1 font-sans text-[11px] transition-colors disabled:opacity-50"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            {url ? "Trocar" : "Enviar"}
          </button>
          {url && (
            <button
              onClick={onRemove}
              disabled={uploading}
              className="rounded px-2.5 py-1 font-sans text-[11px] transition-colors disabled:opacity-50"
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
