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
    /* Tela inteira, posição relativa para o fundo */
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        /* Fallback para quando não há imagem */
        background: "linear-gradient(135deg, #0B363C 0%, #090E17 55%, #0B6377 100%)",
      }}
    >
      {/* ── Imagem de fundo: SEM blur, SEM overlay ── */}
      {heroVideo ? (
        <video
          src={heroVideo}
          autoPlay muted loop playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      ) : heroImage ? (
        <img
          src={heroImage}
          alt="Universo Korú"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* ── Card de auth — flutuante, lado direito ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          margin: "0 clamp(16px, 5vw, 80px)",
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          borderRadius: "16px",
          padding: "36px 32px 32px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Cabeçalho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "26px",
              fontWeight: 400,
              color: "#090E17",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Korú
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
              fontSize: "15px",
              fontWeight: 500,
              color: "#090E17",
              margin: 0,
            }}
          >
            {tab === "entrar" ? "Bem-vinda de volta" : "Crie sua conta"}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans, system-ui, sans-serif)",
              fontSize: "13px",
              color: "#4A5568",
              margin: 0,
            }}
          >
            {tab === "entrar"
              ? "Entre com sua conta para acessar o universo Korú"
              : "Cadastre-se para acompanhar o projeto"}
          </p>
        </div>

        {/* Tab toggle */}
        <div
          style={{
            display: "flex",
            borderRadius: "999px",
            padding: "3px",
            gap: "3px",
            backgroundColor: "#F0F0F0",
          }}
        >
          {(["entrar", "criar"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              style={{
                flex: 1,
                borderRadius: "999px",
                padding: "7px 12px",
                fontSize: "13px",
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.18s ease",
                backgroundColor: tab === t ? "#0B6377" : "transparent",
                color: tab === t ? "#FFFFFF" : "#4A5568",
              }}
            >
              {t === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          {tab === "criar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Label
                htmlFor="name"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#4A5568",
                  fontFamily: "var(--font-sans, system-ui, sans-serif)",
                }}
              >
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-10"
                style={{ backgroundColor: "#F7F7F7", borderColor: "#D1D5DB", color: "#090E17" }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Label
              htmlFor="email"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4A5568",
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
              }}
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-10"
              style={{ backgroundColor: "#F7F7F7", borderColor: "#D1D5DB", color: "#090E17" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Label
              htmlFor="password"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4A5568",
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
              }}
            >
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete={tab === "entrar" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
              style={{ backgroundColor: "#F7F7F7", borderColor: "#D1D5DB", color: "#090E17" }}
            />
          </div>

          {error && (
            <p
              role="alert"
              style={{
                fontSize: "12px",
                color: "#C72211",
                fontFamily: "var(--font-sans, system-ui, sans-serif)",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full h-10 font-sans font-medium"
            style={{ marginTop: "2px" }}
          >
            {loading
              ? (tab === "entrar" ? "Entrando…" : "Criando conta…")
              : (tab === "entrar" ? "Entrar" : "Criar conta")}
          </Button>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }} />
            <span style={{ fontSize: "12px", color: "#9CA3AF", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}>
              ou
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E5E7EB" }} />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full h-10 gap-2 font-sans"
            style={{ borderColor: "#D1D5DB", color: "#374151", backgroundColor: "white" }}
            onClick={() => { window.location.href = "/api/auth/google" }}
          >
            <GoogleIcon />
            Continuar com Google
          </Button>
        </form>

        {/* Link rodapé */}
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#6B7280",
            fontFamily: "var(--font-sans, system-ui, sans-serif)",
            margin: 0,
          }}
        >
          {tab === "entrar" ? (
            <>
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("criar")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#0B6377",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => switchTab("entrar")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#0B6377",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                }}
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
