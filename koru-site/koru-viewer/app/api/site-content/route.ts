import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { readLocalState, writeLocalState } from "@/lib/local-state"

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

  // Always write to local file — instant, no dependency
  writeLocalState(key, value)

  // Also try to sync to Supabase (optional, fire-and-forget)
  try {
    const admin = createAdminClient()
    await admin.from("site_content").upsert({ key, value }, { onConflict: "key" })
  } catch { /* ignore — local file is the source of truth */ }

  return NextResponse.json({ ok: true })
}
