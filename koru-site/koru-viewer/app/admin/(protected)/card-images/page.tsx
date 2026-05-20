'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Upload, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react'

interface DocEntry {
  label: string
  path: string
}

interface DocGroup {
  section: string
  color: string
  docs: DocEntry[]
}

interface CardSlot {
  key: string
  label: string
}

const DEFAULT_CHAR_SLUGS = ['temiku', 'amara', 'oruku', 'beku', 'obaru', 'kemdi', 'orike']

const DEFAULT_BIBLIA_DOCS: DocEntry[] = [
  { label: 'Manifesto', path: 'biblia/manifesto.md' },
  { label: 'Parte 00', path: 'biblia/parte-00.md' },
  { label: 'Parte 01', path: 'biblia/parte-01.md' },
  { label: 'Parte 02', path: 'biblia/parte-02.md' },
  { label: 'Parte 03', path: 'biblia/parte-03.md' },
  { label: 'Parte 04', path: 'biblia/parte-04.md' },
  { label: 'Parte 05', path: 'biblia/parte-05.md' },
  { label: 'Parte 06', path: 'biblia/parte-06.md' },
  { label: 'Parte 07', path: 'biblia/parte-07.md' },
  { label: 'Parte 08', path: 'biblia/parte-08.md' },
]

const DEFAULT_LIVRO_DOCS: DocEntry[] = [
  { label: 'Capítulo I — O que ela é', path: 'livro/capitulo-01.md' },
  { label: 'Capítulo II — Manhãs', path: 'livro/capitulo-02.md' },
  { label: 'Capítulo III — A cidade', path: 'livro/capitulo-03.md' },
  { label: 'Capítulo IV — A mentira silenciosa', path: 'livro/capitulo-04.md' },
  { label: 'Capítulo V — Entre o lilás e o cinza', path: 'livro/capitulo-05.md' },
  { label: 'Capítulo VI — O que a floresta guarda', path: 'livro/capitulo-06.md' },
  { label: 'Capítulo VII — O projeto do fim do luto', path: 'livro/capitulo-07.md' },
  { label: 'Capítulo VIII — A chuva', path: 'livro/capitulo-08.md' },
  { label: 'Capítulo IX — O limiar como morada', path: 'livro/capitulo-09.md' },
  { label: 'Capítulo X — A noite antes', path: 'livro/capitulo-10.md' },
  { label: 'Capítulo XI — O que ela paga', path: 'livro/capitulo-11.md' },
  { label: 'Capítulo XII — O retorno', path: 'livro/capitulo-12.md' },
  { label: 'Epílogo', path: 'livro/epilogo.md' },
]

function pathFilename(path: string): string {
  return path.replace(/\.md$/, '').split('/').pop() ?? ''
}

function livroUrlSlug(filename: string): string {
  return filename.replace(/^capitulo-/, '')
}

function PlaceholderIcon() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Upload size={24} className="text-muted-foreground opacity-25" strokeWidth={0.8} />
    </div>
  )
}

interface CardTileProps {
  slot: CardSlot
  imageUrl?: string
  onUpload: (key: string, file: File) => Promise<void>
  onDelete: (key: string) => Promise<void>
  uploading: boolean
}

