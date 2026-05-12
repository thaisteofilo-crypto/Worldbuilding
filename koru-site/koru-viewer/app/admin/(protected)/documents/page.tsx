"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"

interface Doc {
  id: string
  slug: string
  title: string
  section: string
  updated_at: string
}

const SECTIONS = ["biblia", "livro", "contos", "briefing", "workflow"] as const
const SECTION_COLORS: Record<string, string> = {
  biblia: "oklch(0.42 0.10 230)",
  livro: "oklch(0.48 0.12 65)",
  contos: "oklch(0.45 0.12 290)",
  briefing: "oklch(0.45 0.12 150)",
  workflow: "oklch(0.50 0.01 280)",
}

const ACCEPTED_FORMATS = ".docx,.md,.txt,.rtf"

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const [selectedSection, setSelectedSection] = useState("")
  const [customTitle, setCustomTitle] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = useCallback(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocs(data.documents ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (customTitle.trim()) formData.append("title", customTitle.trim())
      if (selectedSection) formData.append("section", selectedSection)

      const res = await fetch("/api/documents/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (res.ok) {
        setUploadResult(`"${data.title}" (${data.section}): ${data.words.toLocaleString()} palavras ${data.updated ? "(atualizado)" : "(novo)"}`)
        setCustomTitle("")
        setSelectedSection("")
        fetchDocs()
      } else {
        setUploadResult(`Erro: ${data.error}`)
      }
    } catch (err) {
      setUploadResult(`Erro: ${err instanceof Error ? err.message : String(err)}`)
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return
    await fetch("/api/documents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchDocs()
  }

  const grouped = SECTIONS.map((section) => ({
    section,
    docs: docs.filter((d) => d.section === section),
  })).filter((g) => g.docs.length > 0)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl" style={{ color: "var(--foreground)" }}>Documentos</h1>
          <p className="mt-1 font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
            {docs.length} documentos
          </p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`rounded-xl p-6 mb-6 transition-colors ${dragOver ? "" : "glass-card"}`}
        style={dragOver ? {
          background: "color-mix(in oklch, var(--foreground) 3%, transparent)",
          border: "2px dashed var(--foreground)",
        } : undefined}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div className="flex-1 w-full">
            <p className="font-sans text-sm font-medium mb-3" style={{ color: "var(--foreground)" }}>
              Enviar documento
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-sans text-[10px] uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Titulo (opcional)
                </label>
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Detecta do arquivo..."
                  className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="font-sans text-[10px] uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Secao (opcional)
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none appearance-none"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="">Auto-detectar</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPTED_FORMATS}
                  onChange={handleFileChange}
                  className="absolute w-0 h-0 opacity-0 overflow-hidden"
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm transition-opacity disabled:opacity-50"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {uploading ? "Processando..." : "Enviar"}
                </button>
              </div>
            </div>
            <p className="font-sans text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
              Formatos: .docx, .md, .txt, .rtf, arraste e solte ou clique em Enviar
            </p>
          </div>
        </div>

        {uploadResult && (
          <div
            className="mt-4 rounded-lg px-4 py-2.5 font-sans text-sm"
            style={{
              background: uploadResult.startsWith("Erro") ? "oklch(0.55 0.18 27 / 0.08)" : "oklch(0.45 0.12 150 / 0.08)",
              color: uploadResult.startsWith("Erro") ? "oklch(0.55 0.18 27)" : "oklch(0.35 0.12 150)",
            }}
          >
            {uploadResult}
          </div>
        )}
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--foreground)" }} />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl py-16 text-center glass-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="mx-auto mb-4" style={{ color: "var(--muted-foreground)", opacity: 0.3 }}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="font-sans text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum documento.</p>
          <p className="font-sans text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Envie arquivos .docx, .md ou .txt acima.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ section, docs: sectionDocs }) => (
            <div key={section}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "var(--muted-foreground)" }}
                />
                <h2 className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
                  {section}
                </h2>
                <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                  {sectionDocs.length}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden glass-card">
                {sectionDocs.map((doc, i) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-5 py-3.5 group transition-colors"
                    style={{
                      borderBottom: i < sectionDocs.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm truncate" style={{ color: "var(--foreground)" }}>
                        {doc.title}
                      </p>
                      <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {doc.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-sans text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(doc.updated_at).toLocaleDateString("pt-BR")}
                      </span>
                      <Link
                        href={`/admin/documents/${doc.id}`}
                        className="font-sans text-xs transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ color: "var(--foreground)" }}
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="font-sans text-xs transition-opacity opacity-0 group-hover:opacity-100"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
