'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatPanelProps {
  documentPath: string | null
  documentContent: string
  documentLabel?: string
}

// --- localStorage persistence ---

const CHAT_STORAGE_KEY = 'koru-chat-history'

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

function renderMarkdownSafe(text: string): ReactNode {
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
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre
          key={key++}
          style={{
            background: 'color-mix(in oklch, var(--foreground) 6%, transparent)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            overflowX: 'auto',
            margin: '0.5rem 0',
          }}
        >
          <code>{codeLines.join('\n')}</code>
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
            fontFamily: 'var(--font-serif), Georgia, serif',
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
            fontFamily: 'var(--font-serif), Georgia, serif',
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
            fontFamily: 'var(--font-serif), Georgia, serif',
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

// --- Quick action definitions ---

const QUICK_ACTIONS = [
  { key: 'correct', label: 'Corrigir', title: 'Correção ortográfica e gramatical' },
  { key: 'feedback', label: 'Feedback', title: 'Feedback de estilo literário' },
  { key: 'consistency', label: 'Consistência', title: 'Verificar consistência com a bíblia' },
  { key: 'report', label: 'Relatório', title: 'Gerar relatório completo de escrita' },
] as const

const MODE_PROMPTS: Record<string, string> = {
  correct: 'Faça uma revisão ortográfica e gramatical completa do documento.',
  feedback: 'Dê feedback sobre o estilo literário deste texto, avaliando a voz da autora de Korú.',
  consistency: 'Verifique a consistência deste texto com as regras e a bíblia do mundo de Korú.',
  report: 'Gere um relatório completo de escrita sobre este documento.',
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

// --- Main component ---

export function ChatPanel({ documentPath, documentContent }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Streaming throttle refs
  const streamBufferRef = useRef('')
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // AbortController ref for fetch cancellation
  const abortControllerRef = useRef<AbortController | null>(null)

  // Memoised render per-message so it doesn't re-run on unrelated state changes
  const renderedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        rendered: msg.role === 'assistant' ? renderMarkdownSafe(msg.content) : null,
      })),
    [messages]
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

    // Add empty assistant placeholder
    const withAssistant: Message[] = [...messagesToSend, { role: 'assistant', content: '' }]
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

      const isTimeout =
        err instanceof Error && (err.name === 'AbortError' || err.message === 'timeout')
      const isNetwork = err instanceof TypeError && err.message.toLowerCase().includes('fetch')

      const errorContent = isTimeout
        ? 'A resposta demorou demais. Tente novamente.'
        : getErrorMessage(null, isNetwork)

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: errorContent,
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  // --- Send chat message (mode: null = normal chat) ---

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')

    // Persist user message immediately
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, null)
  }

  // --- Trigger a mode action (correct / feedback / consistency / report) ---

  async function triggerModeAction(mode: string) {
    if (isStreaming) return

    const userText = MODE_PROMPTS[mode]
    if (!userText) return

    const userMessage: Message = { role: 'user', content: userText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    if (documentPath) saveHistory(documentPath, newMessages)

    await sendToAPI(newMessages, mode)
  }

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

  return (
    <div
      className="w-[380px] shrink-0 flex flex-col min-h-0 rounded-lg border"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--card, var(--surface))',
        color: 'var(--foreground)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.15em]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Assistente Koru
        </span>
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
              Exportar
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

      {/* Context indicator */}
      {documentPath && (
        <div
          className="px-3 py-1.5 border-b"
          style={{
            borderColor: 'var(--border)',
            background: 'color-mix(in oklch, var(--foreground) 4%, transparent)',
          }}
        >
          <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>
            Contexto:{' '}
            <span className="font-mono">{documentPath}</span>
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center gap-3">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Assistente Korú
            </p>
            <p
              className="text-[11px] max-w-[220px] leading-relaxed"
              style={{ color: 'color-mix(in oklch, var(--muted-foreground) 60%, transparent)' }}
            >
              Use os botões acima para correção, feedback de estilo, verificação de consistência ou relatório completo.
            </p>
            <p
              className="text-[11px] max-w-[220px] leading-relaxed"
              style={{ color: 'color-mix(in oklch, var(--muted-foreground) 50%, transparent)' }}
            >
              Ou faça uma pergunta diretamente sobre o mundo de Korú.
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
                      }
                    : {
                        background: 'color-mix(in oklch, var(--foreground) 7%, transparent)',
                        color: 'var(--foreground)',
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
                          style={{ background: 'var(--accent)' }}
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
                    {/* Token estimate — only on complete messages */}
                    {!isThisStreaming && msg.content && (
                      <p
                        className="mt-1 font-sans"
                        style={{
                          fontSize: '10px',
                          color: 'var(--muted-foreground)',
                          opacity: 0.4,
                        }}
                      >
                        ~{Math.round(msg.content.length / 4)} tokens
                      </p>
                    )}
                  </>
                ) : (
                  msg.content
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
        {/* Quick actions — only when a document is loaded */}
        {documentPath && (
          <div
            className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.key}
                onClick={() => triggerModeAction(action.key)}
                disabled={isStreaming}
                title={action.title}
                className="rounded-full px-3 py-1 font-sans text-[11px] transition-all disabled:opacity-40"
                style={{
                  background: 'color-mix(in oklch, var(--foreground) 7%, transparent)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 14%, transparent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'color-mix(in oklch, var(--foreground) 7%, transparent)'
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="p-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre o mundo, personagens, física..."
              rows={1}
              className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in oklch, var(--foreground) 4%, transparent)',
                color: 'var(--foreground)',
                // @ts-expect-error custom property
                '--tw-ring-color': 'var(--accent)',
              }}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
              }}
            >
              {isStreaming ? (
                <span
                  className="inline-block w-3 h-3 rounded-full animate-pulse"
                  style={{ background: 'var(--background)' }}
                />
              ) : (
                'Enviar'
              )}
            </button>
          </div>
          <p
            className="mt-1 text-[10px] px-1"
            style={{ color: 'color-mix(in oklch, var(--muted-foreground) 50%, transparent)' }}
          >
            Shift+Enter para nova linha
          </p>
        </div>
      </div>
    </div>
  )
}
