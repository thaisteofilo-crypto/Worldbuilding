import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { readLocalState, writeLocalState } from "@/lib/local-state"
import { revalidatePublicSite } from "@/lib/revalidate"

export async function GET() {
  // Try Supabase first; fall back to local file if table doesn't exist
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("site_content")
      .select("key, value, updated_at")
      .order("key")

    if (!error && data) {
      // Merge: local file wins when keys overlap (it's written synchronously on every PATCH;
      // Supabase upsert can fail silently and return stale values).
      const localState = readLocalState()
      const localKeys = new Set(Object.keys(localState))
      const fromSupabase = data.filter((r) => !localKeys.has(r.key))
      const fromLocal = Object.entries(localState).map(([key, value]) => ({ key, value, updated_at: null }))
      return NextResponse.json({ content: [...fromSupabase, ...fromLocal] })
    }
  } catch { /* ignore */ }

  // Full fallback: local state only
  const localState = readLocalState()
  const content = Object.entries(localState).map(([key, value]) => ({ key, value, updated_at: null }))
  return NextResponse.json({ content })
}

export async function PATCH(req: NextRequest) {
  const { key, value } = await req.json()
  if (!key) return NextResponse.json({ error: "key is required" }, { status: 400 })

  // Try local file first (no-op in production, where FS is read-only)
  const localOk = writeLocalState(key, value)

  // Try Supabase
  let supabaseOk = false
  let supabaseError: string | null = null
  try {
    const admin = createAdminClient()
    const { error } = await admin.from("site_content").upsert({ key, value }, { onConflict: "key" })
    if (error) supabaseError = error.message
    else supabaseOk = true
  } catch (e) {
    supabaseError = e instanceof Error ? e.message : String(e)
  }

  if (!localOk && !supabaseOk) {
    return NextResponse.json(
      { error: "Falha ao persistir", supabaseError, hint: "Local FS bloqueado (prod) e Supabase falhou. Verifique tabela site_content e SUPABASE_SERVICE_ROLE_KEY." },
      { status: 500 }
    )
  }

  revalidatePublicSite()
  return NextResponse.json({ ok: true, localOk, supabaseOk, supabaseError })
}
