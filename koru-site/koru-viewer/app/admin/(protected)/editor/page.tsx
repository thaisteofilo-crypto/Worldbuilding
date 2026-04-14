'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ChatPanel } from '@/components/admin/chat-panel'
import { RichEditor } from '@/components/admin/rich-editor'
import type { RichEditorRef } from '@/components/admin/rich-editor'

interface DocEntry {
  label: string
  path: string
}

interface DocGroup {
  section: string
  color: string
  docs: DocEntry[]
}

const DEFAULT_DOC_GROUPS: DocGroup[] = [
  {
    section: 'Bíblia',
    color: 'var(--gold)',
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
    color: 'var(--accent)',
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
    color: 'var(--blue-cold)',
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

const STORAGE_KEY = 'koru-editor-doc-groups'

// Map a doc path to its site_content title key (used for home page card titles)
function getSiteContentTitleKey(docPath: string): string | null {
  const bibliaMatch = docPath.match(/^biblia\/(parte-\d+)\.md$/)
  if (bibliaMatch) return `biblia.${bibliaMatch[1]}.title`
  const livroMatch = docPath.match(/^livro\/capitulo-(\d+)\.md$/)
  if (livroMatch) return `livro.${livroMatch[1]}.title`
  if (docPath === 'livro/epilogo.md') return 'livro.epilogo.title'
  return null
}

function loadDocGroups(): DocGroup[] {
  if (typeof window === 'undefined') return DEFAULT_DOC_GROUPS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return DEFAULT_DOC_GROUPS
}

async function fetchFilesystemDocGroups(): Promise<{ groups: DocGroup[]; excludedPaths: string[] }> {
  try {
    const res = await fetch('/api/docs')
    if (!res.ok) return { groups: DEFAULT_DOC_GROUPS, excludedPaths: [] }
    const data = await res.json()
    return {
      groups: data.groups ?? DEFAULT_DOC_GROUPS,
      excludedPaths: data.excludedPaths ?? [],
    }
  } catch {
    return { groups: DEFAULT_DOC_GROUPS, excludedPaths: [] }
  }
}

function saveDocGroups(groups: DocGroup[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups))
  } catch { /* ignore */ }
  // Sync to server (fire and forget)
  fetch('/api/site-content', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'editor.doc_groups', value: JSON.stringify(groups) }),
  }).catch(() => { /* ignore */ })
}

function renderPreview(md: string): string {
  // Strip frontmatter
  let text = md.replace(/^---[\s\S]*?---\n?/, '')

  let html = text
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:1.5rem 0;display:block" />')
    // Video passthrough
    .replace(/<video([^>]*)><\/video>/g, '<video$1 style="max-width:100%;border-radius:8px;margin:1rem 0"></video>')
    // Audio passthrough
    .replace(/<audio([^>]*)><\/audio>/g, '<audio$1 style="margin:0.75rem 0;display:block"></audio>')
    // HR
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid color-mix(in oklch,var(--border) 60%,transparent);margin:2rem 0" />')
    // H1
    .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-serif),Georgia,serif;font-size:1.6rem;line-height:1.3;margin:2rem 0 0.75rem;color:var(--foreground)">$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-serif),Georgia,serif;font-size:1.25rem;line-height:1.4;margin:1.75rem 0 0.5rem;color:var(--foreground)">$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3 style="font-family:var(--font-serif),Georgia,serif;font-size:1.05rem;line-height:1.4;margin:1.5rem 0 0.4rem;color:var(--foreground)">$1</h3>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:2px solid var(--accent);margin:1rem 0;padding:0.5rem 0 0.5rem 1.25rem;color:color-mix(in oklch,var(--foreground) 70%,transparent);font-style:italic">$1</blockquote>')
    // Bold+italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li style="margin:0.25rem 0 0.25rem 1.5rem;list-style:disc;padding-left:0.25rem">$1</li>')
    // Paragraphs (double newline = paragraph break)
    .replace(/\n\n/g, '</p><p style="margin:0 0 1.25rem;line-height:1.9">')

  // Wrap in container
  html = '<div style="font-family:var(--font-sans),Inter,sans-serif;font-size:15px;line-height:1.9;color:var(--foreground)">'
       + '<p style="margin:0 0 1.25rem;line-height:1.9">' + html + '</p>'
       + '</div>'

  return html
}

