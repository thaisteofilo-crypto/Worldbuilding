import { NextResponse } from "next/server"
import { getCharactersForViewer } from "@/lib/characters-db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { chars, order } = await getCharactersForViewer()
    return NextResponse.json({
      ok: true,
      slugs: Object.keys(chars),
      order,
      hasTemiku: !!chars["temiku"],
      temikuSnippet: chars["temiku"] ? { slug: chars["temiku"].slug, name: chars["temiku"].name, mark: chars["temiku"].mark?.slice(0, 60) } : null,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
