"use client"
import { useState, useRef, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_QUESTIONS = [
  "O que é o Bomi Veh?",
  "Como funciona a luz no Akwu?",
  "Quem é Temiku?",
  "O que acontece quando um Azuri se dissolve?",
]

export default function ConversarPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    const userMsg: Message = { role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
      const res = await fetch("/api/koru-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode: "universe" }),
      })

      if (!res.body) throw new Error("no body")
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ""
      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: aiText }
          return updated
        })
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "O Akwu não respondeu desta vez. Tente novamente." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-40px)] w-full max-w-2xl flex-col px-4">
      {/* Cabeçalho */}
      <header className="shrink-0 pt-8 pb-6">
        <h1 className="font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
          O Akwu responde
        </h1>
        <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
          Pergunte ao mundo. Cada resposta vem de dentro — da física da memória,
          dos ciclos de luz, das criaturas que habitam o Akwu.
        </p>
      </header>

      {/* Mensagens */}
      <div
        className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4"
        role="log"
        aria-label="Mensagens da conversa"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => { setInput(q); inputRef.current?.focus() }}
                aria-label={`Usar pergunta de exemplo: ${q}`}
                className={cn(
                  "rounded-full border border-border bg-transparent px-4 py-2",
                  "font-sans text-[13px] leading-snug text-muted-foreground",
                  "transition-colors hover:bg-muted hover:text-foreground",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user"
          const isPendingBubble =
            loading && i === messages.length - 1 && !isUser && msg.content === ""
          return (
            <div key={i} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 font-sans text-sm leading-relaxed",
                  isUser
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted text-foreground"
                )}
              >
                {isPendingBubble ? (
                  <span
                    className="inline-flex items-center gap-1.5 py-1"
                    role="status"
                    aria-label="O Akwu está respondendo"
                  >
                    <span className="koru-conversar-dot inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span className="koru-conversar-dot inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "160ms" }} />
                    <span className="koru-conversar-dot inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" style={{ animationDelay: "320ms" }} />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pb-6 pt-1">
        <div
          className={cn(
            "flex items-end gap-2 rounded-full bg-muted py-1.5 pl-5 pr-1.5",
            "transition-shadow focus-within:ring-2 focus-within:ring-ring"
          )}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Pergunte ao mundo..."
            aria-label="Sua pergunta ao mundo de Korú"
            rows={1}
            className={cn(
              "max-h-32 flex-1 resize-none self-center bg-transparent py-1.5",
              "font-sans text-sm leading-snug text-foreground",
              "placeholder:text-muted-foreground outline-none"
            )}
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || loading}
            aria-label="Enviar pergunta"
            className={cn(
              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              "bg-primary text-primary-foreground",
              "transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {loading ? (
              <span
                className="block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                aria-hidden="true"
              />
            ) : (
              <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center font-sans text-[11px] leading-snug text-muted-foreground">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>

      {/* Animação dos pontos de espera */}
      <style>{`
        @keyframes koru-conversar-dot {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        .koru-conversar-dot {
          animation: koru-conversar-dot 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .koru-conversar-dot { animation: none; opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
