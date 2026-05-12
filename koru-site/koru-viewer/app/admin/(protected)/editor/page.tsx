'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { RichEditor } from '@/components/admin/rich-editor'
import type { RichEditorRef } from '@/components/admin/rich-editor'
import type { Editor } from '@tiptap/react'
import { DocumentStatusBadge } from '@/components/admin/document-status-badge'
import { DocumentPublishControl } from '@/components/admin/document-publish-control'
import { useDocumentStatuses } from '@/hooks/use-document-statuses'
import { useDocumentPublishing } from '@/hooks/use-document-publishing'
import { markdownToHtml } from '@/lib/markdown-to-html'

// chat-panel.tsx weighs ~1.1k lines (markdown renderer, table parser, streaming
// logic). It's only needed after the writer clicks the floating assistant
// button, so we keep both exports out of the initial editor chunk.
const ChatPanel = dynamic(
  () => import('@/components/admin/chat-panel').then((m) => m.ChatPanel),
  { ssr: false }
)
const ChatToggleButton = dynamic(
  () => import('@/components/admin/chat-panel').then((m) => m.ChatToggleButton),
  { ssr: false }
)

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
    color: 'var(--foreground)',
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
    color: 'var(--foreground)',
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
    color: 'var(--foreground)',
    docs: [
      { label: 'Conto: Temiku', path: 'contos/conto-temiku.md' },
      { label: 'Conto: Amara', path: 'contos/conto-amara.md' },
      { label: 'Conto: Oruku', path: 'contos/conto-oruku.md' },
      { label: 'Conto: Beku', path: 'contos/conto-beku.md' },
      { label: 'Conto: Obaru', path: 'contos/conto-obaru.md' },
      { label: 'Conto: Kemdi', path: 'contos/conto-kemdi.md' },
      { label: 'Conto: Orike', path: 'contos/conto-orike.md' },
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

// Extract title from frontmatter, falling back to first H1, then fallback label.
function extractTitleFromContent(content: string, fallback: string): string {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (fmMatch) {
    const titleLine = fmMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (titleLine) return titleLine[1].trim()
  }
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) return h1Match[1].trim()
  return fallback
}

// Sync title to Supabase site_content so the home page shows the updated title immediately.
function syncTitleToSiteContent(docPath: string, content: string, fallbackLabel: string) {
  const titleKey = getSiteContentTitleKey(docPath)
  if (!titleKey) return
  const title = extractTitleFromContent(content, fallbackLabel)
  fetch('/api/site-content', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: titleKey, value: title }),
  }).catch(() => { /* ignore */ })
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

