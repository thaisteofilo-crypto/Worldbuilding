import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"

interface SavedMessage {
  role: "user" | "assistant"
  content: string
  ts: string
}

interface ConversationRow {
  id: string
  session_id: string
  messages: SavedMessage[] | null
  created_at: string
  updated_at: string
  user_agent: string | null
  message_count: number | null
}

const PAGE_SIZE = 50

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n).trimEnd() + "…"
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  return n.toString()
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ConversasPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = createAdminClient()

  let conversations: ConversationRow[] = []
  let total = 0
  let totalMessages = 0
  let loadError: string | null = null

  try {
    const { data, error, count } = await supabase
      .from("koru_chat_conversations")
      .select(
        "id, session_id, messages, created_at, updated_at, user_agent, message_count",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false })
      .range(from, to)

    if (error) {
      loadError = error.message
    } else {
      conversations = (data as ConversationRow[]) ?? []
      total = count ?? 0
    }

    // Total de mensagens (uma query agregadora rápida).
    const { data: agg } = await supabase
      .from("koru_chat_conversations")
      .select("message_count")
    if (agg) {
      totalMessages = (agg as { message_count: number | null }[]).reduce(
        (sum, r) => sum + (r.message_count ?? 0),
        0
      )
    }
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Erro inesperado."
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-serif text-2xl sm:text-3xl"
          style={{ color: "var(--foreground)" }}
        >
          Conversas com o mundo
        </h1>
        <p
          className="mt-1 font-sans text-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          {total > 0
            ? `${formatNumber(total)} ${total === 1 ? "conversa" : "conversas"}, ${formatNumber(
                totalMessages
              )} mensagens.`
            : "Nenhuma conversa registrada ainda."}
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border px-3 py-2 font-sans text-sm"
          style={{
            background:
              "color-mix(in oklch, var(--destructive) 12%, transparent)",
            borderColor:
              "color-mix(in oklch, var(--destructive) 40%, transparent)",
            color: "var(--foreground)",
          }}
        >
          Erro ao carregar conversas: {loadError}
        </div>
      )}

      {/* Lista */}
      {conversations.length === 0 && !loadError ? (
        <div
          className="rounded-xl p-8 text-center glass-card"
          style={{ color: "var(--muted-foreground)" }}
        >
          <p className="font-sans text-sm">
            O Bomi Veh ainda não recebeu perguntas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((c) => (
            <ConversationItem key={c.id} conv={c} />
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p
            className="font-sans text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/admin/conversas?page=${page - 1}`}
                className="rounded-full px-3 py-1.5 font-sans text-xs transition-opacity hover:opacity-80"
                style={{
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/conversas?page=${page + 1}`}
                className="rounded-full px-3 py-1.5 font-sans text-xs transition-opacity hover:opacity-80"
                style={{
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                }}
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ConversationItem({ conv }: { conv: ConversationRow }) {
  const messages = conv.messages ?? []
  const firstUser = messages.find((m) => m.role === "user")
  const preview = firstUser
    ? truncate(firstUser.content, 80)
    : "(sem mensagens)"
  const count = conv.message_count ?? messages.length
  const shortSession = conv.session_id.slice(0, 8)

  return (
    <details
      className="group rounded-xl glass-card overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      <summary
        className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-admin-hover list-none"
        style={{ color: "var(--foreground)" }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform group-open:rotate-90"
          style={{ color: "var(--muted-foreground)" }}
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="min-w-0 flex-1">
          <p
            className="font-sans text-sm truncate"
            style={{ color: "var(--foreground)" }}
          >
            {preview}
          </p>
          <div
            className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-sans text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span>{formatDate(conv.updated_at)}</span>
            <span aria-hidden="true">·</span>
            <span>
              {count} {count === 1 ? "mensagem" : "mensagens"}
            </span>
            <span aria-hidden="true">·</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              {shortSession}
            </span>
          </div>
        </div>
      </summary>

      {/* Timeline */}
      <div
        className="border-t px-4 py-4 space-y-3"
        style={{ borderColor: "var(--border)" }}
      >
        {messages.length === 0 ? (
          <p
            className="font-sans text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            (sem mensagens)
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              <div
                className="max-w-[85%] rounded-2xl px-3.5 py-2 font-sans text-[13px] leading-relaxed whitespace-pre-wrap"
                style={{
                  background:
                    m.role === "user"
                      ? "var(--accent)"
                      : "color-mix(in oklch, var(--foreground) 6%, transparent)",
                  color:
                    m.role === "user"
                      ? "var(--accent-foreground)"
                      : "var(--foreground)",
                  borderBottomRightRadius:
                    m.role === "user" ? "0.375rem" : undefined,
                  borderBottomLeftRadius:
                    m.role === "assistant" ? "0.375rem" : undefined,
                }}
              >
                <div
                  className="mb-1 font-sans text-[9px] uppercase tracking-[0.15em] opacity-70"
                  style={{ color: "inherit" }}
                >
                  {m.role === "user" ? "visitante" : "mundo"}
                  {m.ts ? ` · ${formatTime(m.ts)}` : ""}
                </div>
                {m.content}
              </div>
            </div>
          ))
        )}
        {conv.user_agent && (
          <p
            className="pt-2 font-sans text-[10px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            <span className="uppercase tracking-[0.15em]">user-agent:</span>{" "}
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              {truncate(conv.user_agent, 120)}
            </span>
          </p>
        )}
      </div>
    </details>
  )
}
