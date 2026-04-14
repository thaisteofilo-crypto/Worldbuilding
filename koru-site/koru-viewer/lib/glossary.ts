// Glossary of key Korú world terms.
// Sourced from koru-ecosystem-briefing.md (v2.0).

export type GlossaryEntry = {
  term: string
  aliases?: string[]
  definition: string
  category?: 'fisica' | 'entidade' | 'lugar' | 'fenomeno'
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Akwu',
    definition: 'A cavidade que contém o mundo. Sua superfície interna emite luz e regula os ciclos de memória.',
    category: 'lugar',
  },
  {
    term: 'Bomi Veh',
    aliases: ['campo de Bomi', 'campo bioluminescente'],
    definition: 'Campo fosforescente lilás onde memórias solidificam. Cinco estados: vivo, solidificado, morto, cinza permanente, azul-frio.',
    category: 'fenomeno',
  },
  {
    term: 'Onkweri',
    definition: 'Seres de memória solidificada — o segundo estado do Bomi Veh. Quadrúpedes com chifres, contato pela testa.',
    category: 'entidade',
  },
  {
    term: 'Azuri',
    definition: 'Quadrúpedes com chifres portadores da Luz Limiar. Alteram frequência de memória ao redor, não iluminam.',
    category: 'entidade',
  },
  {
    term: 'Isilo-Ori',
    aliases: ['marca de Isilo'],
    definition: 'Marca que aparece na testa e bordas dos olhos. Sinal de vínculo profundo com o ciclo de memória.',
    category: 'fenomeno',
  },
  {
    term: 'Luz Limiar',
    definition: 'Frequência emitida pelos Azuri. Não ilumina — altera o estado das memórias ao redor.',
    category: 'fisica',
  },
  {
    term: 'Oru',
    definition: 'Luz dourada do teto do Akwu. Ciclo diurno de consolidação de memórias.',
    category: 'fisica',
  },
  {
    term: 'Temu',
    definition: 'Luz lilás-fria do teto do Akwu. Ciclo noturno, favorece o processamento de memórias instáveis.',
    category: 'fisica',
  },
  {
    term: 'Ubomi-chi',
    definition: 'Memórias extintas — terceiro estado do Bomi Veh. Irreversíveis sem intervenção externa.',
    category: 'fenomeno',
  },
  {
    term: 'Jobi-Koro',
    definition: 'Cinza permanente — quarto estado do Bomi Veh. Resultado de violação do ciclo de memória.',
    category: 'fenomeno',
  },
  {
    term: 'Ariku',
    aliases: ['Arikus'],
    definition: 'Estruturas que filtram e redistribuem lateralmente a luz do teto do Akwu.',
    category: 'entidade',
  },
  {
    term: 'Temiku',
    definition: 'Ser de origem híbrida: emergiu do Bomi Veh saturado por dissolução de Amara e Luz Limiar de Oruku. Equilíbrio instável entre solidificação e dissolução.',
    category: 'entidade',
  },
  {
    term: 'Ngurui',
    definition: 'O pulso gravitacional de Korú. A gravidade pulsa levemente, como batimento cardíaco lento.',
    category: 'fisica',
  },
  {
    term: 'Zoeji',
    definition: 'O tempo espiral de Korú. O passado dobra sobre o presente — os ancestrais estão ao redor, em outra frequência.',
    category: 'fenomeno',
  },
  {
    term: 'Rimba Ngozi',
    definition: 'A floresta sagrada. Chão de Bomi Veh lilás-rosado, contém o círculo azul-frio onde Amara se dissolveu.',
    category: 'lugar',
  },
  {
    term: 'Orunjo',
    definition: 'A cidade principal. Arquitetura de blocos geométricos com Ubomi-chi pulsando nas paredes.',
    category: 'lugar',
  },
  {
    term: 'Nkosi-ha',
    definition: 'Grandes aves sem penas com ossos translúcidos. Presentes em momentos de morte e nascimento, movimento absolutamente silencioso.',
    category: 'entidade',
  },
  {
    term: 'Mwanga-ji',
    definition: 'Extração predatória de memória-núcleo dos Ubomi-chi, destruindo a capacidade da colônia de se reconhecer. Irreversível.',
    category: 'fenomeno',
  },
  {
    term: 'Ikwe',
    definition: 'O continente habitado de Korú. Nome relacional — não designa uma massa de terra, mas o ato de habitá-la.',
    category: 'lugar',
  },
  {
    term: 'Chi-Oa',
    definition: 'Comunidades em mandala arquitetônica — espiral ao redor de núcleo comunitário.',
    category: 'lugar',
  },
]

export function getGlossaryEntry(word: string): GlossaryEntry | undefined {
  const lower = word.toLowerCase()
  return GLOSSARY.find(
    (e) => e.term.toLowerCase() === lower || e.aliases?.some((a) => a.toLowerCase() === lower)
  )
}

// Legacy helpers kept for backward compatibility
export function getTermsByCategory(category: GlossaryEntry['category']): GlossaryEntry[] {
  return GLOSSARY.filter((t) => t.category === category)
}

export function findTerm(term: string): GlossaryEntry | undefined {
  return getGlossaryEntry(term)
}
