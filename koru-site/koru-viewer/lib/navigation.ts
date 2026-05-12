// Centralized navigation data — single source of truth
// Import from here instead of duplicating arrays across components and pages.

export const BIBLIA_ITEMS = [
  { slug: "manifesto", title: "Manifesto" },
  { slug: "parte-00", title: "Introdução · A Língua de Korú" },
  { slug: "parte-01", title: "Física · A Natureza do Akwu" },
  { slug: "parte-02", title: "Geografia · Ikwe e seus Lugares" },
  { slug: "parte-03", title: "Ecossistema · O Ciclo da Memória" },
  { slug: "parte-04", title: "Criaturas · Os Seres de Korú" },
  { slug: "parte-05", title: "Personagens · Quem Habita" },
  { slug: "parte-06", title: "Regras · Os 13 Acordos" },
  { slug: "parte-07", title: "Cultura · Como se Vive" },
  { slug: "parte-08", title: "Linha do Tempo · As Seis Eras" },
  { slug: "glossario-de-koru", title: "Glossário de Korú" },
  { slug: "glossario-de-lugares", title: "Glossário de Lugares" },
]

export const LIVRO_ITEMS = [
  { slug: "01", title: "O que ela é" },
  { slug: "02", title: "A mentira silenciosa" },
  { slug: "03", title: "O que a floresta guarda" },
  { slug: "04", title: "O projeto do fim do luto" },
  { slug: "05", title: "O limiar como morada" },
  { slug: "06", title: "O que ela paga" },
  { slug: "epilogo", title: "Epílogo" },
]

export const CONTOS_ITEMS = [
  { slug: "temiku", title: "Temiku · Conto de Origem" },
  { slug: "amara", title: "Amara · Conto de Origem" },
  { slug: "oruku", title: "Oruku · Conto de Origem" },
  { slug: "beku", title: "Beku · Conto de Contexto" },
  { slug: "obaru", title: "Obaru · Conto de Contexto" },
  { slug: "kemdi", title: "Kemdi · Conto de Contexto" },
  { slug: "orike", title: "Orike · Conto Especial" },
  { slug: "kairo", title: "Kairo · Conto de Origem" },
]

export const PERSONAGENS_ITEMS = [
  { slug: "temiku", title: "Temiku" },
  { slug: "amara", title: "Amara" },
  { slug: "oruku", title: "Oruku" },
  { slug: "beku", title: "Beku" },
  { slug: "obaru", title: "Obaru" },
  { slug: "kemdi", title: "Kemdi" },
  { slug: "orike", title: "Orike" },
]

// Banner config for hero banners — fallbackHue drives the gradient when no image exists
export const BANNER_CONFIG: Record<
  string,
  { fallbackHue: number; videoSrc?: string; imageSrc?: string }
> = {
  "manifesto": { fallbackHue: 30 },
  "parte-00": { fallbackHue: 65 },
  "parte-01": { fallbackHue: 290 },
  "parte-02": { fallbackHue: 140 },
  "parte-03": { fallbackHue: 120 },
  "parte-04": { fallbackHue: 35 },
  "parte-05": { fallbackHue: 220 },
  "parte-06": { fallbackHue: 75 },
  "parte-07": { fallbackHue: 310 },
  "parte-08": { fallbackHue: 50 },
  "glossario-de-koru": { fallbackHue: 200 },
  "glossario-de-lugares": { fallbackHue: 160 },
}