export default function EditorPage() {
  const [docGroups, setDocGroups] = useState<DocGroup[]>(DEFAULT_DOC_GROUPS)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const richEditorRef = useRef<RichEditorRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'audio'>('image')
  const [showChat, setShowChat] = useState(false)
  const [excludedPaths, setExcludedPaths] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newDocName, setNewDocName] = useState('')
  const newDocInputRef = useRef<HTMLInputElement>(null)
  const [renamingDoc, setRenamingDoc] = useState<{ section: string; path: string } | null>(null)
  const [renameLabel, setRenameLabel] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedContentRef = useRef<string>('')
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
  const lastSavedRef = useRef<Date | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const sessionStartWordsRef = useRef<number>(0)

  const previewRef = useRef<HTMLDivElement>(null)

  // Find & Replace state
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findCount, setFindCount] = useState(0)

  // Métricas de escrita
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const paragraphCount = content.split(/\n\n+/).filter(p => p.trim()).length

  useEffect(() => {
    setDocGroups(loadDocGroups())
  }, [])

  // On load: fetch merged docs from server (filesystem + editor.doc_groups saved in Supabase)
  useEffect(() => {
    fetchFilesystemDocGroups().then(({ groups, excludedPaths: ep }) => {
      setDocGroups(groups)
      setExcludedPaths(ep)
    })
  }, [])

  useEffect(() => {
    if (addingTo && newDocInputRef.current) {
      newDocInputRef.current.focus()
    }
  }, [addingTo])

  useEffect(() => {
    if (renamingDoc && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingDoc])

  // Calculate find count whenever findText or content changes
  useEffect(() => {
    if (!findText) { setFindCount(0); return }
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matches = content.match(new RegExp(escaped, 'gi'))
    setFindCount(matches ? matches.length : 0)
  }, [findText, content])

  // Escape para sair do modo foco
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [focusMode])

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const addDocument = (sectionName: string) => {
    if (!newDocName.trim()) return
    const name = newDocName.trim()
    const folder = sectionName === 'Bíblia' ? 'biblia' : sectionName === 'Livro' ? 'livro' : 'contos'
    // Normalize: remove diacritics so "Capítulo 07" → "capitulo-07" (not "capítulo-07")
    const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const slug = normalized.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const path = `${folder}/${slug}.md`

    const updated = docGroups.map((g) => {
      if (g.section !== sectionName) return g
      if (g.docs.some((d) => d.path === path)) return g
      return { ...g, docs: [...g.docs, { label: name, path }] }
    })

    setDocGroups(updated)
    saveDocGroups(updated)
    setAddingTo(null)
    setNewDocName('')
  }

  const removeDocument = (sectionName: string, docPath: string) => {
    const updated = docGroups.map((g) => {
      if (g.section !== sectionName) return g
      return { ...g, docs: g.docs.filter((d) => d.path !== docPath) }
    })
    setDocGroups(updated)
    saveDocGroups(updated)

    // Add to excluded paths so filesystem scan doesn't bring it back on reload
    const newExcluded = Array.from(new Set([...excludedPaths, docPath]))
    setExcludedPaths(newExcluded)
    fetch('/api/site-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'editor.excluded_paths', value: JSON.stringify(newExcluded) }),
    }).catch(() => { /* ignore */ })

    if (selectedPath === docPath) {
      setSelectedPath(null)
      setContent('')
    }
  }

  const renameDocument = (sectionName: string, docPath: string, newLabel: string) => {
    const trimmed = newLabel.trim()
    if (!trimmed) { setRenamingDoc(null); return }
    const updated = docGroups.map((g) => {
      if (g.section !== sectionName) return g
      return { ...g, docs: g.docs.map((d) => d.path === docPath ? { ...d, label: trimmed } : d) }
    })
    setDocGroups(updated)
    saveDocGroups(updated)
    if (selectedPath === docPath) setSelectedLabel(trimmed)
    setRenamingDoc(null)

    // Also update the corresponding card title in site_content (drives the big title on home page)
    const titleKey = getSiteContentTitleKey(docPath)
    if (titleKey) {
      fetch('/api/site-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: titleKey, value: trimmed }),
      }).catch(() => { /* ignore */ })
    }
  }

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
        savedContentRef.current = data.content
        setAutosaveStatus('idle')
        // Registrar palavras iniciais da sessão
        sessionStartWordsRef.current = data.content.trim() ? data.content.trim().split(/\s+/).length : 0
      } else if (res.status === 404) {
        // Arquivo novo — começa vazio, salva ao escrever
        setContent('')
        savedContentRef.current = ''
        sessionStartWordsRef.current = 0
        setAutosaveStatus('idle')
      } else {
        setContent('')
        sessionStartWordsRef.current = 0
        setMessage({ type: 'error', text: data.error || 'Erro ao carregar arquivo.' })
      }
    } catch {
      setContent('')
      sessionStartWordsRef.current = 0
      setMessage({ type: 'error', text: 'Erro de conexão.' })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = useCallback(async () => {
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
        savedContentRef.current = content
        setAutosaveStatus('saved')
        setMessage({ type: 'success', text: 'Arquivo salvo com sucesso.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' })
    } finally {
      setSaving(false)
    }
  }, [selectedPath, content])

  // Keyboard shortcuts: Cmd/Ctrl+S to save, Cmd/Ctrl+H for find & replace
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (selectedPath && !saving && !loading) {
          handleSave()
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault()
        if (selectedPath && !loading) {
          setShowFindReplace(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPath, saving, loading, handleSave])

  useEffect(() => {
    if (!selectedPath || content === savedContentRef.current) {
      return
    }
    setAutosaveStatus('pending')
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(async () => {
      setAutosaveStatus('saving')
      try {
        const res = await fetch('/api/editor', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: selectedPath, content }),
        })
        if (res.ok) {
          savedContentRef.current = content
          lastSavedRef.current = new Date()
          setAutosaveStatus('saved')
          setTimeout(() => setAutosaveStatus('idle'), 3000)
        } else {
          setAutosaveStatus('error')
        }
      } catch {
        setAutosaveStatus('error')
      }
    }, 2000)
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [content, selectedPath])

  async function handleMediaUpload(file: File, type: 'image' | 'video' | 'audio') {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/editor/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        if (type === 'image') {
          const editor = richEditorRef.current?.editor
          if (editor) {
            editor.chain().focus().insertContent(`![${file.name}](${data.url})`).run()
          }
        } else {
          let markup = ''
          if (type === 'video') {
            markup = `<video src="${data.url}" controls width="100%"></video>`
          } else {
            markup = `<audio src="${data.url}" controls></audio>`
          }
          const editor = richEditorRef.current?.editor
          if (editor) {
            editor.chain().focus().insertContent(markup.trim()).run()
          }
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro no upload.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro no upload.' })
    } finally {
      setUploading(false)
    }
  }

  function triggerUpload(type: 'image' | 'video' | 'audio') {
    setUploadType(type)
    const accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'
    const input = fileInputRef.current
    if (input) {
      input.accept = accept
      input.value = ''
      input.click()
    }
  }

  function handleReplace() {
    if (!findText) return
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const newContent = content.replace(new RegExp(escaped, 'gi'), replaceText)
    setContent(newContent)
    setTimeout(() => {
      richEditorRef.current?.editor?.commands.setContent(newContent)
    }, 0)
  }

  function handleReplaceAll() {
    if (!findText) return
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const newContent = content.replace(new RegExp(escaped, 'gi'), replaceText)
    setContent(newContent)
    setTimeout(() => {
      richEditorRef.current?.editor?.commands.setContent(newContent)
    }, 0)
    setShowFindReplace(false)
  }

  // Autosave status display
  const autosaveNode = selectedPath && autosaveStatus !== 'idle' ? (
    <span className="font-sans text-[11px] flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
      {autosaveStatus === 'pending' && (
        <>
          <span style={{ opacity: 0.5 }}>•</span>
          <span>modificado</span>
        </>
      )}
      {autosaveStatus === 'saving' && (
        <>
          <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <span>salvando...</span>
        </>
      )}
      {autosaveStatus === 'saved' && (
        <>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>salvo automaticamente</span>
        </>
      )}
      {autosaveStatus === 'error' && (
        <span style={{ color: 'oklch(0.65 0.2 25)' }}>! erro ao salvar</span>
      )}
    </span>
  ) : null

  // Modo foco: layout completamente diferente
  if (focusMode && selectedPath) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: 'var(--background)' }}
      >
        {/* Header minimalista no modo foco */}
        <div
          className="flex items-center justify-between px-10 py-3 shrink-0"
          style={{ opacity: 0.55 }}
        >
          <div className="flex items-center gap-5 min-w-0">
            <h2
              className="text-sm leading-tight truncate"
              style={{ fontFamily: 'var(--font-serif), Georgia, serif', color: 'var(--foreground)' }}
            >
              {selectedLabel}
            </h2>
            {autosaveNode}
            {wordCount > 0 && (
              <p className="text-[11px] font-sans tabular-nums flex items-center gap-2.5" style={{ color: 'var(--muted-foreground)' }}>
                <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{readingMinutes} min</span>
                {wordCount - sessionStartWordsRef.current > 0 && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ color: 'var(--accent)', opacity: 1 }}>+{(wordCount - sessionStartWordsRef.current).toLocaleString('pt-BR')}</span>
                  </>
                )}
              </p>
            )}
          </div>
          <button
            onClick={() => setFocusMode(false)}
            className="flex items-center gap-1.5 text-xs font-sans transition-all duration-200"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Esc
          </button>
        </div>

        {/* Editor centrado no modo foco */}
        <div className="flex-1 flex flex-col items-center pt-10 px-6 min-h-0 overflow-auto">
          <div className="w-full flex-1 flex flex-col" style={{ maxWidth: '680px' }}>
            <RichEditor
              ref={richEditorRef}
              markdown={content}
              documentKey={selectedPath ?? ''}
              onChange={(md) => setContent(md)}
              placeholder="Comece a escrever..."
              focusMode={focusMode}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 py-4 font-sans">
      {/* Header */}
      <div className="mb-5">
        <h1
          className="text-3xl leading-none mb-1.5"
          style={{ fontFamily: 'var(--font-serif), Georgia, serif', color: 'var(--foreground)' }}
        >
          Editor
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Selecione um documento para editar o conteúdo markdown.
        </p>
      </div>

      <div className="flex flex-1 gap-5 min-h-0">
        {/* Sidebar */}
        <div
          className="w-64 shrink-0 overflow-y-auto rounded-xl p-3 flex flex-col gap-1"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {docGroups.map((group) => {
            const isCollapsed = collapsed[group.section]
            return (
              <div key={group.section}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(group.section)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 transition-all duration-150"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `color-mix(in oklch, ${group.color} 8%, transparent)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                    className="shrink-0 transition-transform duration-200"
                    style={{
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      opacity: 0.4,
                    }}
                  >
                    <path d="M2 3l3 3.5L8 3" />
                  </svg>
                  <span
                    className="w-1.5 h-1.5 rounded-sm shrink-0"
                    style={{ background: group.color, opacity: 0.7 }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: group.color }}
                  >
                    {group.section}
                  </span>
                  <span
                    className="ml-auto text-[10px] font-sans"
                    style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
                  >
                    {group.docs.length}
                  </span>
                </button>

                {/* Doc list */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-0.5 mt-0.5 mb-2">
                    {group.docs.map((doc) => (
                      <div key={doc.path} className="group flex items-center">
                        {renamingDoc?.path === doc.path ? (
                          /* Inline rename input */
                          <div className="flex items-center gap-1 px-2 flex-1">
                            <input
                              ref={renameInputRef}
                              value={renameLabel}
                              onChange={(e) => setRenameLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') renameDocument(group.section, doc.path, renameLabel)
                                if (e.key === 'Escape') setRenamingDoc(null)
                              }}
                              onBlur={() => renameDocument(group.section, doc.path, renameLabel)}
                              className="flex-1 rounded-md px-2 py-1 text-xs font-sans outline-none"
                              style={{
                                background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--border)',
                              }}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => loadFile(doc.path, doc.label)}
                            onDoubleClick={() => { setRenamingDoc({ section: group.section, path: doc.path }); setRenameLabel(doc.label) }}
                            className="flex-1 text-left rounded-lg px-3 py-1.5 text-sm transition-all duration-150 flex items-center"
                            style={
                              selectedPath === doc.path
                                ? {
                                    background: 'color-mix(in oklch, var(--foreground) 8%, transparent)',
                                    color: 'var(--foreground)',
                                    fontWeight: 500,
                                  }
                                : {
                                    color: 'var(--muted-foreground)',
                                  }
                            }
                            onMouseEnter={(e) => {
                              if (selectedPath !== doc.path) {
                                e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)'
                                e.currentTarget.style.color = 'var(--foreground)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedPath !== doc.path) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--muted-foreground)'
                              }
                            }}
                          >
                            <span className="flex-1">{doc.label}</span>
                            {selectedPath === doc.path && wordCount > 0 && (
                              <span
                                className="ml-auto text-[10px] font-sans tabular-nums shrink-0"
                                style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
                              >
                                {wordCount}
                              </span>
                            )}
                          </button>
                        )}
                        {/* Rename button (pencil icon, always visible on hover) */}
                        {renamingDoc?.path !== doc.path && (
                          <button
                            onClick={() => { setRenamingDoc({ section: group.section, path: doc.path }); setRenameLabel(doc.label) }}
                            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 shrink-0 p-1 rounded transition-opacity"
                            style={{ color: 'var(--muted-foreground)' }}
                            title="Renomear"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        {/* Remove button */}
                        {renamingDoc?.path !== doc.path && (
                          <button
                            onClick={() => removeDocument(group.section, doc.path)}
                            className="opacity-0 group-hover:opacity-50 hover:!opacity-100 shrink-0 p-1 rounded transition-opacity"
                            style={{ color: 'var(--muted-foreground)' }}
                            title="Remover"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Add document inline */}
                    {addingTo === group.section ? (
                      <div className="flex items-center gap-1 px-2 mt-1">
                        <input
                          ref={newDocInputRef}
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addDocument(group.section)
                            if (e.key === 'Escape') { setAddingTo(null); setNewDocName('') }
                          }}
                          placeholder="Nome do documento..."
                          className="flex-1 rounded-md px-2 py-1 text-xs font-sans outline-none"
                          style={{
                            background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                          }}
                        />
                        <button
                          onClick={() => addDocument(group.section)}
                          className="shrink-0 rounded-md px-2 py-1 text-xs font-sans font-medium transition-opacity hover:opacity-80"
                          style={{
                            background: 'var(--foreground)',
                            color: 'var(--background)',
                          }}
                        >
                          OK
                        </button>
                        <button
                          onClick={() => { setAddingTo(null); setNewDocName('') }}
                          className="shrink-0 p-1 rounded transition-opacity"
                          style={{ color: 'var(--muted-foreground)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingTo(group.section); setNewDocName('') }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-150"
                        style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.6'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Adicionar
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0">
          {!selectedPath ? (
            <div
              className="flex-1 flex flex-col items-center justify-center rounded-xl gap-3"
              style={{
                border: '1px dashed var(--border)',
                background: 'var(--card)',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--muted-foreground)', opacity: 0.3 }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div className="text-center">
                <p className="text-sm font-sans" style={{ color: 'var(--muted-foreground)' }}>
                  Selecione um documento para editar.
                </p>
                <p className="text-xs font-sans mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                  Use ⌘S para salvar rapidamente.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header bar */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2
                    className="text-xl leading-tight"
                    style={{ fontFamily: 'var(--font-serif), Georgia, serif', color: 'var(--foreground)' }}
                  >
                    {selectedLabel}
                  </h2>
                  <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {selectedPath}
                  </p>
                  {/* Métricas de escrita */}
                  {wordCount > 0 && (
                    <p className="text-[11px] font-sans mt-1 tabular-nums flex items-center gap-3" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>
                      <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{paragraphCount} parágrafos</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{readingMinutes} min de leitura</span>
                      {wordCount - sessionStartWordsRef.current > 0 && (
                        <>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span style={{ color: 'var(--accent)' }}>+{(wordCount - sessionStartWordsRef.current).toLocaleString('pt-BR')} nesta sessão</span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {/* Autosave status */}
                  {autosaveNode}
                  {/* Botão Foco */}
                  <button
                    onClick={() => setFocusMode(true)}
                    className="rounded-full px-4 py-1.5 text-xs font-sans font-medium transition-all duration-200"
                    style={{
                      background: 'transparent',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                    title="Modo foco (Esc para sair)"
                  >
                    Foco
                  </button>
                  <button
                    onClick={() => { setShowChat(!showChat); if (!showChat) setShowPreview(false) }}
                    className="rounded-full px-4 py-1.5 text-xs font-sans font-medium transition-all duration-200"
                    style={
                      showChat
                        ? { background: 'var(--foreground)', color: 'var(--background)' }
                        : { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }
                    }
                  >
                    {showChat ? 'Fechar IA' : 'IA'}
                  </button>
                  <button
                    onClick={() => { setShowPreview(!showPreview); if (!showPreview) setShowChat(false) }}
                    className="rounded-full px-4 py-1.5 text-xs font-sans font-medium transition-all duration-200"
                    style={
                      showPreview
                        ? { background: 'var(--foreground)', color: 'var(--background)' }
                        : { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }
                    }
                  >
                    Preview
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="rounded-full px-5 py-1.5 text-xs font-sans font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-40 flex items-center"
                    style={{
                      background: 'var(--foreground)',
                      color: 'var(--background)',
                      opacity: autosaveStatus === 'saved' ? 0.5 : undefined,
                    }}
                  >
                    {saving ? 'Salvando...' : autosaveStatus === 'saved' ? 'Salvo' : 'Salvar'}
                    {!saving && autosaveStatus !== 'saved' && (
                      <span className="ml-1.5 text-[10px]" style={{ opacity: 0.4 }}>⌘S</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Find & Replace */}
              {showFindReplace && (
                <div
                  className="mb-2 flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="Buscar..."
                      autoFocus
                      className="rounded-lg px-3 py-1.5 font-sans text-xs outline-none flex-1"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      onKeyDown={(e) => { if (e.key === 'Escape') setShowFindReplace(false) }}
                    />
                    <input
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      placeholder="Substituir por..."
                      className="rounded-lg px-3 py-1.5 font-sans text-xs outline-none flex-1"
                      style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      onKeyDown={(e) => { if (e.key === 'Escape') setShowFindReplace(false) }}
                    />
                  </div>
                  {findText && (
                    <span className="font-sans text-[11px] tabular-nums shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                      {findCount} ocorrência{findCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={handleReplace}
                    disabled={!findText || findCount === 0}
                    className="rounded-full px-3 py-1.5 font-sans text-[11px] transition-opacity disabled:opacity-30"
                    style={{ background: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                  >
                    Substituir
                  </button>
                  <button
                    onClick={handleReplaceAll}
                    disabled={!findText || findCount === 0}
                    className="rounded-full px-3 py-1.5 font-sans text-[11px] transition-opacity disabled:opacity-30"
                    style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                  >
                    Substituir todos
                  </button>
                  <button
                    onClick={() => setShowFindReplace(false)}
                    className="ml-1 rounded-full w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-70 shrink-0"
                    style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div
                className="mb-2 flex items-center gap-1 rounded-xl px-3 py-1.5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleBold().run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-bold transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Negrito"
                >
                  B
                </button>
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleItalic().run()}
                  className="rounded-lg px-2.5 py-1 text-sm italic transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Itálico"
                >
                  I
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-bold transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Título H1"
                >
                  H1
                </button>
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-semibold transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Título H2"
                >
                  H2
                </button>
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className="rounded-lg px-2 py-1 text-xs font-semibold transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Subtítulo H3"
                >
                  H3
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleBlockquote().run()}
                  className="rounded-lg px-2.5 py-1 text-sm transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Citação"
                >
                  &ldquo;
                </button>
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().setHorizontalRule().run()}
                  className="rounded-lg px-2.5 py-1 text-xs transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Separador horizontal"
                >
                  ---
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => richEditorRef.current?.editor?.chain().focus().toggleBulletList().run()}
                  className="rounded-lg px-2.5 py-1 text-sm transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Lista"
                >
                  &bull; Lista
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => triggerUpload('image')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir imagem"
                >
                  Imagem
                </button>
                <button
                  onClick={() => triggerUpload('video')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir vídeo"
                >
                  Video
                </button>
                <button
                  onClick={() => triggerUpload('audio')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir áudio"
                >
                  Audio
                </button>
                {uploading && <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>Enviando...</span>}
                {/* Find & Replace button */}
                <button
                  onClick={() => setShowFindReplace(prev => !prev)}
                  className="rounded-lg px-2.5 py-1 text-xs transition-colors ml-auto"
                  style={{ color: showFindReplace ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Buscar e substituir (⌘H)"
                >
                  Buscar
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleMediaUpload(file, uploadType)
                  }}
                />
              </div>

              {/* Message */}
              {message && (
                <div
                  className="mb-2 rounded-lg px-4 py-2 text-xs font-sans flex items-center gap-2"
                  style={{
                    background: message.type === 'success'
                      ? 'color-mix(in oklch, var(--accent) 10%, var(--card))'
                      : 'color-mix(in oklch, var(--destructive) 10%, var(--card))',
                    border: `1px solid ${message.type === 'success' ? 'color-mix(in oklch, var(--accent) 30%, transparent)' : 'color-mix(in oklch, var(--destructive) 30%, transparent)'}`,
                    color: 'var(--foreground)',
                  }}
                >
                  {message.type === 'success' ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--accent)', flexShrink: 0 }}
                    >
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--destructive)', flexShrink: 0 }}
                    >
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  )}
                  {message.text}
                </div>
              )}

              {/* Editor + Preview/Chat */}
              <div className="flex-1 flex gap-4 min-h-0">
                <div className={`flex flex-col min-h-0 ${showPreview || showChat ? 'flex-1 min-w-0' : 'w-full'}`}>
                  {loading ? (
                    <div
                      className="flex-1 flex items-center justify-center rounded-xl"
                      style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
                    >
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
                    </div>
                  ) : (
                    <RichEditor
                      ref={richEditorRef}
                      markdown={content}
                      documentKey={selectedPath ?? ''}
                      onChange={(md) => setContent(md)}
                      placeholder="Comece a escrever..."
                      focusMode={focusMode}
                    />
                  )}
                </div>

                {showPreview && (
                  <div
                    ref={previewRef}
                    className="w-1/2 shrink-0 min-h-0 overflow-y-auto rounded-xl"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <div className="px-8 py-10 max-w-[600px] mx-auto">
                      <div
                        dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
                      />
                    </div>
                  </div>
                )}

                {showChat && (
                  <ChatPanel
                    documentPath={selectedPath}
                    documentContent={content}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
