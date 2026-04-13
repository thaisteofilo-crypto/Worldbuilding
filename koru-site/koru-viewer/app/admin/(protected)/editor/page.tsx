'use client'

import { useState, useRef, useCallback } from 'react'

interface DocEntry {
  label: string
  path: string
}

interface DocGroup {
  section: string
  docs: DocEntry[]
}

const DOC_GROUPS: DocGroup[] = [
  {
    section: 'Bíblia',
    docs: [
      { label: 'Parte 00', path: 'biblia/parte-00.md' },
      { label: 'Parte 01', path: 'biblia/parte-01.md' },
      { label: 'Parte 02', path: 'biblia/parte-02.md' },
      { label: 'Parte 03', path: 'biblia/parte-03.md' },
      { label: 'Parte 04', path: 'biblia/parte-04.md' },
      { label: 'Parte 05', path: 'biblia/parte-05.md' },
      { label: 'Parte 06', path: 'biblia/parte-06.md' },
      { label: 'Parte 07', path: 'biblia/parte-07.md' },
      { label: 'Parte 08', path: 'biblia/parte-08.md' },
    ],
  },
  {
    section: 'Livro',
    docs: [
      { label: 'Capítulo 01', path: 'livro/capitulo-01.md' },
      { label: 'Capítulo 02', path: 'livro/capitulo-02.md' },
      { label: 'Capítulo 03', path: 'livro/capitulo-03.md' },
      { label: 'Capítulo 04', path: 'livro/capitulo-04.md' },
      { label: 'Capítulo 05', path: 'livro/capitulo-05.md' },
      { label: 'Capítulo 06', path: 'livro/capitulo-06.md' },
      { label: 'Epílogo', path: 'livro/epilogo.md' },
    ],
  },
  {
    section: 'Contos',
    docs: [
      { label: 'Conto — Temiku', path: 'contos/conto-temiku.md' },
      { label: 'Conto — Amara', path: 'contos/conto-amara.md' },
      { label: 'Conto — Oruku', path: 'contos/conto-oruku.md' },
      { label: 'Conto — Beku', path: 'contos/conto-beku.md' },
      { label: 'Conto — Obaru', path: 'contos/conto-obaru.md' },
      { label: 'Conto — Kemdi', path: 'contos/conto-kemdi.md' },
      { label: 'Conto — Orike', path: 'contos/conto-orike.md' },
    ],
  },
]

function basicMarkdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:600;margin:1rem 0 0.5rem">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.25rem;font-weight:600;margin:1.25rem 0 0.5rem">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.5rem;font-weight:700;margin:1.5rem 0 0.5rem">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.5rem;list-style:disc">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #ddd;margin:1rem 0">')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p style="margin:0.5rem 0">')

  html = '<p style="margin:0.5rem 0">' + html + '</p>'
  return html
}

