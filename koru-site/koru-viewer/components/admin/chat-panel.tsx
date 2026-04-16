'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

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
}

// --- localStorage persistence ---

const CHAT_STORAGE_KEY = 'koru-chat-history'
const CHAT_WIDTH_KEY = 'koru-chat-width'
const DEFAULT_WIDTH = 380
const MIN_WIDTH = 300
const MAX_WIDTH = 600

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
    // Keep only last 20 messages per doc to avoid storage bloat
    all[path] = messages.slice(-20)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(all))
  } catch {}
}

function loadWidth(): number {
  try {
    const w = parseInt(localStorage.getItem(CHAT_WIDTH_KEY) ?? '', 10)
    if (w >= MIN_WIDTH && w <= MAX_WIDTH) return w
  } catch {}
  return DEFAULT_WIDTH
}

function saveWidth(w: number) {
  try {
    localStorage.setItem(CHAT_WIDTH_KEY, String(w))
  } catch {}
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// --- Safe Markdown renderer (no dangerouslySetInnerHTML) ---

type ReactNode = React.ReactNode

function renderInline(text: string): ReactNode[] {
  // Splits text into segments: bold-italic, bold, italic, inline code, plain
  const parts: ReactNode[] = []
  // Pattern order matters: bold-italic before bold before italic
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|`([^`]+)`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Push plain text before this match
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

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function renderMarkdownSafe(
  text: string,
  onInsertSuggestion?: (text: string) => void,
  onReplaceSuggestion?: (text: string) => void
): ReactNode {
  const elements: ReactNode[] = []
  let key = 0

  // Split into blocks on double newline, but first extract fenced code blocks
  // We process line by line to handle code fences, lists, headers, paragraphs

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

      // --- Suggestion block (special rendering) ---
      if (lang === 'suggestion') {
        elements.push(
          <div
            key={key++}
            style={{
              background: 'color-mix(in oklch, var(--foreground) 5%, transparent)',
              borderLeft: '2px solid var(--border)',
              padding: '0.75rem 1rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              margin: '0.5rem 0',
              overflow: 'hidden',
              wordBreak: 'break-word' as const,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: '0.875rem',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                color: 'var(--foreground)',
              }}
            >
              {codeContent}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {onInsertSuggestion && (
                <button
                  onClick={() => onInsertSuggestion(codeContent)}
                  className="rounded-full px-3 py-1 font-sans transition-opacity hover:opacity-80"
                  style={{
                    fontSize: '10px',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                  }}
                >
                  Inserir no editor
                </button>
              )}
              {onReplaceSuggestion && (
                <button
                  onClick={() => onReplaceSuggestion(codeContent)}
                  className="rounded-full px-3 py-1 font-sans transition-opacity hover:opacity-80"
                  style={{
                    fontSize: '10px',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                  }}
                >
                  Aplicar
                </button>
              )}
            </div>
          </div>
        )
        continue
      }

      // --- Regular code block ---
      elements.push(
        <pre
          key={key++}
          style={{
            background: 'color-mix(in oklch, var(--foreground) 6%, transparent)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            overflowX: 'auto' as const,
            maxWidth: '100%',
            margin: '0.5rem 0',
          }}
        >
          <code>{codeContent}</code>
        </pre>
      )
      continue
    }

    // --- H1 ---
    const h1Match = line.match(/^# (.+)$/)
    if (h1Match) {
      elements.push(
        <p
          key={key++}
          style={{
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontSize: '1.15rem',
            fontWeight: 600,
            margin: '1rem 0 0.25rem',
          }}
        >
          {renderInline(h1Match[1])}
        </p>
      )
      i++
      continue
    }

    // --- H2 ---
    const h2Match = line.match(/^## (.+)$/)
    if (h2Match) {
      elements.push(
        <p
          key={key++}
          style={{
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 600,
            margin: '1rem 0 0.25rem',
          }}
        >
          {renderInline(h2Match[1])}
        </p>
      )
      i++
      continue
    }

    // --- H3 ---
    const h3Match = line.match(/^### (.+)$/)
    if (h3Match) {
      elements.push(
        <p
          key={key++}
          style={{
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontSize: '0.95rem',
            fontWeight: 600,
            margin: '0.75rem 0 0.25rem',
          }}
        >
          {renderInline(h3Match[1])}
        </p>
      )
      i++
      continue
    }

    // --- List block: collect consecutive list items ---
    if (line.match(/^- .+/)) {
      const listItems: ReactNode[] = []
      while (i < lines.length && lines[i].match(/^- .+/)) {
        const itemText = lines[i].slice(2)
        listItems.push(
          <li
            key={i}
            style={{ marginLeft: '1rem', listStyle: 'disc', marginBottom: '0.15rem' }}
          >
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

    // --- Blank line: paragraph break (skip) ---
    if (line.trim() === '') {
      i++
      continue
    }

    // --- Regular paragraph: collect until blank line or special block ---
    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^```/) &&
      !lines[i].match(/^#{1,3} /) &&
      !lines[i].match(/^- /)
    ) {
      paraLines.push(lines[i])
      i++
    }

    if (paraLines.length > 0) {
      // Render lines within a paragraph, joining with <br /> on single newlines
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

// --- Copy icon SVG ---

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

// --- Export icon SVG ---

function ExportIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

// --- Stop icon SVG ---

function StopIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}

