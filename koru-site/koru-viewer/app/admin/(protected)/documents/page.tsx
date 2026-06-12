"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText } from "lucide-react"

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
        setUploadResult(`"${data.title}" (${data.section}) — ${data.words.toLocaleString()} palavras ${data.updated ? "(atualizado)" : "(novo)"}`)
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
      <GlassCard
        variant="frosted"
        className="p-6 mb-6 transition-colors"
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
                <Label className="font-sans text-[10px] uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Titulo (opcional)
                </Label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Detecta do arquivo..."
                  className="font-sans text-sm"
                />
              </div>
              <div>
                <Label className="font-sans text-[10px] uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Secao (opcional)
                </Label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 font-sans text-sm outline-none appearance-none"
                  style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border-shadcn))", color: "var(--foreground)" }}
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
                <Button
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Upload size={14} />
                  {uploading ? "Processando..." : "Enviar"}
                </Button>
              </div>
            </div>
            <p className="font-sans text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
              Formatos: .docx, .md, .txt, .rtf — arraste e solte ou clique em Enviar
            </p>
          </div>
        </div>

        {uploadResult && (
          <div
            className="mt-4 rounded-lg px-4 py-2.5 font-sans text-sm"
            style={
              uploadResult.startsWith("Erro")
                ? {
                    background: "color-mix(in oklch, var(--destructive) 8%, transparent)",
                    color: "var(--destructive)",
                  }
                : {
                    background: "color-mix(in oklch, oklch(0.65 0.15 150) 10%, transparent)",
                    color: "oklch(0.65 0.15 150)",
                  }
            }
          >
            {uploadResult}
          </div>
        )}
      </GlassCard>

      {/* Documents list */}
      {loading ? (
        <div className="flex flex-col gap-4 py-4">
          {[1,2,3].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-24 mb-3" />
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border-shadcn))" }}>
                {[1,2].map((j) => (
                  <div key={j} className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: j < 2 ? "1px solid hsl(var(--border-shadcn))" : "none" }}>
                    <div>
                      <Skeleton className="h-3.5 w-48 mb-1" />
                      <Skeleton className="h-2.5 w-28 opacity-60" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : docs.length === 0 ? (
        <GlassCard variant="frosted" className="py-16 text-center">
          <FileText size={48} className="mx-auto mb-4 opacity-30 text-muted-foreground" strokeWidth={0.8} />
          <p className="font-sans text-sm text-muted-foreground">Nenhum documento.</p>
          <p className="font-sans text-xs mt-1 text-muted-foreground">Envie arquivos .docx, .md ou .txt acima.</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ section, docs: sectionDocs }) => (
            <div key={section}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: SECTION_COLORS[section] ?? "hsl(var(--muted-foreground))" }}
                />
                <h2 className="font-sans text-xs uppercase tracking-[0.15em]" style={{ color: "var(--muted-foreground)" }}>
                  {section}
                </h2>
                <Badge variant="ghost" className="text-[10px] h-auto px-1.5 py-0">
                  {sectionDocs.length}
                </Badge>
              </div>
              <GlassCard variant="frosted" className="overflow-hidden">
                {sectionDocs.map((doc, i) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-5 py-3.5 group transition-colors"
                    style={{
                      borderBottom: i < sectionDocs.length - 1 ? "1px solid hsl(var(--border-shadcn))" : "none",
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
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        className="font-sans text-xs transition-opacity opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
