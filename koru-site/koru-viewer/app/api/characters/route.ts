import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()

  const { data: characters, error } = await admin
    .from("characters")
    .select("*")
    .order("order_index", { ascending: true, nullsFirst: false })
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ characters: characters ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slug, role, species, morphology } = body

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Check for duplicate slug
  const { data: existing } = await admin.from("characters").select("id").eq("slug", slug).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
  }

  const insertData: Record<string, string | null> = {
    name,
    slug,
    role: role || null,
    morphology: morphology || null,
    species: species || null,
  }

  const { data: character, error } = await admin
    .from("characters")
    .insert(insertData)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ character })
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json()

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const allowed = ["name", "role", "morphology", "ability", "status", "origin", "species", "location", "mark", "quote", "description", "accent_color", "gradient", "order_index"]
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

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  const admin = createAdminClient()
  const { error } = await admin.from("characters").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
