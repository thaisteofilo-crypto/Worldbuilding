import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()

  const { data: characters, error } = await admin
    .from("characters")
    .select("*")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ characters: characters ?? [] })
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const allowed = ["name", "role", "morphology", "ability", "status", "origin", "accent_color", "gradient"]
  const updates: Record<string, string | null> = {}
  for (const key of allowed) {
    if (key in fields) {
      updates[key] = fields[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("characters").update(updates).eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
