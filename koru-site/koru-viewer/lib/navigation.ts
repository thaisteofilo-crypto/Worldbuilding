// Centralized navigation data — single source of truth
// Import from here instead of duplicating arrays across components and pages.

export const BIBLIA_ITEMS = [
  { slug: "parte-00", title: "Introdução" },
  { slug: "parte-01", title: "Física e Cosmologia" },
  { slug: "parte-02", title: "Geografia" },
  { slug: "parte-03", title: "Ecossistema" },
  { slug: "parte-04", title: "Criaturas" },
  { slug: "parte-05", title: "Personagens" },
  { slug: "parte-06", title: "Regras" },
  { slug: "parte-07", title: "Cultura" },
  { slug: "parte-08", title: "Linha do Tempo" },
]

export const LIVRO_ITEMS = [
  { slug: "01", title: "Capítulo 1" },
  { slug: "02", title: "Capítulo 2" },
  { slug: "03", title: "Capítulo 3" },
  { slug: "04", title: "Capítulo 4" },
  { slug: "05", title: "Capítulo 5" },
  { slug: "06", title: "Capítulo 6" },
  { slug: "epilogo", title: "Epílogo" },
]

export const CONTOS_ITEMS = [
  { slug: "temiku", title: "Temiku" },
  { slug: "amara", title: "Amara" },
  { slug: "oruku", title: "Oruku" },
  { slug: "beku", title: "Beku" },
  { slug: "obaru", title: "Obaru" },
  { slug: "kemdi", title: "Kemdi" },
  { slug: "orike", title: "Orike" },
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
  "parte-00": { fallbackHue: 65 },
  "parte-01": { fallbackHue: 290 },
  "parte-02": { fallbackHue: 140 },
  "parte-03": { fallbackHue: 120 },
  "parte-04": { fallbackHue: 35 },
  "parte-05": { fallbackHue: 220 },
  "parte-06": { fallbackHue: 75 },
  "parte-07": { fallbackHue: 310 },
  "parte-08": { fallbackHue: 50 },
}
