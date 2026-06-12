"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ backgroundColor: "hsl(var(--background))" }}
    >
      <div>
        <p
          className="text-xs uppercase tracking-[0.2em] font-sans mb-4"
          style={{ color: "var(--color-jala)" }}
        >
          Erro
        </p>
        <h1
          className="font-serif text-4xl mb-4"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "hsl(var(--foreground))",
          }}
        >
          Algo saiu do ciclo
        </h1>
        <p
          className="text-sm font-sans max-w-sm"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Ocorreu um erro inesperado.
        </p>
      </div>
      <div className="flex gap-6">
        <button
          onClick={reset}
          className="text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{ color: "hsl(var(--primary))", outlineColor: "hsl(var(--primary))" }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{
            color: "hsl(var(--muted-foreground))",
            outlineColor: "hsl(var(--primary))",
          }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
