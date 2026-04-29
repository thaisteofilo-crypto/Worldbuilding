import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()
  const { data: documents, error } = await admin
    .from("documents")
    .select("id, slug, title, section, updated_at")
    .order("section")
    .order("slug")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: documents ?? [] })
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("documents")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("documents").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
