import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * /perguntas-ao-mundo — listagem PÚBLICA das conversas anônimas
 * que visitantes tiveram com o chatbot do Korú.
 *
 * Apenas conversas não escondidas pela admin (is_hidden = false).
 * Nada identificável: nem session_id, nem user_agent. Só "Visitante anônimo".
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
  message_count: number | null
}

const PAGE_SIZE = 30

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

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n).trimEnd() + "…"
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function PerguntasAoMundoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp?.page ?? "1", 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let rows: Row[] = []
  let total = 0
  let loadError = false

  try {
    const supabase = createAdminClient()
    const { data, count, error } = await supabase
      .from("koru_chat_conversations")
      .select("id, messages, updated_at, message_count", { count: "exact" })
      .eq("is_hidden", false)
      .order("updated_at", { ascending: false })
      .range(from, to)

    if (error) {
      loadError = true
    } else {
      rows = (data as Row[]) ?? []
      total = count ?? 0
    }
  } catch {
    loadError = true
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div
      className="min-h-[100dvh] px-6 md:px-10 py-8 md:py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <header className="mb-10">
          <p
            className="text-xs tracking-[0.2em] uppercase font-sans mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            o mundo escuta
          </p>
          <h1
            className="font-serif text-4xl md:text-5xl leading-tight"
            style={{ color: "var(--foreground)" }}
          >
            Perguntas ao mundo
          </h1>
          <p
            className="mt-3 font-sans text-sm md:text-base max-w-xl"
            style={{ color: "var(--muted-foreground)" }}
          >
            O que visitantes vêm perguntando ao Korú. Anônimo.
          </p>
          {!loadError && total > 0 && (
            <p
              className="mt-4 font-sans text-xs uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {total} {total === 1 ? "pergunta ao mundo" : "perguntas ao mundo"}
            </p>
          )}
        </header>

        {/* Erro de carregamento */}
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
            Não foi possível carregar as perguntas agora. Tente novamente em
            instantes.
          </div>
        )}

        {/* Vazio */}
        {!loadError && rows.length === 0 && (
          <div className="py-20 text-center">
            <p
              className="font-serif text-lg"
              style={{ color: "var(--muted-foreground)" }}
            >
              O Bomi Veh ainda não recebeu perguntas.
            </p>
          </div>
        )}

        {/* Lista */}
        {!loadError && rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => {
              const msgs = r.messages ?? []
              const firstUser = msgs.find((m) => m.role === "user")
              const preview = firstUser
                ? truncate(firstUser.content, 140)
                : "(sem perguntas)"
              const count = r.message_count ?? msgs.length
              return (
                <li key={r.id}>
                  <Link
                    href={`/perguntas-ao-mundo/${r.id}`}
                    className="block rounded-xl p-5 md:p-6 transition-colors"
                    style={{
                      background:
                        "color-mix(in oklch, var(--foreground) 5%, transparent)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <p
                      className="font-serif text-xl md:text-2xl leading-snug"
                      style={{ color: "var(--foreground)" }}
                    >
                      {preview}
                    </p>
                    <div
                      className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      <span>{formatLongDate(r.updated_at)}</span>
                      <span aria-hidden="true">·</span>
                      <span>Visitante anônimo</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {count} {count === 1 ? "mensagem" : "mensagens"}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {/* Paginação */}
        {!loadError && totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-between"
            aria-label="Paginação"
          >
            {page > 1 ? (
              <Link
                href={`/perguntas-ao-mundo?page=${page - 1}`}
                className="rounded-full px-4 py-2 font-sans text-sm transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--foreground)",
                }}
              >
                ← Anterior
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}

            <p
              className="font-sans text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              Página {page} de {totalPages}
            </p>

            {page < totalPages ? (
              <Link
                href={`/perguntas-ao-mundo?page=${page + 1}`}
                className="rounded-full px-4 py-2 font-sans text-sm transition-opacity hover:opacity-80"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--foreground)",
                }}
              >
                Próxima →
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        )}
      </div>
    </div>
  )
}
