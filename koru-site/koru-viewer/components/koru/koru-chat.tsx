"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "O Akwu se estende em três camadas. Pergunte ao mundo.",
}

export function KoruChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para baixo a cada nova mensagem
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pending])

  // Foco no input ao abrir
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Fechar com Esc
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  async function send() {
    const text = input.trim()
    if (!text || pending) return

    const next: Message[] = [...messages, { role: "user", content: text }]
    setMessages(next)
    setInput("")
    setPending(true)
    setError(null)

    try {
      const res = await fetch("/api/koru-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Não enviar a mensagem inicial padrão (é só visual)
          messages: next.slice(next[0] === INITIAL_MESSAGE ? 1 : 0),
        }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }
      if (!res.ok || data.error) {
        setError(data.error ?? "Falha ao consultar o mundo.")
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply! },
        ])
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha de rede ao consultar o mundo."
      )
    } finally {
      setPending(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

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
          "transition-transform duration-300 ease-out hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "koru-chat-button"
        )}
        style={{
          background:
            "radial-gradient(circle at 30% 30%, var(--accent), color-mix(in oklch, var(--accent) 60%, var(--background)))",
          boxShadow:
            "0 0 24px color-mix(in oklch, var(--accent) 40%, transparent), 0 0 60px color-mix(in oklch, var(--gold) 14%, transparent), 0 6px 22px color-mix(in oklch, black 35%, transparent)",
        }}
      >
        {/* Sparkles inline SVG (mesmo padrão dos outros componentes do projeto) */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--background)] drop-shadow-[0_0_6px_color-mix(in_oklch,white_50%,transparent)]"
          aria-hidden="true"
        >
          <path d="M12 3l1.7 4.6L18 9.3l-4.3 1.7L12 15l-1.7-4.6L6 9.3l4.6-1.7z" />
          <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
          <path d="M5 4l.6 1.6L7 6l-1.6.6L5 8l-.6-1.6L3 6l1.6-.6z" />
        </svg>
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
              "px-4 py-3"
            )}
          >
            <div className="flex flex-col">
              <span
                className="font-serif text-lg leading-none text-[var(--foreground)]"
                style={{ letterSpacing: "0.01em" }}
              >
                Korú
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)] font-sans">
                o mundo responde
              </span>
            </div>
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

          {/* Mensagens */}
          <div
            ref={scrollRef}
            className={cn(
              "flex-1 overflow-y-auto px-4 py-4 space-y-3",
              "scrollbar-thin"
            )}
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
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
          <div className="border-t border-[var(--border)] p-3">
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
                disabled={pending}
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
                disabled={pending || !input.trim()}
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
          </div>
        </div>
      )}

      {/* Estilos locais (pulso suave + entrada do painel). Tailwind 4: keyframes
          via @keyframes em escopo global no globals.css seria mais limpo, mas
          mantemos local para não tocar no CSS global. */}
      <style jsx global>{`
        @keyframes koru-chat-pulse {
          0%, 100% {
            box-shadow:
              0 0 24px color-mix(in oklch, var(--accent) 40%, transparent),
              0 0 60px color-mix(in oklch, var(--gold) 14%, transparent),
              0 6px 22px color-mix(in oklch, black 35%, transparent);
          }
          50% {
            box-shadow:
              0 0 32px color-mix(in oklch, var(--accent) 55%, transparent),
              0 0 80px color-mix(in oklch, var(--gold) 22%, transparent),
              0 8px 28px color-mix(in oklch, black 40%, transparent);
          }
        }
        .koru-chat-button {
          animation: koru-chat-pulse 3.6s ease-in-out infinite;
        }
        @keyframes koru-chat-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .koru-chat-button {
            animation: none;
          }
        }
      `}</style>
    </>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed font-sans whitespace-pre-wrap",
          isUser
            ? "bg-[var(--accent)] text-[var(--accent-foreground)] rounded-br-md"
            : "bg-[color-mix(in_oklch,var(--foreground)_6%,transparent)] text-[var(--foreground)] rounded-bl-md"
        )}
      >
        {message.content}
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
