"use client"

import { useState, useEffect } from "react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroVideo, setHeroVideo] = useState<string | null>(null)
  const [bgImages, setBgImages] = useState<string[]>([])
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then(({ banners }) => {
        if (banners?.["hero-video"]) setHeroVideo(banners["hero-video"])
        else if (banners?.["hero"]) setHeroImage(banners["hero"])
        else {
          fetch("/api/media-images")
            .then((r) => r.json())
            .then(({ images }) => {
              if (images?.length) setBgImages(images)
            })
            .catch(() => {})
        }
      })
      .catch(() => {
        fetch("/api/media-images")
          .then((r) => r.json())
          .then(({ images }) => {
            if (images?.length) setBgImages(images)
          })
          .catch(() => {})
      })
  }, [])

  useEffect(() => {
    if (bgImages.length <= 1) return
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % bgImages.length)
    }, 5000)
    return () => clearInterval(id)
  }, [bgImages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = "/admin"
      } else {
        setError(true)
        setLoading(false)
      }
    } catch {
      setError(true)
      setLoading(false)
    }
  }

  const hasBg = heroVideo || heroImage || bgImages.length > 0

  return (
    <div className="auth-bg relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {heroVideo ? (
        <video
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt="Universo Korú"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : bgImages.length > 0 ? (
        <>
          {bgImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: i === bgIndex ? 1 : 0 }}
            />
          ))}
        </>
      ) : null}

      {hasBg && (
        <div className="absolute inset-0 bg-black/40" aria-hidden />
      )}

      <div
        style={{ maxWidth: 400, borderRadius: 32, boxShadow: "0 10px 30px -12px rgba(11, 54, 60, 0.25)" }}
        className="relative z-10 w-full mx-4 sm:mx-8 bg-white border border-iara/15 px-8 py-10"
      >
        <div className="mb-7 flex justify-center">
          <span
            aria-label="Korú"
            className="font-serif text-una inline-flex items-baseline whitespace-nowrap tracking-tight text-4xl"
          >
            Korú
          </span>
        </div>

        <div className="mb-7 text-center">
          <h1 className="font-sans text-una mb-1.5 text-2xl leading-tight">
            Painel admin
          </h1>
          <p className="text-pego text-sm">
            Acesso restrito. Informe a senha do painel.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-label="Formulário de acesso ao painel admin"
          className="flex flex-col gap-5"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-pego font-mono text-[10px] uppercase tracking-[0.2em]">
              Senha
            </span>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={error || undefined}
              aria-describedby={error ? "admin-password-error" : undefined}
              className="border-iara/25 focus:border-iara focus:ring-iara/20 text-una rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
            />
          </label>

          {error && (
            <p
              id="admin-password-error"
              role="alert"
              className="text-urucum font-mono text-[11px] m-0"
            >
              Senha incorreta
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-iara hover:bg-iara/90 disabled:opacity-60 mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-white transition-colors disabled:cursor-not-allowed"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
