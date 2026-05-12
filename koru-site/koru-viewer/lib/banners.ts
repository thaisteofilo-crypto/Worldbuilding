import { createAdminClient } from "./supabase/admin"

const HOME_SLOTS = ["hero", "hero-video", "personagens", "personagens-video", "biblia", "biblia-video", "livro", "livro-video", "contos", "contos-video", "footer", "footer-video"]
const BIBLIA_PAGE_SLUGS = ["manifesto", "parte-00", "parte-01", "parte-02", "parte-03", "parte-04", "parte-05", "parte-06", "parte-07", "parte-08", "glossario-de-koru", "glossario-de-lugares"]
const DOC_SLOTS = BIBLIA_PAGE_SLUGS.flatMap((s) => [`doc-${s}`, `doc-${s}-video`])
const BANNER_SLOTS = [...HOME_SLOTS, ...DOC_SLOTS]

export async function getBannerUrls(): Promise<Record<string, string>> {
  // Tolerante a ambiente sem Supabase (ex.: build sem env): devolve {} para
  // que as páginas possam renderizar com o fallback de banner.
  try {
    const admin = createAdminClient()

    const { data: files } = await admin.storage.from("banners").list("", {
      sortBy: { column: "name", order: "asc" },
    })

    const banners: Record<string, string> = {}
    for (const file of files || []) {
      const slot = file.name.split(".")[0]
      if (BANNER_SLOTS.includes(slot)) {
        const { data } = admin.storage.from("banners").getPublicUrl(file.name)
        const v = file.updated_at || file.created_at || ""
        const bust = v ? `?v=${new Date(v).getTime()}` : ""
        banners[slot] = data.publicUrl + bust
      }
    }

    return banners
  } catch {
    return {}
  }
}

export async function getCardImages(): Promise<Record<string, string>> {
  const admin = createAdminClient()

  const { data: files } = await admin.storage.from("card-images").list("", {
    sortBy: { column: "name", order: "asc" },
  })

  const images: Record<string, string> = {}
  for (const file of files ?? []) {
    if (file.name.startsWith(".")) continue
    const key = file.name.replace(/\.[^.]+$/, "")
    const { data } = admin.storage.from("card-images").getPublicUrl(file.name)
    const v = file.updated_at || file.created_at || ""
    const bust = v ? `?v=${new Date(v).getTime()}` : ""
    images[key] = data.publicUrl + bust
  }

  return images
}

export async function getGalleryImages(): Promise<{ name: string; url: string }[]> {
  const admin = createAdminClient()

  const { data: files } = await admin.storage.from("gallery").list("", {
    sortBy: { column: "created_at", order: "desc" },
  })

  return (files ?? [])
    .filter((f) => !f.name.startsWith("."))
    .map((f) => {
      const { data } = admin.storage.from("gallery").getPublicUrl(f.name)
      return { name: f.name, url: data.publicUrl }
    })
}

export async function getCharacterImageUrls(): Promise<Record<string, string>> {
  const admin = createAdminClient()

  const { data: characters } = await admin
    .from("characters")
    .select("slug, image_url")

  const images: Record<string, string> = {}
  for (const char of characters || []) {
    if (char.image_url) {
      images[char.slug] = char.image_url
    }
  }

  return images
}
