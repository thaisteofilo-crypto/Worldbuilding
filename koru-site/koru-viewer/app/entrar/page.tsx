"use client"

import { useState, useEffect } from "react"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}

type Tab = "entrar" | "criar"

export default function EntrarPage() {
  const [tab, setTab] = useState<Tab>("entrar")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroVideo, setHeroVideo] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error") === "oauth") setError("Não foi possível entrar com Google. Tente email e senha.")
    if (params.get("error") === "callback") setError("Erro ao completar autenticação. Tente novamente.")
  }, [])

  useEffect(() => {
    fetch("/api/banners")
      .then((r) => r.json())
      .then(({ banners }) => {
        if (banners?.["hero-video"]) setHeroVideo(banners["hero-video"])
        else if (banners?.["hero"]) setHeroImage(banners["hero"])
      })
      .catch(() => {})
  }, [])

  function switchTab(t: Tab) {
    setTab(t)
    setName("")
    setEmail("")
    setPassword("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams(window.location.search)
    const next = params.get("next") || "/"

    try {
      const endpoint = tab === "entrar" ? "/api/auth/user-login" : "/api/auth/register"
      const body = tab === "entrar" ? { email, password } : { email, password, name }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.warning === "created_no_session") {
          switchTab("entrar")
          setError("Conta criada! Entre com seu email e senha.")
          setLoading(false)
          return
        }
        window.location.href = next
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? (tab === "entrar" ? "Email ou senha incorretos." : "Não foi possível criar a conta."))
        setLoading(false)
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fundo: vídeo ou imagem */}
      {heroVideo ? (
        <video
          src={heroVideo}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt="Universo Korú"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}

      {/* Card branco flutuante */}
      <div
        style={{ maxWidth: 400, borderRadius: 32, boxShadow: "0 10px 30px -12px rgba(11, 54, 60, 0.25)" }}
        className="relative z-10 w-full mx-4 sm:mx-8 bg-white border border-iara/15 px-8 py-10"
      >

        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <span
            aria-label="Korú"
            className="font-serif text-una inline-flex items-baseline whitespace-nowrap tracking-tight text-[38px] leading-none"
          >
            Korú
          </span>
        </div>

        {/* Título */}
        <div className="mb-7 text-center">
          <h1 className="font-sans text-una mb-1.5 text-2xl leading-tight">
            {tab === "entrar" ? "Bem-vinda de volta" : "Crie sua conta"}
          </h1>
          <p className="text-pego text-sm">
            {tab === "entrar"
              ? "Entre no sistema da marca com sua conta Google."
              : "Cadastre-se para acompanhar o projeto."}
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          {/* Tabs */}
          <div role="tablist" className="border-iara/15 flex rounded-xl border p-1">
            {(["entrar", "criar"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => switchTab(t)}
                className={[
                  "flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
                  tab === t
                    ? "bg-iara/10 text-una"
                    : "text-pego hover:text-una hover:bg-iara/[0.04]",
                ].join(" ")}
              >
                {t === "entrar" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === "criar" && (
              <label className="flex flex-col gap-1.5">
                <span className="text-pego font-mono text-[10px] uppercase tracking-[0.2em]">Nome</span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-iara/25 focus:border-iara focus:ring-iara/20 text-una rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-pego font-mono text-[10px] uppercase tracking-[0.2em]">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-iara/25 focus:border-iara focus:ring-iara/20 text-una rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-pego font-mono text-[10px] uppercase tracking-[0.2em]">Senha</span>
              <input
                type="password"
                required
                autoComplete={tab === "entrar" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-iara/25 focus:border-iara focus:ring-iara/20 text-una rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2"
              />
            </label>

            {error && (
              <p role="alert" className="text-urucum font-mono text-[11px] mt-1 m-0">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-iara hover:bg-iara/90 disabled:opacity-60 mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-white transition-colors disabled:cursor-not-allowed"
            >
              {loading
                ? (tab === "entrar" ? "Entrando…" : "Criando conta…")
                : (tab === "entrar" ? "Entrar" : "Criar conta")}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3">
            <div className="bg-iara/15 h-px flex-1" />
            <span className="text-pego font-mono text-[10px] uppercase tracking-[0.2em]">ou</span>
            <div className="bg-iara/15 h-px flex-1" />
          </div>

          {/* Botão Google */}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              const next = params.get("next") || "/"
              window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`
            }}
            className="group border-iara/25 bg-white hover:border-iara hover:bg-orvalho disabled:opacity-60 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors"
          >
            <GoogleIcon />
            <span className="text-una">Continuar com Google</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-pego mt-7 text-center text-xs">
          {tab === "entrar" ? (
            <>
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("criar")}
                className="text-iara hover:text-pego underline decoration-iara/40 hover:decoration-iara underline-offset-4 transition-colors bg-transparent border-none p-0 cursor-pointer font-[inherit]"
              >
                Solicite acesso
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("entrar")}
                className="text-iara hover:text-pego underline decoration-iara/40 hover:decoration-iara underline-offset-4 transition-colors bg-transparent border-none p-0 cursor-pointer font-[inherit]"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
