import type { MetadataRoute } from "next"

// O site é fechado por login (proxy.ts redireciona tudo para /entrar).
// Enquanto for privado, bloqueia indexação por crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  }
}