function CardTile({ slot, imageUrl, onUpload, onDelete, uploading }: CardTileProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await onUpload(slot.key, file)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <div
        className="group relative rounded-xl overflow-hidden cursor-pointer w-full"
        style={{
          aspectRatio: '2/3',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}
        onClick={handleClick}
      >
        {/* Image or placeholder */}
        {imageUrl ? (
          <Image src={imageUrl} alt={slot.label} fill className="object-cover" />
        ) : (
          <PlaceholderIcon />
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ background: 'oklch(0 0 0 / 0.6)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-white" />
          ) : (
            <>
              <Button
                onClick={handleClick}
                size="sm"
                className="font-sans font-medium"
                style={{ background: 'white', color: 'oklch(0 0 0)' }}
                title="Alterar imagem"
              >
                <Upload size={11} />
                Upload
              </Button>
              {imageUrl && (
                <Button
                  onClick={() => onDelete(slot.key)}
                  variant="destructive"
                  size="sm"
                  className="font-sans font-medium"
                  title="Remover imagem"
                >
                  <Trash2 size={11} />
                  Remover
                </Button>
              )}
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <p
        className="text-center font-sans leading-tight"
        style={{ color: 'var(--muted-foreground)', fontSize: '10px', width: '100%', wordBreak: 'break-all' }}
      >
        {slot.label}
      </p>
      <p
        className="text-center font-mono leading-tight"
        style={{ color: 'var(--muted-foreground)', fontSize: '9px', opacity: 0.5, width: '100%', wordBreak: 'break-all' }}
      >
        {slot.key}
      </p>
    </div>
  )
}

interface SectionProps {
  title: string
  note?: string
  slots: CardSlot[]
  images: Record<string, string>
  uploadingKeys: Set<string>
  onUpload: (key: string, file: File) => Promise<void>
  onDelete: (key: string) => Promise<void>
}

function CardSection({ title, note, slots, images, uploadingKeys, onUpload, onDelete }: SectionProps) {
  return (
    <div className="mb-10">
      <div className="mb-4">
        <h2
          className="text-xl leading-none"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif', color: 'var(--foreground)' }}
        >
          {title}
        </h2>
        {note && (
          <p className="mt-1 text-xs font-sans" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
            {note}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {slots.map((slot) => (
          <CardTile
            key={slot.key}
            slot={slot}
            imageUrl={images[slot.key]}
            uploading={uploadingKeys.has(slot.key)}
            onUpload={onUpload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

export default function CardImagesPage() {
  const [images, setImages] = useState<Record<string, string>>({})
  const [charSlugs, setCharSlugs] = useState<string[]>(DEFAULT_CHAR_SLUGS)
  const [bibliaDocs, setBibliaDocs] = useState<DocEntry[]>(DEFAULT_BIBLIA_DOCS)
  const [livroDocs, setLivroDocs] = useState<DocEntry[]>(DEFAULT_LIVRO_DOCS)
  const [loading, setLoading] = useState(true)
  const [uploadingKeys, setUploadingKeys] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function showToast(type: 'success' | 'error', text: string) {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      const timeout = setTimeout(() => {
        setLoading(false)
        setLoadError("O servidor demorou mais de 10s para responder. As imagens podem não ter carregado.")
      }, 10000)

      try {
        const [imagesRes, siteRes, charsRes] = await Promise.all([
          fetch('/api/card-images'),
          fetch('/api/site-content'),
          fetch('/api/characters'),
        ])

        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setImages(data.images ?? {})
        }

        if (siteRes.ok) {
          const data = await siteRes.json()
          // API returns { content: [{key, value}] } array
          const map: Record<string, string> = {}
          for (const row of (data.content ?? []) as { key: string; value: string }[]) {
            if (row.key) map[row.key] = row.value
          }
          const raw = map['editor.doc_groups']
          if (raw) {
            try {
              const groups = JSON.parse(raw) as DocGroup[]
              const bibliaGroup = groups.find((g) => g.section === 'Bíblia')
              const livroGroup = groups.find((g) => g.section === 'Livro')
              if (bibliaGroup?.docs.length) setBibliaDocs(bibliaGroup.docs)
              if (livroGroup?.docs.length) setLivroDocs(livroGroup.docs)
            } catch { /* ignore */ }
          }
        }

        if (charsRes.ok) {
          const data = await charsRes.json()
          const slugs: string[] = (data.characters ?? []).map((c: { slug: string }) => c.slug).filter(Boolean)
          if (slugs.length) setCharSlugs(slugs)
        }
      } catch { /* ignore */ }
      finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  async function handleUpload(key: string, file: File) {
    setUploadingKeys((prev) => new Set(prev).add(key))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('key', key)
      const res = await fetch('/api/card-images', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok && data.url) {
        setImages((prev) => ({ ...prev, [key]: data.url }))
        showToast('success', `Imagem "${key}" atualizada.`)
      } else {
        showToast('error', data.error || 'Erro ao fazer upload.')
      }
    } catch {
      showToast('error', 'Erro de conexão.')
    } finally {
      setUploadingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  async function handleDelete(key: string) {
    setUploadingKeys((prev) => new Set(prev).add(key))
    try {
      const res = await fetch('/api/card-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (res.ok) {
        setImages((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        showToast('success', `Imagem "${key}" removida.`)
      } else {
        showToast('error', 'Erro ao remover imagem.')
      }
    } catch {
      showToast('error', 'Erro de conexão.')
    } finally {
      setUploadingKeys((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }

  // Build slot arrays
  const personagemSlots: CardSlot[] = charSlugs.map((slug) => ({
    key: `char-${slug}`,
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
  }))

  const bibliaSlots: CardSlot[] = bibliaDocs.map((doc) => {
    const filename = pathFilename(doc.path)
    return { key: `biblia-${filename}`, label: doc.label }
  })

  const livroSlots: CardSlot[] = livroDocs.map((doc) => {
    const filename = pathFilename(doc.path)
    const urlSlug = livroUrlSlug(filename)
    return { key: `livro-${urlSlug}`, label: doc.label }
  })

  const contosSlots: CardSlot[] = charSlugs.map((slug) => ({
    key: `conto-${slug}`,
    label: slug.charAt(0).toUpperCase() + slug.slice(1),
  }))

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 px-6 py-4 font-sans overflow-y-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-3 w-64 opacity-60" />
        </div>
        {/* Section skeletons — 3 sections (Bíblia, Livro, Personagens) */}
        {[12, 13, 7].map((count, si) => (
          <div key={si} className="mb-10">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 w-full">
                  <Skeleton className="rounded-xl w-full" style={{ aspectRatio: "2/3" }} />
                  <Skeleton className="h-2.5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 py-4 font-sans overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl leading-none mb-1.5"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif', color: 'var(--foreground)' }}
        >
          Imagens de Cards
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Clique em um card para alterar a imagem.
        </p>
        {loadError && (
          <p
            className="mt-2 font-sans text-xs rounded-lg px-3 py-2 inline-block"
            style={{
              color: "var(--destructive)",
              background: "color-mix(in oklch, var(--destructive) 8%, transparent)",
              border: "1px solid color-mix(in oklch, var(--destructive) 25%, transparent)",
            }}
          >
            {loadError}
          </p>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <GlassCard
          variant={toast.type === 'success' ? 'teal' : 'dark'}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 text-sm font-sans flex items-center gap-2 shadow-lg text-foreground"
          style={{
            borderColor: toast.type === 'success'
              ? 'color-mix(in oklch, var(--accent) 35%, transparent)'
              : 'color-mix(in oklch, var(--destructive) 35%, transparent)',
          }}
        >
          {toast.type === 'success' ? (
            <Check size={13} className="shrink-0" style={{ color: 'var(--accent)' }} />
          ) : (
            <AlertCircle size={13} className="shrink-0 text-destructive" />
          )}
          {toast.text}
        </GlassCard>
      )}

      <CardSection
        title="Bíblia"
        slots={bibliaSlots}
        images={images}
        uploadingKeys={uploadingKeys}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />

      <CardSection
        title="Personagens"
        slots={personagemSlots}
        images={images}
        uploadingKeys={uploadingKeys}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />

      <CardSection
        title="Contos"
        note="Compartilha imagem com Personagens — mesma chave char-{slug}"
        slots={contosSlots}
        images={images}
        uploadingKeys={uploadingKeys}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />

      <CardSection
        title="Livro"
        slots={livroSlots}
        images={images}
        uploadingKeys={uploadingKeys}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />
    </div>
  )
}
