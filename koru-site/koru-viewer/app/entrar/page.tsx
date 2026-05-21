"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

type TabValue = "entrar" | "criar"

export default function EntrarPage() {
  const [tab, setTab] = useState<TabValue>("entrar")
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

  function resetForm() {
    setName("")
    setEmail("")
    setPassword("")
    setError(null)
  }

  function handleTabChange(value: string) {
    setTab(value as TabValue)
    resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams(window.location.search)
      const next = params.get("next") || "/"

      if (tab === "entrar") {
        const res = await fetch("/api/auth/user-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })
        if (res.ok) {
          window.location.href = next
        } else {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || "Email ou senha incorretos.")
          setLoading(false)
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })
        if (res.ok) {
          window.location.href = next
        } else {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || "Não foi possível criar a conta.")
          setLoading(false)
        }
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  async function handleGoogle() {
    window.location.href = "/api/auth/google"
  }

  const isLogin = tab === "entrar"

  return (
    <div className="flex min-h-screen dark">
      {/* Lado esquerdo — imagem (visível só em md+) */}
      <div className="hidden md:block md:w-[60%] relative overflow-hidden shrink-0">
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
        ) : (
          /* Fallback gradient quando não há imagem */
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsl(191 83% 8%) 0%, hsl(219 44% 6%) 40%, hsl(187 69% 14%) 100%)",
            }}
          />
        )}
      </div>

      {/* Lado direito — formulário */}
      <div
        className="flex flex-col items-center justify-center w-full md:w-[40%] min-h-screen px-8 py-12"
        style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}
      >
        <div className="w-full max-w-[360px] flex flex-col gap-8">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-1">
            <h1
              className="font-serif text-3xl"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Thais Teofilo
            </h1>
            <p
              className="font-serif text-xl"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {isLogin ? "Bem-vinda de volta" : "Crie sua conta"}
            </p>
            <p
              className="font-sans text-sm mt-1"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {isLogin
                ? "Entre com sua conta para acessar o universo Korú"
                : "Cadastre-se para acompanhar o projeto"}
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="entrar" className="flex-1">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="criar" className="flex-1">
                Criar conta
              </TabsTrigger>
            </TabsList>

            {/* Formulário — Entrar */}
            <TabsContent value="entrar">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="login-email"
                    className="font-sans text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="login-password"
                    className="font-sans text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Senha
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="font-sans text-xs"
                    style={{ color: "hsl(var(--destructive))" }}
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full h-10 mt-1"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>

                <Divider />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full h-10 gap-2"
                  onClick={handleGoogle}
                >
                  <GoogleIcon />
                  Continuar com Google
                </Button>
              </form>
            </TabsContent>

            {/* Formulário — Criar conta */}
            <TabsContent value="criar">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="register-name"
                    className="font-sans text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Nome
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="register-email"
                    className="font-sans text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Email
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="register-password"
                    className="font-sans text-xs tracking-[0.1em] uppercase"
                    style={{ color: "hsl(var(--muted-foreground))" }}
                  >
                    Senha
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="font-sans text-xs"
                    style={{ color: "hsl(var(--destructive))" }}
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full h-10 mt-1"
                >
                  {loading ? "Criando conta..." : "Criar conta"}
                </Button>

                <Divider />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full h-10 gap-2"
                  onClick={handleGoogle}
                >
                  <GoogleIcon />
                  Continuar com Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Rodapé com link de alternância */}
          <p
            className="text-center font-sans text-sm"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {isLogin ? (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("criar")}
                  className="underline underline-offset-4 transition-colors"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("entrar")}
                  className="underline underline-offset-4 transition-colors"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex-1 h-px"
        style={{ background: "hsl(var(--border-shadcn))" }}
      />
      <span
        className="font-sans text-xs"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        ou
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "hsl(var(--border-shadcn))" }}
      />
    </div>
  )
}
