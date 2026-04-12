"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(false)

    if (password === "koru2026") {
      document.cookie = "koru-admin=true; path=/; max-age=86400"
      window.location.href = "/admin"
      return
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: "linear-gradient(135deg, oklch(0.96 0.008 280), oklch(0.94 0.015 290), oklch(0.97 0.008 270))",
      }}
    >
      <div className="w-full max-w-sm px-4">
        <div className="mb-10 text-center">
          <h1
            className="font-serif text-4xl"
            style={{
              color: "oklch(0.20 0.02 280)",
              fontFamily: "var(--font-serif), Georgia, serif",
            }}
          >
            Korú
          </h1>
          <p
            className="mt-2 font-sans text-xs tracking-[0.2em] uppercase"
            style={{ color: "oklch(0.50 0.02 280)" }}
          >
            Admin
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl p-6"
          style={{
            background: "white",
            border: "1px solid oklch(0.90 0.006 280)",
            boxShadow: "0 4px 24px oklch(0 0 0 / 0.06)",
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="font-sans text-xs tracking-[0.15em] uppercase"
              style={{ color: "oklch(0.45 0.01 280)" }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="rounded-lg px-3 py-2 font-sans text-sm outline-none transition-colors"
              style={{
                backgroundColor: "oklch(0.97 0.004 280)",
                color: "oklch(0.20 0.01 280)",
                border: `1px solid ${error ? "oklch(0.60 0.2 27)" : "oklch(0.88 0.006 280)"}`,
              }}
            />
          </div>

          {error && (
            <p className="font-sans text-xs" style={{ color: "oklch(0.55 0.2 27)" }}>
              Senha incorreta
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full py-2.5 font-sans text-sm font-medium transition-opacity disabled:opacity-60"
            style={{
              background: "oklch(0.45 0.12 290)",
              color: "white",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
