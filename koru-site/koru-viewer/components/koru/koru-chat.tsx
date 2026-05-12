"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
}

type HistoryItem = {
  id: string
  first_question: string
  message_count: number
  updated_at: string
}

type View = "chat" | "history"

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Que parte das memórias de Korú gostaria de visitar?",
}

function formatHistoryDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function KoruChat() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("chat")
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Histórico
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pending, streaming])

  useEffect(() => {
    if (open && view === "chat") {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open, view])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  async function loadHistory() {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await fetch("/api/koru-chat/history", {
        credentials: "same-origin",
      })
      if (!res.ok) {
        setHistoryError("Não foi possível carregar o histórico.")
        setHistoryItems([])
        return
      }
      const data = (await res.json()) as { conversations?: HistoryItem[] }
      setHistoryItems(data.conversations ?? [])
    } catch {
      setHistoryError("Falha de rede.")
      setHistoryItems([])
    } finally {
      setHistoryLoading(false)
    }
  }

  function openHistory() {
    setView("history")
    loadHistory()
  }

  async function openConversation(id: string) {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await fetch(
        `/api/koru-chat/history/${encodeURIComponent(id)}`,
        { credentials: "same-origin" }
      )
      if (!res.ok) {
        setHistoryError("Não foi possível carregar essa conversa.")
        return
      }
      const data = (await res.json()) as { messages?: Message[] }
      const loaded = (data.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      })) as Message[]
      // Se a conversa não tem nada, mostra a mensagem inicial.
      setMessages(loaded.length > 0 ? loaded : [INITIAL_MESSAGE])
      setError(null)
      setView("chat")
    } catch {
      setHistoryError("Falha de rede.")
    } finally {
      setHistoryLoading(false)
    }
  }

  async function startNewConversation() {
    try {
      await fetch("/api/koru-chat/new-conversation", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch {
      // Mesmo se a chamada falhar, limpamos o state local.
    }
    setMessages([INITIAL_MESSAGE])
    setError(null)
    setView("chat")
  }

  async function send() {
    const text = input.trim()
    if (!text || pending || streaming) return

    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setPending(true)
    setError(null)

    let assistantIndex = -1
    let firstTokenReceived = false

    try {
      const res = await fetch("/api/koru-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.slice(next[0] === INITIAL_MESSAGE ? 1 : 0),
        }),
      })

      const contentType = res.headers.get("content-type") ?? ""
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as { reply?: string; error?: string }
        if (!res.ok || data.error) {
          setError(data.error ?? "Falha ao consultar o mundo.")
        } else if (data.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply! },
          ])
        }
        return
      }

      if (!res.ok || !res.body) {
        setError("Falha ao consultar o mundo.")
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      function handleEvent(line: string) {
        const trimmed = line.trim()
        if (!trimmed.startsWith("data:")) return
        const payload = trimmed.slice(5).trim()
        if (!payload) return
        if (payload === "[DONE]") return
        let evt: { delta?: string; error?: string }
        try {
          evt = JSON.parse(payload)
        } catch {
          return
        }
        if (evt.error) {
          setError(evt.error)
          return
        }
        if (typeof evt.delta === "string" && evt.delta.length > 0) {
          if (!firstTokenReceived) {
            firstTokenReceived = true
            setPending(false)
            setStreaming(true)
            setMessages((prev) => {
              assistantIndex = prev.length
              return [...prev, { role: "assistant", content: evt.delta! }]
            })
          } else {
            setMessages((prev) => {
              if (assistantIndex < 0 || assistantIndex >= prev.length) return prev
              const copy = prev.slice()
              copy[assistantIndex] = {
                ...copy[assistantIndex],
                content: copy[assistantIndex].content + evt.delta,
              }
              return copy
            })
          }
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let sep
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, sep)
          buffer = buffer.slice(sep + 2)
          for (const line of chunk.split("\n")) handleEvent(line)
        }
      }
      if (buffer.trim()) {
        for (const line of buffer.split("\n")) handleEvent(line)
      }

      if (!firstTokenReceived) {
        setError("O modelo não retornou conteúdo. Tente novamente.")
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha de rede ao consultar o mundo."
      )
    } finally {
      setPending(false)
      setStreaming(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const busy = pending || streaming

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar conversa com Korú" : "Conversar com Korú"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "transition-all duration-300 ease-out hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "koru-chat-button"
        )}
      >
        <KoruGlyph />
      </button>

      {/* Painel de chat */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Conversa com o mundo de Korú"
          className={cn(
            "fixed bottom-24 right-6 z-50 flex flex-col overflow-hidden rounded-2xl",
            "w-[min(380px,calc(100vw-3rem))] h-[60vh] max-h-[640px]",
            "border border-[var(--border)] bg-[var(--surface)]",
            "shadow-[0_20px_60px_color-mix(in_oklch,black_60%,transparent)]",
            "animate-[koru-chat-in_220ms_var(--ease-smooth)_forwards]"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between border-b border-[var(--border)]",
              "px-3 py-3 gap-2"
            )}
          >
            {view === "chat" ? (
              <button
                type="button"
                onClick={openHistory}
                aria-label="Ver histórico de conversas"
                title="Histórico"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md",
                  "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  "transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                )}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15 14" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView("chat")}
                aria-label="Voltar para o chat"
                title="Voltar"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md",
                  "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  "transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                )}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <div className="flex min-w-0 flex-1 flex-col items-center">
              <span
                className="font-serif text-lg leading-none text-[var(--foreground)]"
                style={{ letterSpacing: "0.01em" }}
              >
                {view === "chat" ? "Korú" : "Histórico"}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] font-sans">
                {view === "chat" ? "o mundo responde" : "suas conversas"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {view === "chat" && (
                <button
                  type="button"
                  onClick={startNewConversation}
                  aria-label="Nova conversa"
                  title="Nova conversa"
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-md",
                    "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    "transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                  )}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md",
                  "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  "transition-colors hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
                )}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {view === "chat" ? (
            <>
              {/* Mensagens */}
              <div
                ref={scrollRef}
                className={cn(
                  "flex-1 overflow-y-auto px-4 py-4 space-y-3",
                  "scrollbar-thin"
                )}
              >
                {messages.map((m, i) => {
                  const isLastAssistant =
                    streaming &&
                    i === messages.length - 1 &&
                    m.role === "assistant"
                  return (
                    <MessageBubble
                      key={i}
                      message={m}
                      showCursor={isLastAssistant}
                    />
                  )
                })}
                {pending && <PendingBubble />}
                {error && (
                  <div
                    className="rounded-lg border border-[color-mix(in_oklch,var(--destructive)_50%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] px-3 py-2 text-xs font-sans text-[var(--foreground)]"
                    role="alert"
                  >
                    {error}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[var(--border)] p-3 space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border border-[var(--border)]",
                    "bg-[var(--background)] pl-3 pr-2 py-1",
                    "focus-within:border-[var(--accent)] transition-colors"
                  )}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    disabled={busy}
                    placeholder="Pergunte ao mundo..."
                    aria-label="Sua pergunta"
                    className={cn(
                      "flex-1 bg-transparent text-sm font-sans text-[var(--foreground)]",
                      "placeholder:text-[var(--muted-foreground)]",
                      "outline-none disabled:opacity-50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={busy || !input.trim()}
                    aria-label="Enviar pergunta"
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                      "bg-[var(--accent)] text-[var(--accent-foreground)]",
                      "transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    )}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12l14-7-4 14-3-6-7-1z" />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-[10px] leading-snug font-sans text-[var(--muted-foreground)] opacity-80">
                  Suas perguntas aparecem em Perguntas ao Mundo, anônimas.
                </p>
              </div>
            </>
          ) : (
            /* View de histórico */
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin">
              {historyLoading && (
                <div className="flex justify-center py-6">
                  <div
                    className="h-5 w-5 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: "var(--border)",
                      borderTopColor: "var(--accent)",
                    }}
                    aria-label="Carregando"
                  />
                </div>
              )}

              {!historyLoading && historyError && (
                <div
                  className="rounded-lg border border-[color-mix(in_oklch,var(--destructive)_50%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_12%,transparent)] px-3 py-2 text-xs font-sans text-[var(--foreground)]"
                  role="alert"
                >
                  {historyError}
                </div>
              )}

              {!historyLoading && !historyError && historyItems.length === 0 && (
                <div className="px-2 py-6 text-center">
                  <p className="font-sans text-xs text-[var(--muted-foreground)]">
                    Nenhuma conversa anterior.
                  </p>
                </div>
              )}

              {!historyLoading &&
                historyItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openConversation(item.id)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 transition-colors",
                      "border border-[var(--border)]",
                      "hover:bg-[color-mix(in_oklch,var(--foreground)_5%,transparent)]"
                    )}
                  >
                    <p className="font-sans text-[13px] leading-snug text-[var(--foreground)] line-clamp-2">
                      {item.first_question}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-sans text-[var(--muted-foreground)]">
                      <span>{formatHistoryDate(item.updated_at)}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {item.message_count}{" "}
                        {item.message_count === 1 ? "mensagem" : "mensagens"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Estilos locais */}
      <style jsx global>{`
        .koru-chat-button {
          background: color-mix(in oklch, var(--background) 70%, var(--accent) 30%);
          border: 1px solid color-mix(in oklch, var(--accent) 30%, transparent);
          color: var(--foreground);
          box-shadow:
            0 0 18px color-mix(in oklch, var(--accent) 22%, transparent),
            0 6px 18px color-mix(in oklch, black 30%, transparent);
        }
        .koru-chat-button:hover {
          box-shadow:
            0 0 26px color-mix(in oklch, var(--accent) 32%, transparent),
            0 8px 22px color-mix(in oklch, black 35%, transparent);
          border-color: color-mix(in oklch, var(--accent) 45%, transparent);
        }
        @keyframes koru-glyph-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .koru-glyph-outer {
          transform-origin: 12px 12px;
          animation: koru-glyph-pulse 3.6s ease-in-out infinite;
        }
        @keyframes koru-chat-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes koru-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        .koru-cursor {
          display: inline-block;
          width: 2px;
          height: 0.95em;
          margin-left: 2px;
          vertical-align: -0.1em;
          background: var(--foreground);
          animation: koru-cursor-blink 0.9s ease-in-out infinite;
          border-radius: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .koru-glyph-outer { animation: none; }
          .koru-cursor { animation: none; opacity: 0.7; }
        }
      `}</style>
    </>
  )
}

