import type { MetadataRoute } from "next"

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://koru.example.com"

export default function robots(): MetadataRoute.Robots {
  const cleanBase = BASE_URL.replace(/\/+$/, "")
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/entrar", "/auth/"],
      },
    ],
    sitemap: `${cleanBase}/sitemap.xml`,
  }
}
