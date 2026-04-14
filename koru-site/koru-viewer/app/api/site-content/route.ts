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
      // Merge: local state fills in any keys not in Supabase
      const localState = readLocalState()
      const supabaseKeys = new Set(data.map((r) => r.key))
      const extra = Object.entries(localState)
        .filter(([k]) => !supabaseKeys.has(k))
        .map(([key, value]) => ({ key, value, updated_at: null }))
      return NextResponse.json({ content: [...data, ...extra] })
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
