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
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm px-4">
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
            Admin
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl p-6 glass-card"
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              className="rounded-lg px-3 py-2 font-sans text-sm outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--foreground)",
                border: `1px solid ${error ? "var(--destructive)" : "var(--border)"}`,
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
              background: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