/**
 * Glifo de luz inspirado no Akwu: três anéis concêntricos sugerindo as
 * três camadas (Lar Central, Ali Central, Ariku Externo) vistas de cima,
 * com núcleo de luz no centro. Pulso muito sutil só no anel externo.
 */
function KoruGlyph() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle
        className="koru-glyph-outer"
        cx="12"
        cy="12"
        r="9"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <circle
        cx="12"
        cy="12"
        r="5.6"
        strokeWidth="1.3"
        opacity="0.9"
      />
      <circle
        cx="12"
        cy="12"
        r="2.6"
        strokeWidth="1.4"
        opacity="1"
      />
      <circle
        cx="12"
        cy="12"
        r="0.9"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function MessageBubble({
  message,
  showCursor = false,
}: {
  message: Message
  showCursor?: boolean
}) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed font-sans whitespace-pre-wrap",
          isUser
            ? "bg-[var(--accent)] text-[var(--accent-foreground)] rounded-br-md"
            : "bg-[color-mix(in_oklch,var(--foreground)_6%,transparent)] text-[var(--foreground)] rounded-bl-md"
        )}
      >
        {message.content}
        {showCursor && <span className="koru-cursor" aria-hidden="true" />}
      </div>
    </div>
  )
}

function PendingBubble() {
  return (
    <div className="flex justify-start">
      <div
        className={cn(
          "rounded-2xl rounded-bl-md px-3.5 py-2.5",
          "bg-[color-mix(in_oklch,var(--foreground)_6%,transparent)]"
        )}
      >
        <div className="flex items-center gap-1.5">
          <Dot delay="0ms" />
          <Dot delay="160ms" />
          <Dot delay="320ms" />
        </div>
        <style jsx>{`
          @keyframes koru-dot {
            0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
            40% { opacity: 1; transform: translateY(-2px); }
          }
        `}</style>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)]"
      style={{
        animation: "koru-dot 1.2s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  )
}