export default function EditorPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadFile = useCallback(async (docPath: string, label: string) => {
    setLoading(true)
    setMessage(null)
    setSelectedPath(docPath)
    setSelectedLabel(label)

    try {
      const res = await fetch(`/api/editor?path=${encodeURIComponent(docPath)}`)
      const data = await res.json()

      if (res.ok) {
        setContent(data.content)
      } else if (res.status === 404) {
        setContent('')
        setMessage({ type: 'error', text: 'Arquivo ainda não existe. Comece a escrever para criá-lo.' })
      } else {
        setContent('')
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar arquivo.' })
      }
    } catch {
      setContent('')
      setMessage({ type: 'error', text: 'Erro de conexão.' })
    } finally {
      setLoading(false)
    }
  }, [])

  async function handleSave() {
    if (!selectedPath) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/editor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath, content }),
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: 'Arquivo salvo com sucesso.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' })
    } finally {
      setSaving(false)
    }
  }

  function insertMarkdown(before: string, after: string) {
    const ta = textareaRef.current
    if (!ta) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.substring(start, end)
    const newText = content.substring(0, start) + before + selected + after + content.substring(end)
    setContent(newText)

    // Restore focus and selection
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = start + before.length
      ta.selectionEnd = start + before.length + selected.length
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-8 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black mb-1">Editor de Documentos</h1>
        <p className="text-sm text-neutral-500">
          Selecione um documento para editar o conteúdo markdown.
        </p>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* File list sidebar */}
        <div className="w-56 shrink-0 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
          {DOC_GROUPS.map((group) => (
            <div key={group.section}>
              <div className="sticky top-0 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400 border-b border-neutral-100">
                {group.section}
              </div>
              {group.docs.map((doc) => (
                <button
                  key={doc.path}
                  onClick={() => loadFile(doc.path, doc.label)}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedPath === doc.path
                      ? 'bg-neutral-100 text-black font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selectedPath ? (
            <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white">
              <p className="text-sm text-neutral-400">Selecione um documento para editar.</p>
            </div>
          ) : (
            <>
              {/* Header bar */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-medium text-black">{selectedLabel}</h2>
                  <p className="text-xs text-neutral-400 font-mono">{selectedPath}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      showPreview
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-300 bg-white text-black hover:bg-neutral-50'
                    }`}
                  >
                    {showPreview ? 'Esconder Preview' : 'Preview'}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="rounded-md bg-black px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="mb-2 flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1">
                <button
                  onClick={() => insertMarkdown('**', '**')}
                  className="rounded px-2 py-1 text-sm font-bold text-black hover:bg-neutral-100"
                  title="Negrito"
                >
                  B
                </button>
                <button
                  onClick={() => insertMarkdown('*', '*')}
                  className="rounded px-2 py-1 text-sm italic text-black hover:bg-neutral-100"
                  title="Itálico"
                >
                  I
                </button>
                <span className="mx-1 h-4 w-px bg-neutral-200" />
                <button
                  onClick={() => insertMarkdown('## ', '')}
                  className="rounded px-2 py-1 text-sm font-semibold text-black hover:bg-neutral-100"
                  title="Título"
                >
                  H2
                </button>
                <button
                  onClick={() => insertMarkdown('### ', '')}
                  className="rounded px-2 py-1 text-xs font-semibold text-black hover:bg-neutral-100"
                  title="Subtítulo"
                >
                  H3
                </button>
                <span className="mx-1 h-4 w-px bg-neutral-200" />
                <button
                  onClick={() => insertMarkdown('- ', '')}
                  className="rounded px-2 py-1 text-sm text-black hover:bg-neutral-100"
                  title="Lista"
                >
                  &bull; Lista
                </button>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`mb-2 rounded-md border px-3 py-2 text-xs ${
                    message.type === 'success'
                      ? 'border-neutral-300 bg-neutral-50 text-black'
                      : 'border-neutral-300 bg-neutral-50 text-black'
                  }`}
                >
                  {message.type === 'success' ? '✓ ' : '! '}
                  {message.text}
                </div>
              )}

              {/* Editor + Preview */}
              <div className={`flex-1 flex gap-4 min-h-0 ${showPreview ? '' : ''}`}>
                <div className={`flex flex-col min-h-0 ${showPreview ? 'w-1/2' : 'w-full'}`}>
                  {loading ? (
                    <div className="flex-1 flex items-center justify-center rounded-lg border border-neutral-200 bg-white">
                      <p className="text-sm text-neutral-400">Carregando...</p>
                    </div>
                  ) : (
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 min-h-[60vh] w-full resize-none rounded-lg border border-neutral-200 bg-white p-4 font-mono text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Conteúdo markdown..."
                      spellCheck={false}
                    />
                  )}
                </div>

                {showPreview && (
                  <div className="w-1/2 min-h-0 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-4">
                    <div
                      className="prose prose-sm max-w-none text-black text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: basicMarkdownToHtml(content) }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
