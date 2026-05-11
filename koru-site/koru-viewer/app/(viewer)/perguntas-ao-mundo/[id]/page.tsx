import Link from "next/link"
import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * /perguntas-ao-mundo/[id] — leitura PÚBLICA de uma conversa específica.
 *
 * - 404 se a conversa não existe ou está escondida (is_hidden = true).
 * - Anonimato total: não mostra session_id, user_agent, nada identificável.
 *   Apenas "Visitante anônimo" + data.
 * - Formato timeline: pergunta à direita, resposta à esquerda.
 */

export const dynamic = "force-dynamic"
export const revalidate = 0

interface SavedMessage {
  role: "user" | "assistant"
  content: string
  ts: string
}

interface Row {
  id: string
  messages: SavedMessage[] | null
  updated_at: string
  is_hidden: boolean | null
}

function formatLongDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const datePart = d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const timePart = d
    .toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(":", "h")
  return `${datePart}, ${timePart}`
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PerguntaDetalhe({ params }: PageProps) {
  const { id } = await params

  let row: Row | null = null
  let loadError = false

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("koru_chat_conversations")
      .select("id, messages, updated_at, is_hidden")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      loadError = true
    } else {
      row = (data as Row | null) ?? null
    }
  } catch {
    loadError = true
  }

  // Conversa inexistente ou escondida pela admin → 404 (não vaza nada).
  if (!loadError && (!row || row.is_hidden === true)) {
    notFound()
  }

  const messages = row?.messages ?? []

  return (
    <div
      className="min-h-[100dvh] px-6 md:px-10 py-8 md:py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Voltar */}
        <Link
          href="/perguntas-ao-mundo"
          className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
        >
          <svg
            width="14"
            height="14"
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
          Voltar pra todas
        </Link>

        {/* Header */}
        <header className="mb-8">
          <p
            className="text-xs tracking-[0.2em] uppercase font-sans mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            uma pergunta ao mundo
          </p>
          <h1
            className="font-serif text-2xl md:text-3xl leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            Visitante anônimo
          </h1>
          {row?.updated_at && (
            <p
              className="mt-2 font-sans text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              {formatLongDate(row.updated_at)}
            </p>
          )}
        </header>

        {loadError && (
          <div
            role="alert"
            className="rounded-xl px-4 py-3 font-sans text-sm mb-6"
            style={{
              background:
                "color-mix(in oklch, var(--destructive) 12%, transparent)",
              border:
                "1px solid color-mix(in oklch, var(--destructive) 40%, transparent)",
              color: "var(--foreground)",
            }}
          >
            Não foi possível carregar a conversa agora.
          </div>
        )}

        {/* Timeline */}
        {!loadError && messages.length === 0 && (
          <p
            className="font-sans text-sm py-12 text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            (conversa sem mensagens)
          </p>
        )}

        {!loadError && messages.length > 0 && (
          <ol className="flex flex-col gap-4 list-none">
            {messages.map((m, i) => {
              const isUser = m.role === "user"
              return (
                <li
                  key={i}
                  className={isUser ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className="max-w-[85%] rounded-2xl px-4 py-3 font-sans text-[15px] leading-relaxed whitespace-pre-wrap"
                    style={{
                      background: isUser
                        ? "var(--accent)"
                        : "color-mix(in oklch, var(--foreground) 6%, transparent)",
                      color: isUser
                        ? "var(--accent-foreground)"
                        : "var(--foreground)",
                      borderBottomRightRadius: isUser ? "0.375rem" : undefined,
                      borderBottomLeftRadius: !isUser ? "0.375rem" : undefined,
                    }}
                  >
                    <div
                      className="mb-1.5 font-sans text-[10px] uppercase tracking-[0.18em] opacity-70"
                      style={{ color: "inherit" }}
                    >
                      {isUser ? "visitante" : "mundo"}
                    </div>
                    {m.content}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {/* Rodapé com nota sobre continuar */}
        {!loadError && messages.length > 0 && (
          <p
            className="mt-12 pt-6 text-center font-sans text-xs"
            style={{
              color: "var(--muted-foreground)",
              borderTop: "1px solid var(--border)",
            }}
          >
            Quer perguntar ao mundo também? Abra a conversa no canto da tela.
          </p>
        )}
      </div>
    </div>
  )
}
