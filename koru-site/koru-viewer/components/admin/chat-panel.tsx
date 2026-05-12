'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatPanelProps {
  documentPath: string | null
  documentContent: string
  documentLabel?: string
  selectedText?: string
  onInsertText?: (text: string) => void
  onReplaceSelection?: (text: string) => void
  open: boolean
  onClose: () => void
}

// --- localStorage persistence ---

const CHAT_STORAGE_KEY = 'koru-chat-history'
const SESSION_STORAGE_KEY = 'koru-assistant-sessions'
const MAX_SESSIONS = 60

interface ChatSession {
  id: string
  docPath: string
  docLabel: string
  startedAt: number
  messages: Message[]
}

function loadHistory(path: string): Message[] {
  try {
    const all = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? '{}')
    return all[path] ?? []
  } catch {
    return []
  }
}

function saveHistory(path: string, messages: Message[]) {
  try {
    const all = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) ?? '{}')
    all[path] = messages.slice(-20)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

function loadSessions(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function archiveSession(docPath: string, docLabel: string, messages: Message[]) {
  if (messages.length === 0) return
  const sessions = loadSessions()
  sessions.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    docPath,
    docLabel: docLabel || docPath,
    startedAt: messages[0]?.timestamp ?? Date.now(),
    messages,
  })
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
  } catch {}
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === d.toDateString()
  const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  if (isToday) return `Hoje, ${time}`
  if (isYesterday) return `Ontem, ${time}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + `, ${time}`
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// --- Safe Markdown renderer (no dangerouslySetInnerHTML) ---

type ReactNode = React.ReactNode

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const [full, , boldItalic, bold, italicStar, italicUnderscore, code] = match

    if (boldItalic) {
      parts.push(<strong key={match.index}><em>{boldItalic}</em></strong>)
    } else if (bold) {
      parts.push(<strong key={match.index}>{bold}</strong>)
    } else if (italicStar || italicUnderscore) {
      parts.push(<em key={match.index}>{italicStar ?? italicUnderscore}</em>)
    } else if (code) {
      parts.push(
        <code
          key={match.index}
          style={{
            background: 'color-mix(in oklch, var(--foreground) 8%, transparent)',
            padding: '0.1em 0.35em',
            borderRadius: '0.25rem',
            fontSize: '0.85em',
            wordBreak: 'break-all' as const,
          }}
        >
          {code}
        </code>
      )
    } else {
      parts.push(full)
    }

    lastIndex = match.index + full.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

// Render a markdown table into an HTML table element, returning both the rendered React and the
// raw markdown so we can insert it back into the editor verbatim.
function parseTableMarkdown(lines: string[]): { rendered: ReactNode; markdown: string } | null {
  if (lines.length < 2) return null
  const header = lines[0]
  const sep = lines[1]
  if (!header.includes('|') || !sep.match(/^\s*\|?[-:\s|]+\|?\s*$/)) return null

  const splitRow = (row: string) =>
    row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim())

  const headerCells = splitRow(header)
  const bodyRows = lines.slice(2).map(splitRow)

  return {
    markdown: lines.join('\n'),
    rendered: (
      <table
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          fontSize: '0.8rem',
          margin: '0.5rem 0',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          // Cada coluna ganha pelo menos 140px; tabela expande além do container e o wrapper rola horizontalmente.
          minWidth: `${headerCells.length * 140}px`,
          tableLayout: 'auto' as const,
        }}
      >
        <thead>
          <tr>
            {headerCells.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase' as const,
                  padding: '0.55rem 0.7rem',
                  color: 'var(--muted-foreground)',
                  background: 'color-mix(in oklch, var(--foreground) 6%, transparent)',
                  whiteSpace: 'normal' as const,
                  wordBreak: 'normal' as const,
                  overflowWrap: 'break-word' as const,
                  minWidth: 140,
                }}
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '0.55rem 0.7rem',
                    verticalAlign: 'top',
                    color: 'var(--foreground)',
                    background: ri % 2 === 1
                      ? 'color-mix(in oklch, var(--foreground) 3%, transparent)'
                      : 'transparent',
                    whiteSpace: 'normal' as const,
                    wordBreak: 'normal' as const,
                    overflowWrap: 'break-word' as const,
                    lineHeight: 1.45,
                  }}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
  }
}

function renderMarkdownSafe(
  text: string,
  onInsert?: (text: string) => void,
  onReplace?: (text: string) => void
): ReactNode {
  const elements: ReactNode[] = []
  let key = 0

  const lines = text.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // --- Fenced code block ---
    const codeFenceMatch = line.match(/^```(\w*)$/)
    if (codeFenceMatch) {
      const lang = codeFenceMatch[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```

      const codeContent = codeLines.join('\n')

      if (lang === 'suggestion') {
        // A autora vê o trecho já diagramado (negrito, itálico, parágrafos, listas, tabelas)
        // exatamente como vai entrar no editor. Um único botão "Aceitar" decide internamente
        // entre substituir a seleção (se houver) ou inserir no cursor — o editor aplica o
        // flash lilás no trecho recém-inserido.
        const accept = onReplace ?? onInsert
        elements.push(
          <div
            key={key++}
            style={{
              background: 'color-mix(in oklch, var(--accent) 6%, transparent)',
              borderLeft: '2px solid var(--accent)',
              padding: '0.75rem 1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              margin: '0.5rem 0',
              overflow: 'hidden',
              wordBreak: 'break-word' as const,
            }}
          >
            <div
              className="koru-suggestion-preview"
              style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: '0.875rem',
                lineHeight: '1.7',
                color: 'var(--foreground)',
              }}
            >
              {renderMarkdownSafe(codeContent)}
            </div>
            {accept && (
              <div className="flex items-center gap-2 mt-2">
                <InsertButton onClick={() => accept(codeContent)} label="Aceitar" primary />
              </div>
            )}
          </div>
        )
        continue
      }

      // Regular code block — with insert button
      elements.push(
        <div key={key++} style={{ margin: '0.5rem 0' }}>
          <pre
            style={{
              background: 'color-mix(in oklch, var(--foreground) 6%, transparent)',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              overflowX: 'auto' as const,
              maxWidth: '100%',
              margin: 0,
            }}
          >
            <code>{codeContent}</code>
          </pre>
          {onInsert && (
            <div className="mt-1">
              <InsertButton onClick={() => onInsert(codeContent)} label="Inserir no editor" />
            </div>
          )}
        </div>
      )
      continue
    }

    // --- Markdown table ---
    // Detect header row followed by separator line
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[-:\s|]+\|?\s*$/)) {
      const tableLines: string[] = [line, lines[i + 1]]
      let j = i + 2
      while (j < lines.length && lines[j].includes('|') && lines[j].trim() !== '') {
        tableLines.push(lines[j])
        j++
      }
      const parsed = parseTableMarkdown(tableLines)
      if (parsed) {
        elements.push(
          <div key={key++} style={{ margin: '0.5rem 0' }}>
            <div style={{ overflowX: 'auto' }}>{parsed.rendered}</div>
            {onInsert && (
              <div className="mt-1">
                <InsertButton onClick={() => onInsert(parsed.markdown)} label="Inserir tabela no editor" />
              </div>
            )}
          </div>
        )
        i = j
        continue
      }
    }

    // --- Headings ---
    const h1Match = line.match(/^# (.+)$/)
    if (h1Match) {
      elements.push(
        <p key={key++} style={{ fontFamily: 'var(--font-sans), Inter, sans-serif', fontSize: '1.15rem', fontWeight: 600, margin: '1rem 0 0.25rem' }}>
          {renderInline(h1Match[1])}
        </p>
      )
      i++
      continue
    }
    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      elements.push(
        <p key={key++} style={{ fontFamily: 'var(--font-sans), Inter, sans-serif', fontSize: '1.05rem', fontWeight: 600, margin: '1rem 0 0.25rem' }}>
          {renderInline(h2Match[1])}
        </p>
      )
      i++
      continue
    }
    const h3Match = line.match(/^### (.+)$/)
    if (h3Match) {
      elements.push(
        <p key={key++} style={{ fontFamily: 'var(--font-sans), Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, margin: '0.75rem 0 0.25rem' }}>
          {renderInline(h3Match[1])}
        </p>
      )
      i++
      continue
    }

    // --- List block ---
    if (line.match(/^- .+/)) {
      const listItems: ReactNode[] = []
      while (i < lines.length && lines[i].match(/^- .+/)) {
        const itemText = lines[i].slice(2)
        listItems.push(
          <li key={i} style={{ marginLeft: '1rem', listStyle: 'disc', marginBottom: '0.15rem' }}>
            {renderInline(itemText)}
          </li>
        )
        i++
      }
      elements.push(
        <ul key={key++} style={{ margin: '0.5rem 0' }}>
          {listItems}
        </ul>
      )
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    // --- Paragraph ---
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^#{1,3} /) &&
      !lines[i].match(/^- /) &&
      !(lines[i].includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?[-:\s|]+\|?\s*$/))
    ) {
      paraLines.push(lines[i])
      i++
    }

    if (paraLines.length > 0) {
      const paraContent: ReactNode[] = []
      paraLines.forEach((pLine, idx) => {
        if (idx > 0) paraContent.push(<br key={`br-${idx}`} />)
        paraContent.push(...renderInline(pLine))
      })
      elements.push(
        <p key={key++} style={{ margin: '0.4rem 0' }}>
          {paraContent}
        </p>
      )
    }
  }

  return <>{elements}</>
}

// --- Insert button (reusable) ---

function InsertButton({ onClick, label, primary = false }: { onClick: () => void; label: string; primary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-sans transition-opacity hover:opacity-85"
      style={{
        fontSize: '10px',
        color: primary ? 'var(--background)' : 'var(--foreground)',
        border: primary ? 'none' : '1px solid var(--border)',
        background: primary ? 'var(--foreground)' : 'transparent',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </button>
  )
}

// --- Icons ---

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

// --- Quick action definitions ---

const QUICK_ACTIONS = [
  { key: 'correct', label: 'Corrigir', title: 'Correção ortográfica e gramatical' },
  { key: 'feedback', label: 'Feedback', title: 'Feedback de estilo literário' },
  { key: 'consistency', label: 'Consistência', title: 'Verificar consistência com a bíblia' },
  { key: 'report', label: 'Relatório', title: 'Gerar relatório completo de escrita' },
  { key: 'expand', label: 'Expandir', title: 'Expandir trecho com detalhe sensorial' },
  { key: 'describe', label: 'Descrever', title: 'Reescrever com foco sensorial' },
  { key: 'continue', label: 'Continuar', title: 'Continuar escrevendo no tom do texto' },
] as const

const WRITING_ACTIONS = new Set(['expand', 'describe', 'continue'])

const MODE_PROMPTS: Record<string, string> = {
  correct: 'Faça uma revisão ortográfica e gramatical completa do documento.',
  feedback: 'Dê feedback sobre o estilo literário deste texto, avaliando a voz da autora de Korú.',
  consistency: 'Verifique a consistência deste texto com as regras e a bíblia do mundo de Korú.',
  report: 'Gere um relatório completo de escrita sobre este documento.',
  expand: 'Expanda o trecho selecionado (ou o último parágrafo) mantendo a voz da autora. Adicione detalhe sensorial — o que se vê, ouve, sente no corpo. Retorne APENAS o texto expandido, sem explicações.',
  describe: 'Reescreva o trecho selecionado (ou o último parágrafo) focando em descrição sensorial — texturas, luz, som, peso corporal. Retorne APENAS o texto reescrito, sem explicações.',
  continue: 'Continue escrevendo as próximas 200 palavras no tom e ritmo do texto atual. Retorne APENAS o texto novo, sem explicações.',
}

function getErrorMessage(status: number | null, isNetworkError: boolean): string {
  if (isNetworkError) return 'Sem conexão com o servidor.'
  if (status === 429) return 'Muitas requisições. Aguarde alguns instantes.'
  if (status === 401) return 'Chave de API inválida. Verifique nas configurações.'
  return 'Erro ao processar resposta. Tente novamente.'
}

const STREAM_TIMEOUT_MS = 90_000

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1" style={{ color: 'var(--muted-foreground)' }}>
      <span className="text-[11px] italic">Claude está escrevendo</span>
      <span className="flex items-center gap-0.5">
        <span className="inline-block w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--foreground)', animationDelay: '0ms', animationDuration: '1s' }} />
        <span className="inline-block w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--foreground)', animationDelay: '200ms', animationDuration: '1s' }} />
        <span className="inline-block w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--foreground)', animationDelay: '400ms', animationDuration: '1s' }} />
      </span>
    </div>
  )
}

// --- Main component (floating) ---

export function ChatPanel({ documentPath, documentContent, selectedText, onInsertText, onReplaceSelection, open, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [responseMode, setResponseMode] = useState<'concise' | 'detailed'>('detailed')
  const [mounted, setMounted] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [viewingSession, setViewingSession] = useState<ChatSession | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const streamBufferRef = useRef('')
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => setMounted(true), [])

  // Load sessions when history panel opens
  useEffect(() => {
    if (showHistory) setSessions(loadSessions())
  }, [showHistory])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    const maxHeight = 8 * 24
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    if (input === '' && inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }, [input])

  const suggestionInsertCb = onInsertText
  const suggestionReplaceCb = selectedText && selectedText.length > 0 ? onReplaceSelection : undefined

  const renderedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        rendered:
          msg.role === 'assistant'
            ? renderMarkdownSafe(msg.content, suggestionInsertCb, suggestionReplaceCb)
            : null,
      })),
    [messages, suggestionInsertCb, suggestionReplaceCb]
  )

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [messages, scrollToBottom, open])

  useEffect(() => {
    if (documentPath) {
      setMessages(loadHistory(documentPath))
    } else {
      setMessages([])
    }
  }, [documentPath])

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  // ESC closes the panel
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isStreaming) onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, isStreaming, onClose])

  function handleStop() {
    abortControllerRef.current?.abort()
  }

  async function sendToAPI(messagesToSend: Message[], mode: string | null) {
    setIsStreaming(true)

    const withAssistant: Message[] = [
      ...messagesToSend,
      { role: 'assistant', content: '', timestamp: Date.now() },
    ]
    setMessages(withAssistant)

    streamBufferRef.current = ''

    const controller = new AbortController()
    abortControllerRef.current = controller

    const timeoutId = setTimeout(() => {
      controller.abort('timeout')
    }, STREAM_TIMEOUT_MS)

    streamTimerRef.current = setInterval(() => {
      const buf = streamBufferRef.current
      if (buf) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: buf }
          }
          return updated
        })
      }
    }, 250)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesToSend,
          documentPath,
          documentContent,
          mode,
          responseMode,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        clearTimeout(timeoutId)
        if (streamTimerRef.current) clearInterval(streamTimerRef.current)
        const errorMessage = getErrorMessage(res.status, false)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: errorMessage, timestamp: Date.now() }
          return updated
        })
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        clearTimeout(timeoutId)
        if (streamTimerRef.current) clearInterval(streamTimerRef.current)
        setIsStreaming(false)
        return
      }

      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              accumulated += parsed.text
              streamBufferRef.current = accumulated
            }
            if (parsed.error) {
              accumulated += `\n\nErro: ${parsed.error}`
              streamBufferRef.current = accumulated
            }
          } catch {
            /* skip */
          }
        }
      }

      clearTimeout(timeoutId)
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: accumulated }
        }
        if (documentPath) saveHistory(documentPath, updated)
        return updated
      })
    } catch (err) {
      clearTimeout(timeoutId)
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)

      const isAbort = err instanceof Error && err.name === 'AbortError'
      const isTimeout = isAbort && (err as Error).message === 'timeout'
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes('fetch')

      if (isAbort && !isTimeout) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            const partial = streamBufferRef.current || last.content
            updated[updated.length - 1] = {
              ...last,
              content: partial ? partial + '\n\n*(interrompido)*' : '*(interrompido)*',
            }
          }
          if (documentPath) saveHistory(documentPath, updated)
          return updated
        })
      } else {
        const errorContent = isTimeout
          ? 'A resposta demorou demais. Tente novamente.'
          : getErrorMessage(null, isNetwork)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: errorContent, timestamp: Date.now() }
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, null)
  }

  async function triggerModeAction(mode: string) {
    if (isStreaming) return

    let userText = MODE_PROMPTS[mode]
    if (!userText) return

    if (WRITING_ACTIONS.has(mode) && selectedText && selectedText.length > 0) {
      userText = `${userText}\n\nTrecho:\n"${selectedText}"\n\nRetorne o resultado em um bloco \`\`\`suggestion.`
    }

    const userMessage: Message = { role: 'user', content: userText, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, mode)
  }

  async function handleRewriteSelection() {
    if (isStreaming || !selectedText || selectedText.length === 0) return

    const userText = `Reescreva o seguinte trecho mantendo a voz da autora:\n\n"${selectedText}"\n\nRetorne APENAS o texto reescrito em um bloco \`\`\`suggestion.`
    const userMessage: Message = { role: 'user', content: userText, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, 'rewrite')
  }

  useEffect(() => {
    function handleAIAction(e: Event) {
      const action = (e as CustomEvent).detail?.action
      if (action && !isStreaming) {
        triggerModeAction(action)
      }
    }
    window.addEventListener('koru-ai-action', handleAIAction)
    return () => window.removeEventListener('koru-ai-action', handleAIAction)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClear() {
    if (documentPath && messages.length > 0) {
      archiveSession(documentPath, documentLabel ?? documentPath, messages)
    }
    setMessages([])
    if (documentPath) saveHistory(documentPath, [])
  }

  const hasSelection = selectedText && selectedText.length > 0
  const truncatedSelection = hasSelection && selectedText!.length > 60 ? selectedText!.slice(0, 60) + '...' : selectedText

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed flex flex-col rounded-2xl overflow-hidden glass-card"
      style={{
        bottom: 20,
        right: 20,
        width: 'min(440px, calc(100vw - 40px))',
        height: 'min(640px, calc(100vh - 120px))',
        zIndex: 90,
        border: '1px solid var(--border)',
        boxShadow: '0 20px 50px oklch(0 0 0 / 0.35)',
        animation: 'koru-chat-in 180ms ease-out',
      }}
      role="dialog"
      aria-label="Assistente de IA"
    >
      <style jsx>{`
        @keyframes koru-chat-in {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
            style={{
              background: 'color-mix(in oklch, var(--accent) 14%, transparent)',
              color: 'var(--accent)',
              fontSize: 10,
              letterSpacing: '0.15em',
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72l-6.19 4.5 2.39-7.36L2 9.36h7.61z" />
            </svg>
            IA
          </span>
          <span className="font-serif text-base truncate" style={{ color: 'var(--foreground)' }}>
            Assistente
          </span>
          <button
            onClick={() => setResponseMode((m) => (m === 'concise' ? 'detailed' : 'concise'))}
            className="ml-1 rounded-full px-2 py-0.5 font-sans transition-colors"
            style={{
              fontSize: '10px',
              border: '1px solid var(--border)',
              background:
                responseMode === 'detailed'
                  ? 'color-mix(in oklch, var(--foreground) 10%, transparent)'
                  : 'transparent',
              color:
                responseMode === 'detailed' ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
            title={responseMode === 'concise' ? 'Respostas curtas' : 'Respostas detalhadas'}
          >
            {responseMode === 'concise' ? 'Curta' : 'Detalhada'}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => { setShowHistory((v) => !v); setViewingSession(null) }}
            className="transition-colors rounded p-1"
            style={{ color: showHistory ? 'var(--foreground)' : 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = showHistory ? 'var(--foreground)' : 'var(--muted-foreground)')}
            title="Histórico de conversas"
            aria-label="Histórico"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          {messages.length > 0 && !showHistory && (
            <button
              onClick={handleClear}
              className="text-[10px] transition-colors rounded px-1.5 py-1"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              title="Arquivar e limpar conversa"
            >
              Limpar
            </button>
          )}
          <button
            onClick={onClose}
            className="transition-colors rounded p-1"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            title="Fechar (Esc)"
            aria-label="Fechar assistente"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* History panel */}
      {showHistory && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {viewingSession ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setViewingSession(null)}
                  className="flex items-center gap-1 text-[11px] transition-colors rounded px-1.5 py-1"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Voltar
                </button>
                <span className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                  {formatSessionDate(viewingSession.startedAt)} · {viewingSession.docLabel}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {viewingSession.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                      style={
                        msg.role === 'user'
                          ? { background: 'var(--foreground)', color: 'var(--background)', wordBreak: 'break-word' }
                          : { background: 'color-mix(in oklch, var(--foreground) 6%, transparent)', color: 'var(--foreground)', wordBreak: 'break-word' }
                      }
                    >
                      {msg.role === 'assistant'
                        ? renderMarkdownSafe(msg.content, undefined, undefined)
                        : <p className="text-sm">{msg.content}</p>}
                      <p className="text-[9px] mt-1 opacity-40">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted-foreground)', marginBottom: 12 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                    Nenhuma conversa arquivada ainda.
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                    Use &ldquo;Limpar&rdquo; para arquivar e começar uma nova.
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setViewingSession(session)}
                      className="w-full text-left px-3 py-2.5 transition-colors flex flex-col gap-0.5"
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 4%, transparent)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {session.docLabel}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                          {session.messages.length} msg
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
                          {session.messages.find(m => m.role === 'user')?.content.slice(0, 60) ?? '—'}
                        </span>
                        <span className="text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>
                          {formatSessionDate(session.startedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      {!showHistory && <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center px-6 py-8">
            <div
              className="rounded-full p-2.5 mb-3"
              style={{ background: 'color-mix(in oklch, var(--accent) 12%, transparent)', color: 'var(--accent)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
              </svg>
            </div>
            <p className="font-serif text-base" style={{ color: 'var(--foreground)' }}>
              Pergunte, corrija, expanda
            </p>
            <p className="text-[11px] max-w-[280px] leading-relaxed mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
              Respostas em prosa, tabelas ou sugestões inseríveis com um clique.
            </p>
          </div>
        )}

        {renderedMessages.map((msg, i) => {
          const isThisStreaming = isStreaming && i === messages.length - 1 && msg.role === 'assistant'
          const canInsertWhole = msg.role === 'assistant' && !isThisStreaming && !!msg.content && !!onInsertText

          return (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? { background: 'var(--foreground)', color: 'var(--background)', overflow: 'hidden', wordBreak: 'break-word' }
                    : { background: 'color-mix(in oklch, var(--foreground) 6%, transparent)', color: 'var(--foreground)', overflow: 'hidden', wordBreak: 'break-word' }
                }
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div className="group relative">
                      {msg.rendered}
                      {isThisStreaming && (
                        <span className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse rounded-sm" style={{ background: 'var(--foreground)' }} />
                      )}
                      {!isThisStreaming && msg.content && (
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 rounded transition-opacity"
                          style={{ color: 'var(--muted-foreground)' }}
                          title="Copiar"
                        >
                          <CopyIcon />
                        </button>
                      )}
                    </div>
                    {canInsertWhole && (
                      <div className="flex items-center justify-between gap-2 mt-3">
                        <span className="font-sans" style={{ fontSize: '10px', color: 'var(--muted-foreground)', opacity: 0.5 }}>
                          {msg.timestamp ? formatTime(msg.timestamp) : ''}
                        </span>
                        <InsertButton onClick={() => onInsertText!(msg.content)} label="Inserir resposta" primary />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span>{msg.content}</span>
                    {msg.timestamp && (
                      <p className="font-sans mt-1 self-end" style={{ fontSize: '10px', color: 'color-mix(in oklch, var(--background) 60%, transparent)' }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>}

      {/* Input area — hidden when viewing history */}
      {!showHistory && <div className="shrink-0">
        {hasSelection && (
          <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <button
              onClick={handleRewriteSelection}
              disabled={isStreaming}
              className="rounded-full px-3 py-1 font-sans transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
              style={{
                fontSize: '10px',
      <div className="shrink-0">
        {hasSelection && (
          <div className="px-3 pt-2 pb-1 flex items-center gap-2">
            <button
              onClick={handleRewriteSelection}
              disabled={isStreaming}
              className="rounded-full px-3 py-1 font-sans transition-opacity hover:opacity-80 disabled:opacity-40 shrink-0"
              style={{
                fontSize: '10px',
                background: 'color-mix(in oklch, var(--foreground) 8%, transparent)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            >
              Reescrever seleção
            </button>
            <span className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
              {truncatedSelection}
            </span>
          </div>
        )}

        {isStreaming && (
          <div className="px-3 pt-1">
            <TypingIndicator />
          </div>
        )}

        <div className="p-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={documentPath ? 'Pergunte, corrija, expanda...' : 'Selecione um documento'}
              rows={2}
              className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in oklch, var(--foreground) 4%, transparent)',
                color: 'var(--foreground)',
                // @ts-expect-error custom property
                '--tw-ring-color': 'var(--foreground)',
                overflow: 'hidden',
              }}
              disabled={isStreaming || !documentPath}
            />
            <div className="flex flex-col gap-1 shrink-0">
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5"
                  style={{
                    background: 'color-mix(in oklch, oklch(0.55 0.22 25) 15%, var(--surface))',
                    color: 'oklch(0.65 0.2 25)',
                    border: '1px solid color-mix(in oklch, oklch(0.55 0.22 25) 25%, transparent)',
                  }}
                  title="Parar geração"
                >
                  <StopIcon />
                  <span>Parar</span>
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || !documentPath}
                  className="rounded-lg px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                >
                  Enviar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// --- Floating toggle button (separate export) ---

interface ChatToggleProps {
  open: boolean
  onClick: () => void
  unread?: number
}

export function ChatToggleButton({ open, onClick, unread }: ChatToggleProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  if (pathname !== '/admin/editor') return null

  return createPortal(
    <button
      onClick={onClick}
      className="fixed rounded-full flex items-center justify-center transition-all hover:scale-105"
      style={{
        bottom: 20,
        right: 20,
        width: 48,
        height: 48,
        zIndex: 89,
        background: 'var(--foreground)',
        color: 'var(--background)',
        boxShadow: '0 8px 24px oklch(0 0 0 / 0.35)',
        opacity: open ? 0 : 1,
        pointerEvents: open ? 'none' : 'auto',
        transform: open ? 'translateY(16px)' : 'translateY(0)',
      }}
      aria-label="Abrir assistente de IA"
      title="Assistente de IA"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
        <path d="M18 14l1.05 3.15L22 18.5l-2.95.85L18 22.5l-1.05-3.15L14 18.5l2.95-.85L18 14z" opacity="0.5" />
      </svg>
      {unread !== undefined && unread > 0 && (
        <span
          className="absolute rounded-full flex items-center justify-center font-sans font-medium"
          style={{
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            padding: '0 5px',
            fontSize: 10,
            background: 'oklch(0.65 0.2 25)',
            color: 'white',
          }}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>,
    document.body
  )
}
