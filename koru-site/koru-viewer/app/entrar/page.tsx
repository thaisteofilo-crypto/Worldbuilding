"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
      <div className="relative z-10 w-full max-w-[440px] mx-4 sm:mx-8 bg-white rounded-3xl shadow-2xl px-9 py-10 sm:px-10 sm:py-11 flex flex-col gap-6">

        {/* Logo / cabeçalho */}
        <div className="flex flex-col gap-3 text-center">
          <h1 className="font-serif text-[34px] font-normal text-una leading-none tracking-tight m-0">
            Korú
          </h1>
          <div className="flex flex-col gap-1.5">
            <p className="font-sans text-[20px] font-semibold text-una leading-tight m-0">
              {tab === "entrar" ? "Bem-vinda de volta" : "Crie sua conta"}
            </p>
            <p className="font-sans text-[13px] text-[#6B7280] leading-snug m-0">
              {tab === "entrar"
                ? "Entre no sistema da marca com sua conta Google."
                : "Cadastre-se para acompanhar o projeto."}
            </p>
          </div>
        </div>

        {/* Tabs: Entrar / Criar conta */}
        <div className="flex rounded-2xl p-1 gap-1 border border-[#E5E7EB] bg-white">
          {(["entrar", "criar"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={[
                "flex-1 rounded-xl py-2.5 px-3 text-[14px] font-sans font-medium border-none cursor-pointer transition-all duration-150",
                tab === t
                  ? "bg-[#F3F4F6] text-una"
                  : "bg-transparent text-[#6B7280]",
              ].join(" ")}
            >
              {t === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "criar" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-[11px] tracking-[0.12em] uppercase text-[#6B7280] font-sans font-medium">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                className="h-11 rounded-full bg-white border-[#D1D5DB] px-4 text-una placeholder:text-[#9CA3AF]"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-[11px] tracking-[0.12em] uppercase text-[#6B7280] font-sans font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              className="h-11 rounded-full bg-white border-[#D1D5DB] px-4 text-una placeholder:text-[#9CA3AF]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-[11px] tracking-[0.12em] uppercase text-[#6B7280] font-sans font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete={tab === "entrar" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="h-11 rounded-full bg-white border-[#D1D5DB] px-4 text-una placeholder:text-[#9CA3AF]"
            />
          </div>

          {error && (
            <p role="alert" className="text-[12px] text-urucum font-sans m-0">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-11 font-sans font-medium text-[15px] mt-1"
          >
            {loading
              ? (tab === "entrar" ? "Entrando…" : "Criando conta…")
              : (tab === "entrar" ? "Entrar" : "Criar conta")}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="text-[11px] tracking-[0.12em] uppercase text-[#9CA3AF] font-sans font-medium">
              ou
            </span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full h-11 gap-2.5 font-sans font-normal text-[14px] border-[#D1D5DB] text-[#374151] bg-white hover:bg-[#F9FAFB]"
            onClick={() => {
              const params = new URLSearchParams(window.location.search)
              const next = params.get("next") || "/"
              window.location.href = `/api/auth/google?next=${encodeURIComponent(next)}`
            }}
          >
            <GoogleIcon />
            Continuar com Google
          </Button>
        </form>

        {/* Rodapé */}
        <p className="text-center text-[13px] text-[#6B7280] font-sans m-0">
          {tab === "entrar" ? (
            <>
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("criar")}
                className="bg-transparent border-none cursor-pointer text-iara underline underline-offset-[3px] text-[13px] font-[inherit] p-0"
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
                className="bg-transparent border-none cursor-pointer text-iara underline underline-offset-[3px] text-[13px] font-[inherit] p-0"
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
