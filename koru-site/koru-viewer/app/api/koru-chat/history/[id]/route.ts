import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/koru-chat/history/[id]
 *
 * Retorna as mensagens de uma conversa específica, **se e somente se**
 * o session_id da row bate com o cookie do visitante. Garantia de privacidade:
 * um visitante nunca consegue ler conversa de outro.
 *
 * 403 se o cookie está ausente ou a conversa pertence a outra sessão.
 * 404 se a conversa não existe.
 */

const SESSION_COOKIE = "koru-chat-session"
const CURRENT_COOKIE = "koru-chat-current"
const CURRENT_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

interface SavedMessage {
  role: "user" | "assistant"
  content: string
  ts: string
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

function buildCurrentCookie(conversationId: string): string {
  return [
    `${CURRENT_COOKIE}=${conversationId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${CURRENT_MAX_AGE}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookies = parseCookies(req.headers.get("cookie"))
  const sessionId = cookies[SESSION_COOKIE]

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Sessão ausente." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "Id ausente." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("koru_chat_conversations")
      .select("id, session_id, messages, is_hidden")
      .eq("id", id)
      .maybeSingle()

    if (error) {
      console.error("history detail error", error)
      return new Response(JSON.stringify({ error: "Erro ao carregar." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Conversa não encontrada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Visitante só vê suas próprias conversas, mesmo se escondidas pela admin
    // (na admin a conversa some do feed público, mas o dono ainda pode revisitar).
    if (data.session_id !== sessionId) {
      return new Response(JSON.stringify({ error: "Acesso negado." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    const messages = (data.messages as SavedMessage[] | null) ?? []

    // Setar o cookie current pra que próximas mensagens continuem essa conversa.
    const headers = new Headers({ "Content-Type": "application/json" })
    headers.append("Set-Cookie", buildCurrentCookie(id))

    return new Response(
      JSON.stringify({ id, messages, is_hidden: data.is_hidden ?? false }),
      { status: 200, headers }
    )
  } catch (err) {
    console.error("history detail exception", err)
    return new Response(JSON.stringify({ error: "Erro inesperado." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
