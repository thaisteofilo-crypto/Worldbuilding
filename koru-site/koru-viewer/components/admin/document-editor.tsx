'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Document } from '@/lib/database.types'

// Load MD editor dynamically (SSR not supported)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export function DocumentEditor({ document }: { document: Document }) {
  const router = useRouter()
  const [content, setContent] = useState(document.content ?? '')
  const [title, setTitle] = useState(document.title)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)

    await fetch('/api/documents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: document.id, title, content }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }, [document.id, title, content, router])

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-4 border-b border-border px-2 py-3">
        <button
          onClick={() => router.back()}
          className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Voltar
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded border border-border bg-background px-3 py-1.5 font-sans text-sm text-foreground outline-none focus:border-[var(--accent)]"
          placeholder="Título"
        />
        <div className="flex items-center gap-2">
          {saved && (
            <span className="font-sans text-xs" style={{ color: 'oklch(0.65 0.09 150)' }}>
              Salvo
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded px-4 py-1.5 font-sans text-xs disabled:opacity-50"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden" data-color-mode="dark">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val ?? '')}
          height="100%"
          preview="live"
          style={{
            background: 'var(--background)',
            borderRadius: 0,
            border: 'none',
          }}
        />
      </div>
    </div>
  )
}