// --- Sparkle icon SVG (empty state) ---

function SparkleIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'var(--foreground)' }}
    >
      <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
      <path d="M18 14l1.05 3.15L22 18.5l-2.95.85L18 22.5l-1.05-3.15L14 18.5l2.95-.85L18 14z" opacity="0.5" />
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

// --- Error message mapping by HTTP status ---

function getErrorMessage(status: number | null, isNetworkError: boolean): string {
  if (isNetworkError) return 'Sem conexão com o servidor.'
  if (status === 429) return 'Muitas requisições. Aguarde alguns instantes.'
  if (status === 401) return 'Chave de API inválida. Verifique nas configurações.'
  return 'Erro ao processar resposta. Tente novamente.'
}

// --- Streaming timeout (ms) ---

const STREAM_TIMEOUT_MS = 90_000

// --- Typing indicator component ---

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-1"
      style={{ color: 'var(--muted-foreground)' }}
    >
      <span className="text-[11px] italic">Claude está escrevendo</span>
      <span className="flex items-center gap-0.5">
        <span
          className="inline-block w-1 h-1 rounded-full animate-bounce"
          style={{
            background: 'var(--foreground)',
            animationDelay: '0ms',
            animationDuration: '1s',
          }}
        />
        <span
          className="inline-block w-1 h-1 rounded-full animate-bounce"
          style={{
            background: 'var(--foreground)',
            animationDelay: '200ms',
            animationDuration: '1s',
          }}
        />
        <span
          className="inline-block w-1 h-1 rounded-full animate-bounce"
          style={{
            background: 'var(--foreground)',
            animationDelay: '400ms',
            animationDuration: '1s',
          }}
        />
      </span>
    </div>
  )
}

// --- Quick action button (shared between empty state and input area) ---

function QuickActionButton({
  action,
  onClick,
  disabled,
  pulse,
}: {
  action: (typeof QUICK_ACTIONS)[number]
  onClick: () => void
  disabled: boolean
  pulse?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={action.title}
      className={`rounded-full px-3 py-1 font-sans text-[11px] transition-all disabled:opacity-40 ${
        pulse ? 'animate-pulse' : ''
      }`}
      style={{
        background: 'color-mix(in oklch, var(--foreground) 7%, transparent)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
        animationDuration: pulse ? '3s' : undefined,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 14%, transparent)'
        e.currentTarget.classList.remove('animate-pulse')
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 7%, transparent)'
      }}
    >
      {action.label}
    </button>
  )
}

// --- Main component ---

