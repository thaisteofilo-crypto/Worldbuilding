import { NextResponse } from "next/server"
import { getCharactersForViewer } from "@/lib/characters-db"
import { getSiteContent } from "@/lib/site-content"
import { getPublishConfig, isPublic } from "@/lib/document-publish"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { chars } = await getCharactersForViewer()
    const siteContent = await getSiteContent()
    const cfg = getPublishConfig(siteContent, "personagens/temiku")
    const publishKeys = Object.keys(siteContent).filter((k) => k.includes("personagens/temiku") || k.startsWith("publish:personagens"))
    return NextResponse.json({
      hasTemiku: !!chars["temiku"],
      publishConfig: cfg,
      isPublic: isPublic(cfg),
      relatedSiteContentKeys: publishKeys.map((k) => ({ key: k, value: siteContent[k] })),
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
