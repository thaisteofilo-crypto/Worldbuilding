"use client"

import { useState, useEffect } from "react"
import { KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SiteGatePage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroVideo, setHeroVideo] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then(({ banners }) => {
        if (banners?.["hero-video"]) setHeroVideo(banners["hero-video"])
        else if (banners?.["hero"]) setHeroImage(banners["hero"])
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/auth/site-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next') || '/'
        window.location.href = next
      } else {
        setError(true)
        setLoading(false)
      }
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {heroVideo ? (
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(4px) brightness(0.35)", transform: "scale(1.08)" }}
        />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "blur(4px) brightness(0.35)", transform: "scale(1.08)" }}
        />
      ) : null}

      <div className="absolute inset-0" style={{ background: "oklch(0 0 0 / 0.45)" }} />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <KeyRound size={20} />
            </span>
          </div>
          <h1
            className="font-serif text-4xl"
            style={{ color: "var(--foreground)", fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Korú
          </h1>
          <p
            className="mt-2 font-sans text-xs tracking-[0.2em] uppercase"
            style={{ color: "var(--muted-foreground)" }}
          >
            Acesso restrito
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-label="Formulário de acesso ao site"
          className="flex flex-col gap-4 rounded-2xl p-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px color-mix(in oklch, var(--background) 60%, transparent)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-sans text-xs tracking-[0.15em] uppercase"
              style={{ color: "var(--muted-foreground)" }}
            >
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error || undefined}
              aria-describedby={error ? "site-password-error" : undefined}
              className="h-10"
            />
          </div>

          {error && (
            <p
              id="site-password-error"
              role="alert"
              className="font-sans text-xs"
              style={{ color: "var(--destructive)" }}
            >
              Senha incorreta
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-10 mt-2"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
