import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * POST /api/admin/conversas/[id]/toggle-hidden
 *
 * Alterna o campo `is_hidden` da conversa. Quando hidden = true:
 *   - some de /perguntas-ao-mundo (lista pública)
 *   - some de /api/koru-chat/history (lista do dono no painel)
 *   - 404 em /perguntas-ao-mundo/[id]
 *
 * Autenticação: cookie `koru-admin` deve bater com process.env.ADMIN_TOKEN.
 * Mesma estratégia do layout admin.
 */

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth (espelha o layout admin).
  const token = process.env.ADMIN_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: "Configuração do servidor incompleta" },
      { status: 500 }
    )
  }
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get("koru-admin")
  if (adminCookie?.value !== token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Id ausente" }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()

    // Lê o valor atual pra alternar.
    const { data: current, error: readErr } = await supabase
      .from("koru_chat_conversations")
      .select("is_hidden")
      .eq("id", id)
      .maybeSingle()

    if (readErr) {
      console.error("toggle-hidden read err", readErr)
      return NextResponse.json(
        { error: "Erro ao ler conversa" },
        { status: 500 }
      )
    }
    if (!current) {
      return NextResponse.json(
        { error: "Conversa não encontrada" },
        { status: 404 }
      )
    }

    const next = !(current.is_hidden ?? false)
    const { error: updateErr } = await supabase
      .from("koru_chat_conversations")
      .update({
        is_hidden: next,
        hidden_at: next ? new Date().toISOString() : null,
      })
      .eq("id", id)

    if (updateErr) {
      console.error("toggle-hidden update err", updateErr)
      return NextResponse.json(
        { error: "Erro ao atualizar" },
        { status: 500 }
      )
    }

    return NextResponse.json({ is_hidden: next })
  } catch (err) {
    console.error("toggle-hidden exception", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
