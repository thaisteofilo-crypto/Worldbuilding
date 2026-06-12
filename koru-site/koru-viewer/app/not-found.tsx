import Link from "next/link"
import Image from "next/image"
import { getBannerUrls } from "@/lib/banners"

export default async function NotFound() {
  // Fundo: banner do site (hero; footer como reserva). Sem banner nenhum,
  // cai no fundo da marca com texto nos tokens normais.
  const banners = await getBannerUrls()
  const bannerUrl = banners.hero || banners.footer
  const onBanner = !!bannerUrl

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center overflow-hidden bg-background">
      {onBanner && (
        <>
          <Image src={bannerUrl} alt="" fill className="object-cover" priority />
          <div
            className="absolute inset-0"
            style={{ background: "oklch(0 0 0 / 0.5)" }}
          />
        </>
      )}
      <div className="relative z-10">
        <p
          className="text-xs uppercase tracking-[0.2em] font-sans mb-4"
          style={{
            color: onBanner ? "oklch(1 0 0 / 0.7)" : "hsl(var(--muted-foreground))",
            textShadow: onBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
          }}
        >
          404
        </p>
        <h1
          className="font-serif text-4xl mb-4"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: onBanner ? "white" : "hsl(var(--foreground))",
            textShadow: onBanner ? "0 2px 12px oklch(0 0 0 / 0.4)" : undefined,
          }}
        >
          O caminho não existe
        </h1>
        <p
          className="text-sm font-sans max-w-sm"
          style={{
            color: onBanner ? "oklch(1 0 0 / 0.85)" : "hsl(var(--muted-foreground))",
            textShadow: onBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
          }}
        >
          Este documento não foi encontrado no Akwu.
        </p>
      </div>
      <Link
        href="/"
        className="relative z-10 text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
        style={{
          color: onBanner ? "white" : "hsl(var(--primary))",
          outlineColor: onBanner ? "white" : "hsl(var(--primary))",
          textShadow: onBanner ? "0 1px 6px oklch(0 0 0 / 0.45)" : undefined,
        }}
      >
        Voltar ao início
      </Link>
    </div>
  )
}
