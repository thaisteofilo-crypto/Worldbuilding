/**
 * POST /api/koru-chat/new-conversation
 *
 * Limpa o cookie `koru-chat-current`. A próxima mensagem do visitante
 * será gravada como uma conversa nova (INSERT em vez de UPDATE).
 *
 * O cookie de sessão (`koru-chat-session`) é preservado — continua sendo
 * o mesmo visitante, só começando outra conversa.
 */

const CURRENT_COOKIE = "koru-chat-current"

export async function POST() {
  const headers = new Headers({ "Content-Type": "application/json" })
  // Set-Cookie com Max-Age=0 instrui o browser a apagar.
  headers.append(
    "Set-Cookie",
    [
      `${CURRENT_COOKIE}=`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0",
      process.env.NODE_ENV === "production" ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ")
  )
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
