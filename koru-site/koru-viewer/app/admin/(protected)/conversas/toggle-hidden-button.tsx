"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Chip clicável de moderação. Mostra "Pública" / "Escondida" e, ao clicar,
 * faz POST em /api/admin/conversas/[id]/toggle-hidden para alternar.
 *
 * Stop propagation no <summary> pai: o clique no chip nunca expande a row.
 */
export function ToggleHiddenButton({
  id,
  initialHidden,
}: {
  id: string
  initialHidden: boolean
}) {
  const [hidden, setHidden] = useState(initialHidden)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(
        `/api/admin/conversas/${encodeURIComponent(id)}/toggle-hidden`,
        {
          method: "POST",
          credentials: "same-origin",
        }
      )
      if (!res.ok) {
        return
      }
      const data = (await res.json()) as { is_hidden?: boolean }
      if (typeof data.is_hidden === "boolean") {
        setHidden(data.is_hidden)
        // Refresca os dados do server component pra refletir filtros futuros.
        router.refresh()
      }
    } catch {
      // Silencioso; estado local não muda.
    } finally {
      setBusy(false)
    }
  }

  const label = hidden ? "Escondida" : "Pública"
  const title = hidden
    ? "Conversa escondida do feed público. Clique para mostrar."
    : "Conversa visível em /perguntas-ao-mundo. Clique para esconder."

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={title}
      aria-label={title}
      className="shrink-0 rounded-full px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-50"
      style={{
        background: hidden
          ? "color-mix(in oklch, red 30%, var(--background))"
          : "color-mix(in oklch, var(--foreground) 8%, transparent)",
        color: hidden
          ? "var(--foreground)"
          : "var(--muted-foreground)",
        border: hidden
          ? "1px solid color-mix(in oklch, red 50%, transparent)"
          : "1px solid var(--border)",
      }}
    >
      {busy ? "…" : label}
    </button>
  )
}
