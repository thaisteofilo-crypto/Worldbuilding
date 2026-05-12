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
  "section.personagens.description": "Os personagens são as ressonâncias do mundo. Amara, Oruku, Temiku, Beku: cada um carrega uma frequência, uma falha, um eco. Conheça-os antes de entrar nas histórias.",
  "section.biblia.label": "Bíblia do Mundo",
  "section.biblia.title": "O arquivo vivo",
  "section.biblia.description": "A bíblia é a fundação. Aqui o mundo se explica por dentro: a física da memória, os ciclos de luz, as criaturas que habitam o Akwu. Comece por aqui se quiser saber em que terreno está pisando.",
  "section.livro.label": "Livro",
  "section.livro.title": "O Peso da Luz",
  "section.livro.description": "A história de Temiku, em capítulos. O fio longo do mundo, do início ao fim, sem atalho. Leia depois dos contos, ou antes, se preferir o caminho largo primeiro.",
  "section.contos.label": "Contos",
  "section.contos.title": "Vozes do Akwu",
  "section.contos.description": "Cada conto é um corte rente: uma cena, uma decisão, uma perda. Pequenos textos literários que mostram o mundo por dentro de quem o vive. Comece por Amara e siga na ordem, ou escolha o nome que te chamar.",
  "footer.copyright": "Todos os direitos reservados a Thaís Teófilo",
  "biblia.manifesto.title": "Propósito · Manifesto",
  "biblia.parte-00.title": "Introdução · A Língua de Korú",
  "biblia.parte-01.title": "Física · A Natureza do Akwu",
  "biblia.parte-02.title": "Geografia · Ikwe e seus Lugares",
  "biblia.parte-03.title": "Ecossistema · O Ciclo da Memória",
  "biblia.parte-04.title": "Criaturas · Os Seres de Korú",
  "biblia.parte-05.title": "Personagens · Quem Habita",
  "biblia.parte-06.title": "Regras · Os 13 Acordos",
  "biblia.parte-07.title": "Cultura · Como se Vive",
  "biblia.parte-08.title": "Linha do Tempo · As Seis Eras",
  "biblia.glossario-de-koru.title": "Glossário de Korú",
  "biblia.glossario-de-lugares.title": "Glossário de Lugares",
  "livro.01.title": "O que ela é",
  "livro.02.title": "Manhãs",
  "livro.03.title": "A cidade",
  "livro.04.title": "A mentira silenciosa",
  "livro.05.title": "Entre o lilás e o cinza",
  "livro.06.title": "O que a floresta guarda",
  "livro.07.title": "O projeto do fim do luto",
  "livro.08.title": "A chuva",
  "livro.09.title": "O limiar como morada",
  "livro.10.title": "A noite antes",
  "livro.11.title": "O que ela paga",
  "livro.12.title": "O retorno",
  "livro.epilogo.title": "Epílogo",
}

export async function getSiteContent(): Promise<Record<string, string>> {
  // Camadas (mais fraca → mais forte): DEFAULTS → Supabase → arquivo local.
  // O arquivo local vence porque ele é escrito de forma síncrona em todo PATCH
  // do admin, enquanto o upsert no Supabase pode falhar silenciosamente e
  // devolver valor antigo. Mesma regra usada em app/api/site-content/route.ts.
  const result = { ...DEFAULTS }

  // 1. Supabase
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
  } catch { /* ignore — local state é suficiente */ }

  // 2. Arquivo local — sobrescreve Supabase quando há divergência
  const localState = readLocalState()
  for (const [key, value] of Object.entries(localState)) {
    result[key] = value
  }

  return result
}

export function get(content: Record<string, string>, key: string): string {
  return content[key] ?? DEFAULTS[key] ?? ""
}
