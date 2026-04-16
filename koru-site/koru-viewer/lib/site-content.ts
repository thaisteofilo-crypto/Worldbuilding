import { createAdminClient } from "./supabase/admin"
import { readLocalState } from "./local-state"

// Default values — usados como fallback se a tabela não existir ainda
const DEFAULTS: Record<string, string> = {
  "hero.tagline": "Um mundo cuja física é baseada em memória.",
  "hero.cta_primary_text": "Bíblia do Mundo",
  "hero.cta_primary_href": "/biblia/parte-00",
  "hero.cta_secondary_text": "O Livro",
  "hero.cta_secondary_href": "/livro/01",
  "section.personagens.label": "Personagens",
  "section.personagens.title": "Os seres do Akwu",
  "section.biblia.label": "Bíblia do Mundo",
  "section.biblia.title": "O arquivo vivo",
  "section.livro.label": "Livro",
  "section.livro.title": "O Peso da Luz",
  "section.contos.label": "Contos",
  "section.contos.title": "Vozes do Akwu",
  "footer.copyright": "Todos os direitos reservados a Thaís Teófilo",
  "biblia.parte-00.title": "Introdução",
  "biblia.parte-01.title": "Física e Cosmologia",
  "biblia.parte-02.title": "Geografia",
  "biblia.parte-03.title": "Ecossistema",
  "biblia.parte-04.title": "Criaturas",
  "biblia.parte-05.title": "Personagens",
  "biblia.parte-06.title": "Regras",
  "biblia.parte-07.title": "Cultura",
  "biblia.parte-08.title": "Linha do Tempo",
  "livro.01.title": "O que ela é",
  "livro.02.title": "A mentira silenciosa",
  "livro.03.title": "O que a floresta guarda",
  "livro.04.title": "O projeto do fim do luto",
  "livro.05.title": "O limiar como morada",
  "livro.06.title": "O que ela paga",
  "livro.epilogo.title": "Epílogo",
}

export async function getSiteContent(): Promise<Record<string, string>> {
  // Start with defaults, then layer: local file, then Supabase
  const result = { ...DEFAULTS }

  // 1. Local file — always available, fastest
  const localState = readLocalState()
  for (const [key, value] of Object.entries(localState)) {
    result[key] = value
  }

  // 2. Supabase — overrides local if table exists
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from("site_content")
      .select("key, value")

    if (!error && data) {
      for (const row of data) {
        if (row.key && row.value !== null) {
          result[row.key] = row.value
        }
      }
    }
  } catch { /* ignore — local state is sufficient */ }

  return result
}

export function get(content: Record<string, string>, key: string): string {
  return content[key] ?? DEFAULTS[key] ?? ""
}
