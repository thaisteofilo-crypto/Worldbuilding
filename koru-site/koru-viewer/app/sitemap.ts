import type { MetadataRoute } from "next"
import { bibliaParts, contoSlugs, livroChapters } from "@/lib/content"
import { characterOrder } from "@/lib/characters"

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://koru.example.com"

function url(pathname: string): string {
  const cleanBase = BASE_URL.replace(/\/+$/, "")
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${cleanBase}${cleanPath}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: url("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: url("/personagens"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/galeria"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/workflow"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/perguntas-ao-mundo"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ]

  const bibliaSlugs = [
    ...bibliaParts().map((p) => `parte-${p.parte}`),
    "manifesto",
    "glossario-de-koru",
    "glossario-de-lugares",
  ]
  const bibliaPages: MetadataRoute.Sitemap = bibliaSlugs.map((slug) => ({
    url: url(`/biblia/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const contosPages: MetadataRoute.Sitemap = contoSlugs().map(({ personagem }) => ({
    url: url(`/contos/${personagem}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const livroPages: MetadataRoute.Sitemap = livroChapters().map(({ capitulo }) => ({
    url: url(`/livro/${capitulo}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  const personagensPages: MetadataRoute.Sitemap = characterOrder.map((nome) => ({
    url: url(`/personagens/${nome}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...bibliaPages,
    ...contosPages,
    ...livroPages,
    ...personagensPages,
  ]
}
