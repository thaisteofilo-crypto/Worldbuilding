import { NextResponse } from "next/server"
import { getCharactersForViewer } from "@/lib/characters-db"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { chars } = await getCharactersForViewer()
    const siteContent = await getSiteContent()
    const status = Object.keys(chars).map((slug) => {
      const cfg = getPublishConfig(siteContent, `personagens/${slug}`)
      return { slug, state: cfg.state, at: cfg.at, public: isPublic(cfg) }
    })
    return NextResponse.json({ status })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
