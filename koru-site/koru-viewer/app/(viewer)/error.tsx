"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function ViewerError({
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
    <div className="flex flex-col items-center justify-center h-[calc(100vh-3rem)] gap-6 px-6 text-center">
      <div>
        <p
          className="text-xs uppercase tracking-[0.2em] font-sans mb-4"
          style={{ color: "var(--blue-cold)" }}
        >
          Erro ao carregar documento
        </p>
        <h2
          className="font-serif text-3xl mb-4"
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            color: "var(--foreground)",
          }}
        >
          O documento não pôde ser lido
        </h2>
        <p
          className="text-sm font-sans max-w-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          Verifique se o arquivo existe e tente novamente.
        </p>
      </div>
      <div className="flex gap-6">
        <button
          onClick={reset}
          className="text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{ color: "var(--accent)", outlineColor: "var(--accent)" }}
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="text-sm font-sans underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 rounded-sm"
          style={{
            color: "var(--muted-foreground)",
            outlineColor: "var(--accent)",
          }}
        >
          Início
        </Link>
      </div>
    </div>
  )
}
