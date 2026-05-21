import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * GET /api/admin/leads
 *
 * Lista todos os usuários cadastrados via Supabase Auth.
 * Autenticação: cookie `koru-admin` deve bater com process.env.ADMIN_TOKEN.
 */

export async function GET() {
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

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("leads listUsers err", error)
      return NextResponse.json(
        { error: "Erro ao listar usuários" },
        { status: 500 }
      )
    }

    const users = (data?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "—",
      created_at: u.created_at,
      name: u.user_metadata?.name ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }))

    // Mais recentes primeiro
    users.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({ users, total: users.length })
  } catch (err) {
    console.error("leads exception", err)
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 })
  }
}
