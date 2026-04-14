import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Build Supabase Storage public URL statically — avoids N+1 getPublicUrl() calls in loops.
function storagePublicUrl(bucket: string, filename: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/${bucket}/${filename}`
}

export async function GET() {
  const admin = createAdminClient()

  const { data: files, error } = await admin.storage.from("gallery").list("", {
    sortBy: { column: "created_at", order: "desc" },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const images = (files ?? [])
    .filter((f) => !f.name.startsWith("."))
    .map((f) => ({
      name: f.name,
      url: storagePublicUrl("gallery", f.name),
      created_at: f.created_at,
    }))

  return NextResponse.json({ images })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const customName = formData.get("name") as string | null

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const baseName = customName?.trim()
    ? customName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")
    : `cena-${Date.now()}`
  const fileName = `${baseName}.${ext}`

  const admin = createAdminClient()

  const arrayBuffer = await file.arrayBuffer()
  const { error } = await admin.storage.from("gallery").upload(fileName, new Uint8Array(arrayBuffer), {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: storagePublicUrl("gallery", fileName), name: fileName })
}

export async function DELETE(req: NextRequest) {
  const { name } = await req.json()
  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.storage.from("gallery").remove([name])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
