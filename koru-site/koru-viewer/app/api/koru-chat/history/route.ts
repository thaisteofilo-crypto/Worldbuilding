import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/koru-chat/history
 *
 * Retorna a lista de conversas do visitante atual (filtrada pelo cookie
 * `koru-chat-session`). Esconde conversas marcadas como hidden pela admin.
 *
 * Resposta:
 *   { conversations: [{ id, first_question, message_count, updated_at }] }
 *
 * Privacidade: o endpoint só devolve conversas cujo session_id bate
 * exatamente com o cookie do visitante. Nada de cross-session.
 */

const SESSION_COOKIE = "koru-chat-session"

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

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(";")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n).trimEnd() + "…"
}

export async function GET(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"))
  const sessionId = cookies[SESSION_COOKIE]

  if (!sessionId) {
    return new Response(JSON.stringify({ conversations: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("koru_chat_conversations")
      .select("id, messages, updated_at, message_count")
      .eq("session_id", sessionId)
      .eq("is_hidden", false)
      .order("updated_at", { ascending: false })
      .limit(50)

    if (error) {
      // Não quebra a UI; devolve lista vazia.
      console.error("history list error", error)
      return new Response(JSON.stringify({ conversations: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const rows = (data as Row[]) ?? []
    const conversations = rows.map((r) => {
      const msgs = r.messages ?? []
      const firstUser = msgs.find((m) => m.role === "user")
      return {
        id: r.id,
        first_question: firstUser
          ? truncate(firstUser.content, 100)
          : "(sem perguntas)",
        message_count: r.message_count ?? msgs.length,
        updated_at: r.updated_at,
      }
    })

    return new Response(JSON.stringify({ conversations }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("history list exception", err)
    return new Response(JSON.stringify({ conversations: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
