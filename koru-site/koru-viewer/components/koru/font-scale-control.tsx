"use client"

import { useEffect, useState } from "react"

const LEVELS: readonly number[] = [0.9, 1, 1.15]
const DEFAULT_SCALE = 1
const STORAGE_KEY = "koru-font-scale"

function applyScale(scale: number) {
  document.documentElement.style.setProperty("--reading-scale", String(scale))
}

/**
 * Controle A− / A+ do tamanho do texto de leitura.
 * Persiste em localStorage (`koru-font-scale`) e aplica via CSS var
 * `--reading-scale` no <html> — consumida em app/globals.css.
 * Aplica o valor salvo no mount (o controle vive no layout do viewer,
 * então roda cedo em todas as páginas de leitura).
 */
export function FontScaleControl() {
  const [scale, setScale] = useState<number>(DEFAULT_SCALE)

  useEffect(() => {
    let stored = DEFAULT_SCALE
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw !== null) {
        const parsed = Number(raw)
        if (LEVELS.includes(parsed)) stored = parsed
      }
    } catch {
      /* localStorage indisponível — usa default */
    }
    setScale(stored)
    applyScale(stored)
  }, [])

  function update(next: number) {
    setScale(next)
    applyScale(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next))
    } catch {
      /* persistência indisponível — segue só em memória */
    }
  }

  const idx = LEVELS.indexOf(scale)
  const btnClass =
    "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 font-sans transition-colors " +
    // Área de toque ≥40px sem alterar o visual (pseudo-elemento expandido)
    "relative before:absolute before:-inset-1.5 before:content-[''] " +
    "text-muted-foreground hover:bg-[var(--admin-hover)] hover:text-foreground " +
    "disabled:opacity-30 disabled:pointer-events-none"

  return (
    <div className="flex items-center" role="group" aria-label="Tamanho do texto">
      <button
        type="button"
        className={`${btnClass} text-[11px]`}
        aria-label="Diminuir tamanho do texto"
        title="Diminuir tamanho do texto"
        disabled={idx <= 0}
        onClick={() => update(LEVELS[Math.max(0, idx - 1)])}
      >
        A−
      </button>
      <button
        type="button"
        className={`${btnClass} text-[13px]`}
        aria-label="Aumentar tamanho do texto"
        title="Aumentar tamanho do texto"
        disabled={idx >= LEVELS.length - 1}
        onClick={() => update(LEVELS[Math.min(LEVELS.length - 1, idx + 1)])}
      >
        A+
      </button>
    </div>
  )
}
