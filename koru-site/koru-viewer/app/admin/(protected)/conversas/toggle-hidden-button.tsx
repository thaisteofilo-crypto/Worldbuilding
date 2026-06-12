"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

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
    <Badge
      role="button"
      tabIndex={0}
      onClick={toggle}
      title={title}
      aria-label={title}
      variant="outline"
      className="shrink-0 cursor-pointer select-none uppercase tracking-[0.15em] text-[10px] transition-opacity hover:opacity-80 disabled:opacity-50"
      style={
        hidden
          ? {
              background: "color-mix(in oklch, var(--destructive) 15%, transparent)",
              color: "var(--destructive)",
              borderColor: "color-mix(in oklch, var(--destructive) 40%, transparent)",
            }
          : {
              background: "color-mix(in oklch, var(--foreground) 8%, transparent)",
              color: "var(--muted-foreground)",
              borderColor: "hsl(var(--border-shadcn))",
            }
      }
      aria-disabled={busy}
    >
      {busy ? "…" : label}
    </Badge>
  )
}