export default function EditorPage() {
  const { statuses: docStatuses, setStatus: setDocStatus } = useDocumentStatuses()
  const { getConfig: getPublishConfig, setConfig: setPublishConfig } = useDocumentPublishing()
  const [docGroups, setDocGroups] = useState<DocGroup[]>(DEFAULT_DOC_GROUPS)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
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
  // Synchronous lock — prevents autosave + manual save races that produce
  // GitHub 409 (stale blob SHA).
  const saveInFlightRef = useRef<boolean>(false)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle')
  const lastSavedRef = useRef<Date | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const sessionStartWordsRef = useRef<number>(0)
  const sessionStartTimeRef = useRef<Date | null>(null)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const [toolbarKey, setToolbarKey] = useState(0)
  const [editorSelection, setEditorSelection] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarCollapsed(true)
    }
  }, [])
  const [showMoreTools, setShowMoreTools] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const editorScrollRef = useRef<HTMLDivElement>(null)

  // Find & Replace state
  const [showFindReplace, setShowFindReplace] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findCount, setFindCount] = useState(0)

  // Metricas de escrita
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))

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
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

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

  // Escape para sair do modo foco ou fechar dropdown
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showMoreTools) setShowMoreTools(false)
        else if (focusMode) setFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [focusMode, showMoreTools])

  // Close "Mais ferramentas" dropdown on outside click
  useEffect(() => {
    if (!showMoreTools) return
    function handleClick() { setShowMoreTools(false) }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [showMoreTools])

  // Session timer: track elapsed time since document opened
  useEffect(() => {
    if (!selectedPath) {
      sessionStartTimeRef.current = null
      setSessionElapsed(0)
      return
    }
    sessionStartTimeRef.current = new Date()
    setSessionElapsed(0)
    const interval = setInterval(() => {
      if (sessionStartTimeRef.current) {
        setSessionElapsed(Math.floor((Date.now() - sessionStartTimeRef.current.getTime()) / 1000))
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [selectedPath])

  // Listen to editor selection/transaction changes to update toolbar active states
  useEffect(() => {
    const editor = richEditorRef.current?.editor
    if (!editor) return
    const handler = () => {
      setToolbarKey(k => k + 1)
      const { from, to } = editor.state.selection
      if (from !== to) {
        setEditorSelection(editor.state.doc.textBetween(from, to, ' '))
      } else {
        setEditorSelection('')
      }
    }
    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)
    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
    }
  }, [selectedPath, loading])

  // Extract headings for outline/TOC
  const headings = useMemo(() => {
    const result: { level: number; text: string; index: number }[] = []
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,3})\s+(.+)$/)
      if (match) {
        result.push({ level: match[1].length, text: match[2], index: i })
      }
    }
    return result
  }, [content])

  // Scroll to heading in editor by line index
  const scrollToHeading = useCallback((lineIndex: number) => {
    const editor = richEditorRef.current?.editor
    if (!editor) return
    const doc = editor.state.doc
    let currentLine = 0
    let targetPos = 0
    doc.descendants((node, pos) => {
      if (targetPos > 0) return false
      if (node.isBlock) {
        if (currentLine === lineIndex) {
          targetPos = pos
          return false
        }
        const text = node.textContent
        const newlines = (text.match(/\n/g) || []).length
        currentLine += 1 + newlines
      }
      return true
    })
    if (targetPos > 0) {
      editor.chain().focus().setTextSelection(targetPos + 1).run()
      const domEl = editor.view.domAtPos(targetPos + 1)
      if (domEl?.node) {
        const el = domEl.node instanceof HTMLElement ? domEl.node : domEl.node.parentElement
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [])

  // Aplica destaque visual e scroll nos blocos entre [fromPos, toPos] — as posições são
  // do documento ProseMirror, capturadas antes/depois do insert. Usa view.nodeDOM para
  // pegar o elemento renderizado de cada node de bloco.
  // Toast de confirmação quando a autora aceita uma sugestão. Aparece no topo do
  // editor, fade in + fade out via transition (keyframe animation + forwards travou
  // em opacity 0 no Chrome quando o elemento é remontado via key).
  const [toastPhase, setToastPhase] = useState<'hidden' | 'in' | 'out'>('hidden')
  const toastTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const scrollToAfterInsert = useCallback((editor: Editor, toPos: number) => {
    setTimeout(() => {
      try {
        const docSize = editor.state.doc.content.size
        const pos = Math.min(Math.max(0, toPos), docSize)
        const dom = editor.view.domAtPos(pos)
        const el = dom.node instanceof Element ? dom.node : dom.node.parentElement
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } catch {
        /* scroll cosmético */
      }
    }, 60)
  }, [])

  const showInsertToast = useCallback(() => {
    toastTimersRef.current.forEach(clearTimeout)
    toastTimersRef.current = []
    // Monta escondido, então fade in em 1 frame (evita frame inicial visível no lugar final)
    setToastPhase('hidden')
    toastTimersRef.current.push(setTimeout(() => setToastPhase('in'), 10))
    toastTimersRef.current.push(setTimeout(() => setToastPhase('out'), 1600))
    toastTimersRef.current.push(setTimeout(() => setToastPhase('hidden'), 1900))
  }, [])

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach(clearTimeout)
    }
  }, [])

  const handleInsertText = useCallback((text: string) => {
    const editor = richEditorRef.current?.editor
    if (!editor) return
    const html = markdownToHtml(text)
    editor.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run()
    scrollToAfterInsert(editor, editor.state.selection.to)
    showInsertToast()
  }, [scrollToAfterInsert, showInsertToast])

  // "Aceitar": substitui a seleção se houver, senão insere no cursor. Em qualquer caso,
  // o markdown é convertido para HTML antes de entrar no TipTap.
  const handleAcceptSuggestion = useCallback((text: string) => {
    const editor = richEditorRef.current?.editor
    if (!editor) return
    const html = markdownToHtml(text)
    const { from, to } = editor.state.selection

    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, html, { parseOptions: { preserveWhitespace: false } }).run()
    } else {
      editor.chain().focus().insertContent(html, { parseOptions: { preserveWhitespace: false } }).run()
    }
    scrollToAfterInsert(editor, editor.state.selection.to)
    showInsertToast()
  }, [scrollToAfterInsert, showInsertToast])

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const addDocument = (sectionName: string) => {
    if (!newDocName.trim()) return
    const name = newDocName.trim()
    const folder = sectionName === 'Bíblia' ? 'biblia' : sectionName === 'Livro' ? 'livro' : 'contos'
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
        sessionStartWordsRef.current = data.content.trim() ? data.content.trim().split(/\s+/).length : 0
      } else if (res.status === 404) {
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
    if (saveInFlightRef.current) return
    // Cancel any pending autosave so it doesn't race with this save.
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    saveInFlightRef.current = true
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
        syncTitleToSiteContent(selectedPath, content, selectedLabel)
        setMessage({ type: 'success', text: 'Arquivo salvo com sucesso.' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão.' })
    } finally {
      setSaving(false)
      saveInFlightRef.current = false
    }
  }, [selectedPath, content, selectedLabel])

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
      // Skip if a manual save is in flight — prevents stale-SHA 409.
      if (saveInFlightRef.current) return
      saveInFlightRef.current = true
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
          syncTitleToSiteContent(selectedPath, content, selectedLabel)
          setTimeout(() => setAutosaveStatus('idle'), 3000)
        } else {
          // Surface the actual error so diagnosing 409/502/etc. doesn't require devtools.
          let errMsg = `HTTP ${res.status}`
          try {
            const data = await res.json()
            if (data?.error) errMsg = String(data.error)
          } catch { /* keep status-only message */ }
          console.error('[autosave]', errMsg)
          setMessage({ type: 'error', text: 'Autosave: ' + errMsg })
          setAutosaveStatus('error')
        }
      } catch (err) {
        console.error('[autosave] network error', err)
        setMessage({ type: 'error', text: 'Autosave: erro de conexão.' })
        setAutosaveStatus('error')
      } finally {
        saveInFlightRef.current = false
      }
    }, 2000)
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [content, selectedPath, selectedLabel])

  async function handleMediaUpload(file: File, type: 'image' | 'video' | 'audio') {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/editor/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        let tag = ''
        if (type === 'image') {
          tag = `![${file.name}](${data.url})`
        } else if (type === 'video') {
          tag = `<video src="${data.url}" controls width="100%"></video>`
        } else {
          tag = `<audio src="${data.url}" controls></audio>`
        }
        const editor = richEditorRef.current?.editor
        if (editor) {
          editor.chain()
            .focus('end')
            .insertContent([
              { type: 'paragraph', content: [{ type: 'text', text: tag }] },
            ])
            .run()
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

  // Trigger AI action: open chat and dispatch event
  const triggerAIAction = useCallback((action: string) => {
    setShowChat(true)
    window.dispatchEvent(new CustomEvent('koru-ai-action', { detail: { action } }))
  }, [])

  // Autosave status display
  const autosaveNode = selectedPath && autosaveStatus !== 'idle' ? (
    <span className="font-sans text-[11px] flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
      {autosaveStatus === 'pending' && (
        <>
          <span style={{ opacity: 0.5 }}>&#8226;</span>
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
          <span>salvo</span>
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
              style={{ fontFamily: 'var(--font-sans), Inter, sans-serif', color: 'var(--foreground)' }}
            >
              {selectedLabel}
            </h2>
            {autosaveNode}
            {wordCount > 0 && (
              <p className="text-[11px] font-sans tabular-nums flex items-center gap-2.5" style={{ color: 'var(--muted-foreground)' }}>
                <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                <span style={{ opacity: 0.4 }}>&middot;</span>
                <span>{readingMinutes} min</span>
                {(wordCount - sessionStartWordsRef.current > 0 || sessionElapsed >= 60) && (
                  <>
                    <span style={{ opacity: 0.4 }}>&middot;</span>
                    <span style={{ color: 'var(--foreground)', opacity: 1 }}>
                      {wordCount - sessionStartWordsRef.current > 0 && `+${(wordCount - sessionStartWordsRef.current).toLocaleString('pt-BR')}`}
                      {wordCount - sessionStartWordsRef.current > 0 && sessionElapsed >= 60 && ' \u00b7 '}
                      {sessionElapsed >= 60 && `${Math.floor(sessionElapsed / 60)} min`}
                    </span>
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
    <div className="flex-1 flex flex-col min-h-0 px-4 py-3 font-sans">
      <div className="flex flex-1 gap-3 min-h-0">
        {/* Sidebar toggle — when collapsed */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="shrink-0 flex items-center justify-center w-8 rounded-lg transition-colors self-start mt-1"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            title="Mostrar sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`shrink-0 overflow-y-auto overflow-x-hidden rounded-xl p-3 flex flex-col gap-1 transition-all duration-200 ${
            sidebarCollapsed ? 'w-0 p-0 border-0 opacity-0' : 'w-[min(19rem,calc(100vw-3rem))]'
          }`}
          style={sidebarCollapsed ? {} : {
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Sidebar header: project name + collapse */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm font-sans font-medium truncate"
              style={{ color: 'var(--foreground)' }}
            >
              Koru
            </span>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="flex items-center justify-center rounded-lg p-1 transition-colors shrink-0"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              title="Esconder sidebar"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
          </div>

          {/* + Novo / Importar buttons */}
          <div className="flex gap-1.5 mb-2">
            <button
              onClick={() => { setAddingTo(docGroups[0]?.section ?? 'Biblia'); setNewDocName('') }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-sans font-medium transition-colors"
              style={{ background: 'color-mix(in oklch, var(--foreground) 6%, transparent)', color: 'var(--foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-sans font-medium transition-colors"
              style={{ background: 'color-mix(in oklch, var(--foreground) 6%, transparent)', color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 6%, transparent)' }}
              title="Em breve"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Importar
            </button>
          </div>

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
                    e.currentTarget.style.background = `color-mix(in oklch, var(--foreground) 6%, transparent)`
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
                    style={{ background: 'var(--muted-foreground)', opacity: 0.7 }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: 'var(--muted-foreground)' }}
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
                  <div className="flex flex-col gap-0.5 mt-0.5 mb-2 pr-2">
                    {group.docs.map((doc) => (
                      <div key={doc.path} className="group flex items-center gap-1">
                        {renamingDoc?.path === doc.path ? (
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
                            <span className="flex-1 truncate">{doc.label}</span>
                            {selectedPath === doc.path && wordCount > 0 && (
                              <span
                                className="ml-2 text-[10px] font-sans tabular-nums shrink-0"
                                style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}
                              >
                                {wordCount}
                              </span>
                            )}
                          </button>
                        )}
                        {renamingDoc?.path !== doc.path && (
                          <div
                            className="shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            data-row-status
                          >
                            <DocumentStatusBadge
                              value={docStatuses[doc.path] ?? null}
                              onChange={(next) => setDocStatus(doc.path, next)}
                              compact
                              showLabel={selectedPath === doc.path}
                            />
                          </div>
                        )}
                        {renamingDoc?.path !== doc.path && (
                          <div
                            className="shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            data-row-publish
                          >
                            <DocumentPublishControl
                              value={getPublishConfig(doc.path)}
                              onChange={(next) => setPublishConfig(doc.path, next)}
                              showLabel={selectedPath === doc.path}
                            />
                          </div>
                        )}
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

          {/* Outline / TOC */}
          {selectedPath && headings.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid color-mix(in oklch, var(--border) 50%, transparent)' }}>
              <p
                className="text-[9px] font-sans uppercase tracking-[0.15em] px-2.5 mb-2"
                style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}
              >
                Estrutura
              </p>
              <div className="flex flex-col gap-0.5">
                {headings.map((h, i) => (
                  <button
                    key={`${h.index}-${i}`}
                    onClick={() => scrollToHeading(h.index)}
                    className="text-left rounded-lg py-1 text-xs transition-all duration-150 truncate"
                    style={{
                      color: 'var(--muted-foreground)',
                      paddingLeft: `${0.75 + (h.level - 1) * 0.75}rem`,
                      paddingRight: '0.5rem',
                      fontSize: h.level === 1 ? '12px' : '11px',
                      fontWeight: h.level === 1 ? 500 : 400,
                      fontFamily: h.level === 1 ? 'var(--font-sans), Inter, sans-serif' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)'
                      e.currentTarget.style.color = 'var(--foreground)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--muted-foreground)'
                    }}
                    title={h.text}
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
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
                  Use Ctrl+S para salvar rapidamente.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Document title — editable inline */}
              <div className="mb-2 flex items-center gap-3">
                {editingTitle ? (
                  <input
                    ref={titleInputRef}
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = titleDraft.trim()
                        if (trimmed && selectedPath) {
                          const group = docGroups.find(g => g.docs.some(d => d.path === selectedPath))
                          if (group) renameDocument(group.section, selectedPath, trimmed)
                        }
                        setEditingTitle(false)
                      }
                      if (e.key === 'Escape') setEditingTitle(false)
                    }}
                    onBlur={() => {
                      const trimmed = titleDraft.trim()
                      if (trimmed && selectedPath) {
                        const group = docGroups.find(g => g.docs.some(d => d.path === selectedPath))
                        if (group) renameDocument(group.section, selectedPath, trimmed)
                      }
                      setEditingTitle(false)
                    }}
                    className="text-lg leading-tight font-medium outline-none bg-transparent border-b"
                    style={{
                      fontFamily: 'var(--font-sans), Inter, sans-serif',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)',
                      minWidth: '120px',
                    }}
                  />
                ) : (
                  <h2
                    className="text-lg leading-tight font-medium cursor-text"
                    style={{ fontFamily: 'var(--font-sans), Inter, sans-serif', color: 'var(--foreground)' }}
                    onClick={() => { setTitleDraft(selectedLabel); setEditingTitle(true) }}
                    title="Clique para renomear"
                  >
                    {selectedLabel}
                  </h2>
                )}
                <span className="text-[10px] font-mono" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
                  {selectedPath}
                </span>
              </div>

              {/* AI Actions Top Bar — Sudowrite style */}
              <div
                className="flex items-center mb-3 rounded-lg px-2 py-1.5"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {/* Left: Voltar + AI actions */}
                <div className="flex items-center gap-1">
                  {/* Voltar */}
                  <a
                    href="/admin"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg>
                    Voltar
                  </a>

                  <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />

                  {/* Escrever */}
                  <button
                    onClick={() => triggerAIAction('continue')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Escrever
                  </button>

                  {/* Reescrever */}
                  <button
                    onClick={() => triggerAIAction('rewrite')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Reescrever
                  </button>

                  {/* Descrever */}
                  <button
                    onClick={() => triggerAIAction('describe')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    </svg>
                    Descrever
                  </button>

                  {/* Expandir */}
                  <button
                    onClick={() => triggerAIAction('expand')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                    Expandir
                  </button>

                  {/* Mais ferramentas — dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMoreTools(!showMoreTools) }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Mais
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {showMoreTools && (
                      <div
                        className="absolute top-full left-0 mt-1 rounded-lg py-1 z-20 min-w-[160px]"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 12px oklch(0 0 0 / 0.15)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {[
                          { action: 'consistency', label: 'Consistencia' },
                          { action: 'correct', label: 'Corrigir' },
                          { action: 'feedback', label: 'Feedback' },
                          { action: 'report', label: 'Relatorio' },
                        ].map((item) => (
                          <button
                            key={item.action}
                            onClick={() => { triggerAIAction(item.action); setShowMoreTools(false) }}
                            className="w-full text-left px-3 py-2 text-sm font-sans transition-colors"
                            style={{ color: 'var(--foreground)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right side: word count, autosave, focus, IA, save */}
                <div className="flex items-center gap-2">
                  {/* Word count */}
                  <span className="text-[11px] font-sans tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                    {wordCount > 0 ? `Palavras: ${wordCount.toLocaleString('pt-BR')}` : ''}
                  </span>

                  {/* Autosave status */}
                  {autosaveNode}

                  <span className="mx-0.5 h-4 w-px" style={{ background: 'var(--border)' }} />

                  {/* Focus mode */}
                  <button
                    onClick={() => setFocusMode(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent' }}
                    title="Modo foco (Esc para sair)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    Foco
                  </button>

                  {/* Chat toggle */}
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-sans font-medium transition-colors"
                    style={
                      showChat
                        ? { background: 'var(--foreground)', color: 'var(--background)', borderRadius: '0.375rem' }
                        : { color: 'var(--muted-foreground)' }
                    }
                    onMouseEnter={(e) => {
                      if (!showChat) {
                        e.currentTarget.style.color = 'var(--foreground)'
                        e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showChat) {
                        e.currentTarget.style.color = 'var(--muted-foreground)'
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    IA
                  </button>

                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="rounded-md px-4 py-1.5 text-sm font-sans font-medium transition-all duration-200 hover:opacity-80 disabled:opacity-40 flex items-center"
                    style={{
                      background: 'var(--foreground)',
                      color: 'var(--background)',
                      opacity: autosaveStatus === 'saved' ? 0.5 : undefined,
                    }}
                  >
                    {saving ? 'Salvando...' : autosaveStatus === 'saved' ? 'Salvo' : 'Salvar'}
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
                      {findCount} ocorr&ecirc;ncia{findCount !== 1 ? 's' : ''}
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

              {/* Toolbar — sticky with backdrop blur */}
              {(() => {
                const editor = richEditorRef.current?.editor
                void toolbarKey
                const isActive = (type: string, attrs?: Record<string, unknown>) => editor?.isActive(type, attrs) ?? false
                const activeStyle = (type: string, attrs?: Record<string, unknown>) => ({
                  background: isActive(type, attrs) ? 'color-mix(in oklch, var(--foreground) 10%, transparent)' : undefined,
                  color: isActive(type, attrs) ? 'var(--foreground)' : 'var(--foreground)',
                  boxShadow: isActive(type, attrs) ? 'inset 0 0 0 1px color-mix(in oklch, var(--foreground) 15%, transparent)' : undefined,
                })
                const mutedActiveStyle = (type: string, attrs?: Record<string, unknown>) => ({
                  background: isActive(type, attrs) ? 'color-mix(in oklch, var(--foreground) 10%, transparent)' : undefined,
                  color: isActive(type, attrs) ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: isActive(type, attrs) ? 'inset 0 0 0 1px color-mix(in oklch, var(--foreground) 15%, transparent)' : undefined,
                })

                return (
              <div
                className="mb-2 flex items-center gap-1 rounded-xl px-3 py-1.5 sticky top-0 z-10"
                style={{
                  background: 'color-mix(in oklch, var(--background) 85%, transparent)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <button
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-bold transition-all duration-150"
                  style={activeStyle('bold')}
                  onMouseEnter={(e) => { if (!isActive('bold')) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('bold')) e.currentTarget.style.background = 'transparent' }}
                  title="Negrito"
                >
                  B
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className="rounded-lg px-2.5 py-1 text-sm italic transition-all duration-150"
                  style={activeStyle('italic')}
                  onMouseEnter={(e) => { if (!isActive('italic')) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('italic')) e.currentTarget.style.background = 'transparent' }}
                  title="It&aacute;lico"
                >
                  I
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-bold transition-all duration-150"
                  style={activeStyle('heading', { level: 1 })}
                  onMouseEnter={(e) => { if (!isActive('heading', { level: 1 })) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('heading', { level: 1 })) e.currentTarget.style.background = 'transparent' }}
                  title="T&iacute;tulo H1"
                >
                  H1
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className="rounded-lg px-2.5 py-1 text-sm font-semibold transition-all duration-150"
                  style={activeStyle('heading', { level: 2 })}
                  onMouseEnter={(e) => { if (!isActive('heading', { level: 2 })) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('heading', { level: 2 })) e.currentTarget.style.background = 'transparent' }}
                  title="T&iacute;tulo H2"
                >
                  H2
                </button>
                <button
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                  className="rounded-lg px-2 py-1 text-xs font-semibold transition-all duration-150"
                  style={activeStyle('heading', { level: 3 })}
                  onMouseEnter={(e) => { if (!isActive('heading', { level: 3 })) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('heading', { level: 3 })) e.currentTarget.style.background = 'transparent' }}
                  title="Subt&iacute;tulo H3"
                >
                  H3
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className="rounded-lg px-2.5 py-1 text-sm transition-all duration-150"
                  style={mutedActiveStyle('blockquote')}
                  onMouseEnter={(e) => { if (!isActive('blockquote')) { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' } }}
                  onMouseLeave={(e) => { if (!isActive('blockquote')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' } }}
                  title="Cita&ccedil;&atilde;o"
                >
                  &ldquo;
                </button>
                <button
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                  className="rounded-lg px-2.5 py-1 text-xs transition-all duration-150"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Separador horizontal"
                >
                  ---
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                <button
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className="rounded-lg px-2.5 py-1 text-sm transition-all duration-150"
                  style={activeStyle('bulletList')}
                  onMouseEnter={(e) => { if (!isActive('bulletList')) e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { if (!isActive('bulletList')) e.currentTarget.style.background = 'transparent' }}
                  title="Lista"
                >
                  &bull; Lista
                </button>
                <span className="mx-1 h-4 w-px" style={{ background: 'var(--border)' }} />
                {/* Media uploads — compact */}
                <button
                  onClick={() => triggerUpload('image')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir imagem"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
                <button
                  onClick={() => triggerUpload('video')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir v&iacute;deo"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </button>
                <button
                  onClick={() => triggerUpload('audio')}
                  disabled={uploading}
                  className="rounded-lg px-2 py-1 text-xs transition-colors disabled:opacity-40"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)'; e.currentTarget.style.color = 'var(--foreground)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)' }}
                  title="Inserir &aacute;udio"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </button>
                {uploading && <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>Enviando...</span>}
                {/* Find & Replace toggle (via Ctrl+H) */}
                <button
                  onClick={() => setShowFindReplace(prev => !prev)}
                  className="rounded-lg px-2 py-1 text-xs transition-colors ml-auto"
                  style={{ color: showFindReplace ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 8%, transparent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  title="Buscar e substituir (Ctrl+H)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const mime = file.type || ''
                      const inferredType: 'image' | 'video' | 'audio' =
                        mime.startsWith('video/') ? 'video' :
                        mime.startsWith('audio/') ? 'audio' : 'image'
                      handleMediaUpload(file, inferredType)
                    }
                  }}
                />
              </div>
                )
              })()}

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

              {/* Editor (chat is floating now, rendered as portal outside) */}
              <div className="flex-1 flex gap-4 min-h-0">
                <div
                  ref={editorScrollRef}
                  className="flex flex-col min-h-0 overflow-y-auto w-full"
                >
                  {loading ? (
                    <div
                      className="flex-1 flex items-center justify-center rounded-xl"
                      style={{ border: '1px dashed var(--border)' }}
                    >
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Carregando...</p>
                    </div>
                  ) : (
                    <>
                      <RichEditor
                        ref={richEditorRef}
                        markdown={content}
                        documentKey={selectedPath ?? ''}
                        onChange={(md) => setContent(md)}
                        placeholder="Comece a escrever..."
                        focusMode={focusMode}
                      />

                      {/* Bottom editor quick actions */}
                      <div
                        className="flex items-center justify-center gap-2 py-4"
                        style={{ borderTop: '1px solid color-mix(in oklch, var(--border) 40%, transparent)' }}
                      >
                        <button
                          onClick={() => triggerAIAction('continue')}
                          className="rounded-full px-4 py-2 text-xs font-sans font-medium transition-all"
                          style={{
                            background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                        >
                          Gere um rascunho
                        </button>
                        <button
                          onClick={() => triggerAIAction('expand')}
                          className="rounded-full px-4 py-2 text-xs font-sans font-medium transition-all"
                          style={{
                            background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                        >
                          Expandir trecho
                        </button>
                        <button
                          onClick={() => setShowChat(true)}
                          className="rounded-full px-4 py-2 text-xs font-sans font-medium transition-all"
                          style={{
                            background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
                            color: 'var(--foreground)',
                            border: '1px solid var(--border)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 10%, transparent)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 5%, transparent)' }}
                        >
                          Conversar sobre uma ideia
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating AI assistant */}
      <ChatToggleButton open={showChat} onClick={() => setShowChat(true)} />
      {showChat && (
        <ChatPanel
          documentPath={selectedPath}
          documentContent={content}
          selectedText={editorSelection}
          onInsertText={handleInsertText}
          onReplaceSelection={handleAcceptSuggestion}
          open={showChat}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Toast de confirmação ao aceitar uma sugestão da IA */}
      {toastPhase !== 'hidden' && (
        <div
          className="fixed rounded-full flex items-center gap-2 px-4 py-2 pointer-events-none koru-insert-toast"
          style={{
            top: 24,
            left: '50%',
            zIndex: 100,
            background: 'color-mix(in oklch, var(--accent) 90%, transparent)',
            color: 'white',
            fontSize: 12,
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.02em',
            boxShadow: '0 8px 24px color-mix(in oklch, var(--accent) 40%, transparent)',
            opacity: toastPhase === 'in' ? 1 : 0,
            transform: `translate(-50%, ${toastPhase === 'in' ? '0' : '-8px'})`,
            transition: 'opacity 260ms var(--ease-smooth), transform 260ms var(--ease-smooth)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Texto inserido
        </div>
      )}
    </div>
  )
}
