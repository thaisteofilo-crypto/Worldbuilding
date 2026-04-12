import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Ensure table exists (runs once)
async function ensureTable(supabase: ReturnType<typeof createAdminClient>) {
  await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS image_positions (
        key TEXT PRIMARY KEY,
        x INTEGER NOT NULL DEFAULT 50,
        y INTEGER NOT NULL DEFAULT 50,
        scale REAL NOT NULL DEFAULT 1.0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  }).catch(() => {
    // rpc may not exist, try raw query approach - table may already exist
  })
}

// GET - fetch all positions or one by key
export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const key = req.nextUrl.searchParams.get("key")

  if (key) {
    const { data } = await supabase
      .from("image_positions")
      .select("*")
      .eq("key", key)
      .single()
    return NextResponse.json({ position: data ?? { key, x: 50, y: 50, scale: 1 } })
  }

  const { data } = await supabase
    .from("image_positions")
    .select("*")

  const positions: Record<string, { x: number; y: number; scale: number }> = {}
  for (const row of data ?? []) {
    positions[row.key] = { x: row.x, y: row.y, scale: row.scale }
  }
  return NextResponse.json({ positions })
}

// POST - save a position
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { key, x, y, scale } = body

  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 })
  }

  const { error } = await supabase
    .from("image_positions")
    .upsert(
      {
        key,
        x: Math.round(x ?? 50),
        y: Math.round(y ?? 50),
        scale: scale ?? 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )

  if (error) {
    // Table might not exist yet - try to create it
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS image_positions (
          key TEXT PRIMARY KEY,
          x INTEGER NOT NULL DEFAULT 50,
          y INTEGER NOT NULL DEFAULT 50,
          scale REAL NOT NULL DEFAULT 1.0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `,
    }).catch(() => {})

    // Retry
    const { error: retryError } = await supabase
      .from("image_positions")
      .upsert(
        {
          key,
          x: Math.round(x ?? 50),
          y: Math.round(y ?? 50),
          scale: scale ?? 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )

    if (retryError) {
      return NextResponse.json({ error: retryError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
