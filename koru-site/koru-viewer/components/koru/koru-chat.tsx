"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  ArrowUp,
  ChevronLeft,
  History,
  MessageCircleQuestion,
  SquarePen,
  X,
} from "lucide-react"
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

// Rotas onde o widget não deve flutuar: admin tem seu próprio chat,
// /conversar já é o chat em página cheia, /entrar é o portão de login.
const HIDDEN_PREFIXES = ["/admin", "/conversar", "/entrar"]

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

  if (pathname && HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null
  }

  const ghostButton = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-full",
    // Área de toque ≥40px sem alterar o visual (pseudo-elemento expandido)
    "relative before:absolute before:-inset-1 before:content-['']",
    "text-muted-foreground hover:text-foreground hover:bg-muted",
    "transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  )

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar conversa com Korú" : "Conversar com Korú"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground shadow-card",
          "transition-transform duration-200 ease-out hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <MessageCircleQuestion size={20} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {/* Painel de chat */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Conversa com o mundo de Korú"
          className={cn(
            "fixed bottom-[5.5rem] right-6 z-50 flex flex-col overflow-hidden rounded-2xl",
            "w-[min(380px,calc(100vw-3rem))] h-[60vh] max-h-[640px]",
            "bg-card text-card-foreground",
            "shadow-[0_16px_48px_-12px_rgba(9,14,23,0.35)]",
            "animate-[koru-chat-in_220ms_ease-out_forwards]"
          )}
        >
          {/* Header — sem divisória */}
          <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-1">
            <span className="font-serif text-lg leading-none">
              {view === "chat" ? "Korú" : "Histórico"}
            </span>
            <div className="flex items-center gap-0.5">
              {view === "chat" ? (
                <>
                  <button
                    type="button"
                    onClick={openHistory}
                    aria-label="Ver histórico de conversas"
                    title="Histórico"
                    className={ghostButton}
                  >
                    <History size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={startNewConversation}
                    aria-label="Nova conversa"
                    title="Nova conversa"
                    className={ghostButton}
                  >
                    <SquarePen size={15} strokeWidth={1.7} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  aria-label="Voltar para o chat"
                  title="Voltar"
                  className={ghostButton}
                >
                  <ChevronLeft size={16} strokeWidth={1.7} aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className={ghostButton}
              >
                <X size={16} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>
          </div>

          {view === "chat" ? (
            <>
              {/* Mensagens */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin"
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
                  <p
                    className="px-1 text-[13px] leading-snug font-sans text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* Input — sem divisória */}
              <div className="px-3 pb-3 pt-1">
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full bg-muted pl-4 pr-1.5 py-1",
                    "transition-shadow focus-within:ring-2 focus-within:ring-ring"
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
                      "flex-1 bg-transparent text-sm font-sans text-foreground",
                      "placeholder:text-muted-foreground",
                      "outline-none disabled:opacity-50"
                    )}
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={busy || !input.trim()}
                    aria-label="Enviar pergunta"
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      "relative before:absolute before:-inset-1 before:content-['']",
                      "bg-primary text-primary-foreground",
                      "transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] leading-snug font-sans text-muted-foreground/80">
                  Suas perguntas aparecem em Perguntas ao Mundo, anônimas.
                </p>
              </div>
            </>
          ) : (
            /* View de histórico */
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-thin">
              {historyLoading && (
                <div className="flex justify-center py-6">
                  <div
                    className="h-5 w-5 rounded-full border-2 border-muted border-t-primary animate-spin"
                    aria-label="Carregando"
                  />
                </div>
              )}

              {!historyLoading && historyError && (
                <p
                  className="px-3 py-2 text-[13px] leading-snug font-sans text-destructive"
                  role="alert"
                >
                  {historyError}
                </p>
              )}

              {!historyLoading && !historyError && historyItems.length === 0 && (
                <div className="px-2 py-6 text-center">
                  <p className="font-sans text-xs text-muted-foreground">
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
                      "w-full text-left rounded-xl px-3 py-2.5 transition-colors hover:bg-muted",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <p className="font-sans text-[13px] leading-snug text-foreground line-clamp-2">
                      {item.first_question}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-sans text-muted-foreground">
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
          background: currentColor;
          animation: koru-cursor-blink 0.9s ease-in-out infinite;
          border-radius: 1px;
        }
        @media (prefers-reduced-motion: reduce) {
          .koru-cursor { animation: none; opacity: 0.7; }
        }
      `}</style>
    </>
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
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
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
      <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 bg-muted">
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
      className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
      style={{
        animation: "koru-dot 1.2s ease-in-out infinite",
        animationDelay: delay,
      }}
    />
  )
}
