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

// --- Markdown renderer ---

function renderMarkdown(text: string): string {
  return text
    // Code blocks first (before inline code)
    .replace(
      /```[\w]*\n?([\s\S]*?)```/g,
      '<pre style="background:color-mix(in oklch,var(--foreground) 6%,transparent);padding:0.75rem;border-radius:0.5rem;font-size:0.75rem;overflow-x:auto;margin:0.5rem 0"><code>$1</code></pre>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code style="background:color-mix(in oklch,var(--foreground) 8%,transparent);padding:0.1em 0.35em;border-radius:0.25rem;font-size:0.85em">$1</code>'
    )
    // Headers (### before ##)
    .replace(
      /^### (.+)$/gm,
      '<p style="font-family:var(--font-serif),Georgia,serif;font-size:0.95rem;font-weight:600;margin:0.75rem 0 0.25rem">$1</p>'
    )
    .replace(
      /^## (.+)$/gm,
      '<p style="font-family:var(--font-serif),Georgia,serif;font-size:1.05rem;font-weight:600;margin:1rem 0 0.25rem">$1</p>'
    )
    // Bold + italic (bold-italic first)
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(
      /^- (.+)$/gm,
      '<li style="margin-left:1rem;list-style:disc;margin-bottom:0.15rem">$1</li>'
    )
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:0.5rem 0">$&</ul>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="margin:0.4rem 0">')
    .replace(/^/, '<p style="margin:0">')
    .replace(/$/, '</p>')
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

  // Memoised render per-message so it doesn't re-run on unrelated state changes
  const renderedMessages = useMemo(
    () =>
      messages.map((msg) => ({
        ...msg,
        html: msg.role === 'assistant' ? renderMarkdown(msg.content) : null,
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    }
  }, [])

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
      })

      if (!res.ok) {
        const data = await res.json()
        if (streamTimerRef.current) clearInterval(streamTimerRef.current)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Erro: ${data.error || 'Falha na requisicao.'}`,
          }
          return updated
        })
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
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
    } catch {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current)
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Erro de conexao. Verifique se o servidor esta rodando.',
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
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.html ?? '',
                        }}
                      />
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
