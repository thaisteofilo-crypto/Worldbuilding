"use client"

import { useState, useEffect } from "react"

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
          <h1
            className="font-serif text-4xl"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-serif), Georgia, serif",
            }}
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
          className="flex flex-col gap-4 rounded-xl p-6"
          style={{
            background: "oklch(0.16 0.009 280)",
            border: "1px solid oklch(0.28 0.009 280)",
            boxShadow: "0 4px 20px oklch(0 0 0 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.06)",
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
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg px-3 py-2 font-sans text-sm outline-none transition-colors"
              style={{
                backgroundColor: "oklch(0.12 0.007 280)",
                color: "oklch(0.93 0.01 280)",
                border: `1px solid ${error ? "oklch(0.55 0.18 27)" : "oklch(0.28 0.009 280)"}`,
              }}
            />
          </div>

          {error && (
            <p className="font-sans text-xs" style={{ color: "var(--destructive)" }}>
              Senha incorreta
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full py-2.5 font-sans text-sm font-medium transition-opacity disabled:opacity-60"
            style={{
              background: "oklch(0.93 0.01 280)",
              color: "oklch(0.10 0.01 280)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