export function ChatPanel({ documentPath, documentContent, selectedText, onInsertText, onReplaceSelection }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const [responseMode, setResponseMode] = useState<'concise' | 'detailed'>('concise')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Streaming throttle refs
  const streamBufferRef = useRef('')
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // AbortController ref for fetch cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load saved width on mount
  useEffect(() => {
    setPanelWidth(loadWidth())
  }, [])

  // --- Resize drag handling ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startWidth = panelRef.current?.offsetWidth ?? DEFAULT_WIDTH

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      // Dragging left edge: moving left increases width
      const delta = startX - ev.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      // Save final width
      if (panelRef.current) {
        saveWidth(panelRef.current.offsetWidth)
      }
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  // --- Textarea auto-expand ---
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    const maxHeight = 8 * 24 // ~8 rows at ~24px line height
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [])

  // Reset textarea height when input clears
  useEffect(() => {
    if (input === '' && inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }, [input])

  // Determine suggestion callbacks for current context
  const suggestionInsertCb = onInsertText
  const suggestionReplaceCb = selectedText && selectedText.length > 0 ? onReplaceSelection : undefined

  // Memoised render per-message so it doesn't re-run on unrelated state changes
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
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load history when documentPath changes
  useEffect(() => {
    if (documentPath) {
      setMessages(loadHistory(documentPath))
    } else {
      setMessages([])
    }
  }, [documentPath])

  // Cleanup interval and abort on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      abortControllerRef.current?.abort()
    }
  }, [])

  // --- Stop streaming ---

  function handleStop() {
    abortControllerRef.current?.abort()
  }

  // --- Export conversation as Markdown file ---

  function handleExport() {
    if (messages.length === 0) return

    const date = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const lines: string[] = [`# Conversa — ${date}`, '']

    for (const msg of messages) {
      const label = msg.role === 'user' ? '**Você:**' : '**Claude:**'
      lines.push(label)
      lines.push('')
      lines.push(msg.content)
      lines.push('')
    }

    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `koru-conversa-${date.replace(/\//g, '-')}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // --- Shared streaming logic ---

  async function sendToAPI(
    messagesToSend: Message[],
    mode: string | null
  ) {
    setIsStreaming(true)

    // Add empty assistant placeholder with timestamp
    const withAssistant: Message[] = [
      ...messagesToSend,
      { role: 'assistant', content: '', timestamp: Date.now() },
    ]
    setMessages(withAssistant)

    // Reset stream buffer
    streamBufferRef.current = ''

    // Create a new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    // Timeout: abort after 90 seconds without completion
    const timeoutId = setTimeout(() => {
      controller.abort('timeout')
    }, STREAM_TIMEOUT_MS)

    // Start throttled UI update interval (4x/sec max)
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
          updated[updated.length - 1] = {
            role: 'assistant',
            content: errorMessage,
            timestamp: Date.now(),
          }
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
              // Only update the ref, not state — interval handles UI
              streamBufferRef.current = accumulated
            }
            if (parsed.error) {
              accumulated += `\n\nErro: ${parsed.error}`
              streamBufferRef.current = accumulated
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      clearTimeout(timeoutId)

      // Streaming done: clear interval, do final state update
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: accumulated }
        }
        // Persist completed conversation
        if (documentPath) saveHistory(documentPath, updated)
        return updated
      })
    } catch (err) {
      clearTimeout(timeoutId)
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)

      const isAbort = err instanceof Error && err.name === 'AbortError'
      const isTimeout = isAbort && (err as Error).message === 'timeout'
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes('fetch')

      // If user manually aborted, keep partial content
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
          updated[updated.length - 1] = {
            role: 'assistant',
            content: errorContent,
            timestamp: Date.now(),
          }
          return updated
        })
      }
    } finally {
      setIsStreaming(false)
    }
  }

  // --- Send chat message (mode: null = normal chat) ---

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    // Persist user message immediately
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, null)
  }

  // --- Trigger a mode action (correct / feedback / consistency / report / expand / describe / continue) ---

  async function triggerModeAction(mode: string) {
    if (isStreaming) return

    let userText = MODE_PROMPTS[mode]
    if (!userText) return

    // For writing actions, include selected text as context and request suggestion block
    if (WRITING_ACTIONS.has(mode) && selectedText && selectedText.length > 0) {
      userText = `${userText}\n\nTrecho:\n"${selectedText}"\n\nRetorne o resultado em um bloco \`\`\`suggestion.`
    }

    const userMessage: Message = { role: 'user', content: userText, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, mode)
  }

  // --- Rewrite selection action ---

  async function handleRewriteSelection() {
    if (isStreaming || !selectedText || selectedText.length === 0) return

    const userText = `Reescreva o seguinte trecho mantendo a voz da autora:\n\n"${selectedText}"\n\nRetorne APENAS o texto reescrito em um bloco \`\`\`suggestion.`
    const userMessage: Message = { role: 'user', content: userText, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, 'rewrite')
  }

  // Listen for AI action events from the editor
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
    setMessages([])
    if (documentPath) saveHistory(documentPath, [])
  }

  const hasSelection = selectedText && selectedText.length > 0
  const truncatedSelection =
    hasSelection && selectedText!.length > 60
      ? selectedText!.slice(0, 60) + '...'
      : selectedText

  return (
    <div
      ref={panelRef}
      className="shrink-0 flex flex-col min-h-0 h-full rounded-md border relative"
      style={{
        width: `${panelWidth}px`,
        borderColor: 'var(--border)',
        background: 'var(--card, var(--surface))',
        color: 'var(--foreground)',
        overflow: 'hidden',
      }}
    >
      {/* Resize handle (left edge) */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 transition-all z-10"
        style={{
          cursor: 'col-resize',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--foreground)'
          e.currentTarget.style.opacity = '0.3'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.opacity = '1'
        }}
      />

      {/* Header — tab-style (Sudowrite-inspired) */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Left: active tab label */}
        <div className="flex items-center gap-3">
          <span
            className="font-sans font-medium"
            style={{
              fontSize: '11px',
              color: 'var(--foreground)',
              borderBottom: '1.5px solid var(--foreground)',
              paddingBottom: '2px',
            }}
          >
            Conversa
          </span>

          {/* Response mode toggle */}
          <button
            onClick={() => setResponseMode((m) => (m === 'concise' ? 'detailed' : 'concise'))}
            className="rounded-full px-2 py-0.5 font-sans transition-colors"
            style={{
              fontSize: '10px',
              border: '1px solid var(--border)',
              background:
                responseMode === 'detailed'
                  ? 'color-mix(in oklch, var(--foreground) 10%, transparent)'
                  : 'transparent',
              color:
                responseMode === 'detailed'
                  ? 'var(--foreground)'
                  : 'var(--muted-foreground)',
            }}
            title={responseMode === 'concise' ? 'Respostas curtas' : 'Respostas detalhadas'}
          >
            {responseMode === 'concise' ? 'Curta' : 'Detalhada'}
          </button>
        </div>

        {/* Right: export + clear */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 text-[10px] transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
              title="Exportar conversa como Markdown"
            >
              <ExportIcon />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p
              className="text-sm font-sans font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Inicie uma conversa
            </p>
            <p
              className="text-[11px] max-w-[260px] leading-relaxed mt-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Faça perguntas sobre seu projeto, receba sugestões de escrita ou cole um texto longo para análise.
            </p>
          </div>
        )}

        {renderedMessages.map((msg, i) => {
          const isThisStreaming = isStreaming && i === messages.length - 1 && msg.role === 'assistant'

          return (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? {
                        background: 'var(--foreground)',
                        color: 'var(--background)',
                        overflow: 'hidden' as const,
                        wordBreak: 'break-word' as const,
                      }
                    : {
                        background: 'color-mix(in oklch, var(--foreground) 7%, transparent)',
                        color: 'var(--foreground)',
                        overflow: 'hidden' as const,
                        wordBreak: 'break-word' as const,
                      }
                }
              >
                {msg.role === 'assistant' ? (
                  <>
                    <div className="group relative">
                      {msg.rendered}
                      {/* Streaming cursor */}
                      {isThisStreaming && (
                        <span
                          className="inline-block w-2 h-4 ml-0.5 align-middle animate-pulse rounded-sm"
                          style={{ background: 'var(--foreground)' }}
                        />
                      )}
                      {/* Copy button — only on complete messages */}
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
                    {/* Token estimate + timestamp — only on complete messages */}
                    {!isThisStreaming && msg.content && (
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className="font-sans"
                          style={{
                            fontSize: '10px',
                            color: 'var(--muted-foreground)',
                            opacity: 0.4,
                          }}
                        >
                          ~{Math.round(msg.content.length / 4)} tokens
                        </p>
                        {msg.timestamp && (
                          <p
                            className="font-sans"
                            style={{
                              fontSize: '10px',
                              color: 'var(--muted-foreground)',
                              opacity: 0.35,
                            }}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span>{msg.content}</span>
                    {msg.timestamp && (
                      <p
                        className="font-sans mt-1 self-end"
                        style={{
                          fontSize: '10px',
                          color: 'color-mix(in oklch, var(--background) 60%, transparent)',
                        }}
                      >
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
      </div>

      {/* Input area */}
      <div
        className="border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Selection chip — shown when text is selected in the editor */}
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
            <span
              className="text-[10px] truncate"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {truncatedSelection}
            </span>
          </div>
        )}

        {/* Typing indicator */}
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
              placeholder="Pergunte sobre o mundo, personagens, física..."
              rows={3}
              className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in oklch, var(--foreground) 4%, transparent)',
                color: 'var(--foreground)',
                // @ts-expect-error custom property
                '--tw-ring-color': 'var(--foreground)',
                overflow: 'hidden',
              }}
              disabled={isStreaming}
            />
            <div className="flex flex-col gap-1 shrink-0">
              {isStreaming ? (
                <>
                  {/* Stop button (replaces send) */}
                  <button
                    onClick={handleStop}
                    className="rounded-md px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80 flex items-center justify-center gap-1.5"
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
                </>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-md px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{
                    background: 'var(--foreground)',
                    color: 'var(--background)',
                  }}
                >
                  Enviar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
