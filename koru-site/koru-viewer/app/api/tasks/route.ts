import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const admin = createAdminClient()
  const { data: tasks, error } = await admin
    .from("tasks")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: tasks ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, status = "todo", description, category = "outro", priority = "normal" } = body

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 })
  }

  const admin = createAdminClient()

  // Get max order_index for the column
  const { data: existing } = await admin
    .from("tasks")
    .select("order_index")
    .eq("status", status)
    .order("order_index", { ascending: false })
    .limit(1)

  const maxIndex = existing?.[0]?.order_index ?? 0

  const { error } = await admin.from("tasks").insert({
    title,
    description: description || null,
    status,
    category,
    priority,
    order_index: maxIndex + 1,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { id, ...fields } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("tasks").update(fields).eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest) {
  const { updates } = await req.json()
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "Missing updates array" }, { status: 400 })
  }

  const admin = createAdminClient()
  for (const { id, ...fields } of updates) {
    if (!id) continue
    const { error } = await admin.from("tasks").update(fields).eq("id", id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from("tasks").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
