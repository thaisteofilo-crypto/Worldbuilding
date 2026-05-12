"use client"

import { usePathname } from "next/navigation"

const SECTION_LABELS: Record<string, string> = {
  biblia: "Bíblia",
  livro: "Livro",
  contos: "Contos",
  personagens: "Personagens",
  briefing: "Referência",
  workflow: "Referência",
}

const ITEM_LABELS: Record<string, string> = {
  // Bíblia
  "parte-00": "Manifesto",
  "parte-01": "Física e Cosmologia",
  "parte-02": "Geografia",
  "parte-03": "Ecossistema",
  "parte-04": "Criaturas",
  "parte-05": "Personagens",
  "parte-06": "Regras",
  "parte-07": "Cultura",
  "parte-08": "Linha do Tempo",
  // Livro
  "01": "I, O que ela é",
  "02": "Capítulo 2",
  "03": "Capítulo 3",
  "04": "Capítulo 4",
  "05": "Capítulo 5",
  "06": "Capítulo 6",
  epilogo: "Epílogo",
  // Personagens / Contos
  temiku: "Temiku",
  amara: "Amara",
  oruku: "Oruku",
  beku: "Beku",
  obaru: "Obaru",
  kemdi: "Kemdi",
  orike: "Orike",
  // Referência
  briefing: "Briefing do Mundo",
  workflow: "Workflow",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const section = SECTION_LABELS[segments[0]]
  const itemKey = segments[1] ?? segments[0]
  const item = ITEM_LABELS[itemKey]

  if (!section && !item) return null

  return (
    <nav
      aria-label="Localização atual"
      className="flex items-center gap-2 text-xs font-sans min-w-0"
    >
      {section && (
        <span
          className="shrink-0"
          style={{ color: "var(--muted-foreground)" }}
        >
          {section}
        </span>
      )}
      {item && section && (
        <span aria-hidden="true" style={{ color: "var(--border)" }}>
          ›
        </span>
      )}
      {item && (
        <span
          className="truncate"
          style={{ color: "var(--foreground)" }}
          aria-current="location"
        >
          {item}
        </span>
      )}
    </nav>
  )
}
