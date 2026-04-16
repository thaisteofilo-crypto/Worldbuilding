// Glossary of key Korú world terms.
// Sourced from koru-ecosystem-briefing.md (v2.0).

export type GlossaryEntry = {
  term: string
  aliases?: string[]
  definition: string
  category?: 'fisica' | 'criatura' | 'personagem' | 'lugar' | 'fenomeno'
}

export const GLOSSARY: GlossaryEntry[] = [
  // === FÍSICA ===
  { term: 'Akwu', definition: 'Câmara fechada que contém Korú. Teto interno emite luz e regula ciclos de memória.', category: 'fisica' },
  { term: 'Ngurui', definition: 'Gravidade-pulso de Korú. Pulsa como batimento cardíaco lento, mais intenso no Asa Temu.', category: 'fisica' },
  { term: 'Zoeji', definition: 'Tempo espiral de Korú. O passado dobra sobre o presente, ancestrais estão ao redor em outra frequência.', category: 'fenomeno' },
  { term: 'Oru', definition: 'Luz âmbar-dourada do teto do Akwu. Sensação de tarde de verão.', category: 'fisica' },
  { term: 'Temu', definition: 'Luz lilás-fria do teto do Akwu. Clareza estranha: tudo visível, nada aquecido.', category: 'fisica' },
  { term: 'Luz Limiar', definition: 'Frequência emitida pelos Azuris. Não ilumina, altera a frequência do ar ao redor.', category: 'fisica' },

  // === ECOSSISTEMA ===
  { term: 'Bomi Veh', aliases: ['campo de Bomi'], definition: 'Solo-memória de Korú. Cinco estados: vivo (lilás), solidificado, preto, cinza permanente, azul-frio.', category: 'fenomeno' },
  { term: 'Asa', aliases: ['Asas'], definition: 'Estados afetivos do mundo que a ecologia segue. Quatro: Mwanga, Rimbi, Temu, Nkosi.', category: 'fenomeno' },
  { term: 'Mwanga', definition: 'Asa da claridade e expansão. Teto em Oru pleno, Ngurui leve. Asa dos encontros e do Nyame-jo.', category: 'fenomeno' },
  { term: 'Rimbi', definition: 'Asa da interioridade. Chuva densa, Bomi Veh em absorção máxima. Tempo de histórias e luto cotidiano.', category: 'fenomeno' },
  { term: 'Nkosi', definition: 'Asa da transição. Teto dinâmico, Ngurui irregular. Sementes de Arikus dispersas, reuniões entre Chi-Oa.', category: 'fenomeno' },
  { term: 'Nguvu-Chi', definition: 'Extração sustentável de frequência de superfície dos Ubomi-chis. Reversível, com tempo de recuperação.', category: 'fenomeno' },
  { term: 'Mwanga-ji', definition: 'Extração corrompida que arranca memória-núcleo dos Ubomi-chis. Irreversível, mata a colônia.', category: 'fenomeno' },

  // === CRIATURAS ===
  { term: 'Onkweri', aliases: ['Onkweris'], definition: 'Corporificação da memória da terra. Bomi Veh solidificado com intenção de forma. Quadrúpede com chifres.', category: 'criatura' },
  { term: 'Azuri', aliases: ['Azuris'], definition: 'Tradutores de limiar. Quadrúpedes cervídeos que emitem Luz Limiar e medeiam memória entre vivos e Arikus.', category: 'criatura' },
  { term: 'Ariku', aliases: ['Arikus'], definition: 'Colunas vegetais, arquivo vivo de memória e mediadoras do sistema de luz. Categoria distinta de ser.', category: 'criatura' },
  { term: 'Ubomi-chi', aliases: ['Ubomi-chis'], definition: 'Rede nervosa da floresta. Organismo fúngico com memória distribuída, invisível à visão direta.', category: 'criatura' },
  { term: 'Nkosi-ha', aliases: ['Nkosi-has'], definition: 'Grandes aves sem penas, ossos translúcidos. Marcadores biológicos de limiar, presença anuncia transição.', category: 'criatura' },

  // === LUGARES ===
  { term: 'Ikwe', definition: 'Continente habitado de Korú. Nome relacional, nomeia o ato de habitar, não a massa de terra.', category: 'lugar' },
  { term: 'Rimba Ngozi', definition: 'Floresta sagrada. Filtro de luz e arquivo vivo. Dossel de Arikus entre teto e chão.', category: 'lugar' },
  { term: 'Orunjó', aliases: ['Orunjo'], definition: 'O maior Chi-Oa de Korú, atrás do Rimba Ngozi. O céu que dança.', category: 'lugar' },
  { term: 'Chi-Oa', definition: 'Unidade de habitação. Comunidade em mandala-espiral ao redor de núcleo comunitário.', category: 'lugar' },
  { term: 'Bomi-Weh', definition: 'Planícies abertas de Ikwe, sem dossel de Arikus. Teto do Akwu visível diretamente.', category: 'lugar' },
  { term: 'Jobi-Ariku', definition: 'Estruturas habitadas de Orunjó, paredes de pedra escura com colônias vivas de Ubomi-chis.', category: 'lugar' },
  { term: 'Jobi-Koro', definition: 'Ruínas da Era IV. Bomi Veh cinza-permanente, limiar cronicamente aberto. Memórias em pé.', category: 'lugar' },
  { term: 'Ima-ri', definition: 'Clareira próxima a Arikus usada como espaço de aprendizado. Conhecimento transmitido por contato da testa.', category: 'lugar' },
  { term: 'Njia-Kwe', definition: 'Rotas invisíveis de frequência entre Chi-Oa. Encurtam a experiência de distância, não a distância física.', category: 'lugar' },
  { term: 'Círculo Azul-Frio', definition: 'Sub-local do Rimba Ngozi onde o Bomi Veh permanece azul-frio. Marca da dissolução de Amara + Oruku.', category: 'lugar' },
  { term: 'Nzu-Chi', definition: 'Chi-Oa de conhecimento na borda leste do Rimba Ngozi. Alta concentração de Ima-Kwe.', category: 'lugar' },
  { term: 'Omi-Kwe', definition: 'Chi-Oa de passagem nas planícies do Bomi-Weh. Alta rotatividade de nômades.', category: 'lugar' },

  // === CULTURA & INSTITUIÇÕES ===
  { term: 'Isilo-Ori', aliases: ['marca de Isilo'], definition: 'Marca na testa e bordas dos olhos. Toque de eleição de Azuri, altera a frequência na substância base.', category: 'fenomeno' },
  { term: 'Oa-Chi', definition: 'Conselho que governa por escuta. Reúne Orime, Isilo-Ori e Ima-Kwe.', category: 'fenomeno' },
  { term: 'Orime', definition: 'Representante eleito por cada Chi-Oa para o Oa-Chi. Porta-voz, não governante.', category: 'fenomeno' },
  { term: 'Ima-Kwe', definition: 'Guardiões do conhecimento. Únicos autorizados em Jobi-Koro com preparação formal.', category: 'fenomeno' },
  { term: 'Nyame-jo', definition: 'Celebração coletiva do Asa Mwanga. Criaturas convergem nas planícies para acordos e trocas.', category: 'fenomeno' },
  { term: 'Kanda', definition: 'Tubérculo cujo sabor muda conforme o estado emocional de quem prepara.', category: 'fenomeno' },

  // === PERSONAGENS ===
  { term: 'Temiku', definition: 'Híbrida Azuri + Onkweri. Origem de evento: Bomi Veh saturado por Amara + Oruku. Equilíbrio instável.', category: 'personagem' },
  { term: 'Amara', definition: 'Onkweri dissolvida. Sua dissolução + Luz Limiar de Oruku originaram Temiku e o Círculo Azul-Frio.', category: 'personagem' },
  { term: 'Oruku', definition: 'Azuri em passagem presa. Frequência sem receptor, fora do ciclo. Nunca aparece visualmente.', category: 'personagem' },
  { term: 'Beku', definition: 'Onkweri mais velho, Orime de Orunjó. Antagonista político, lidera o projeto Mwanga-ji.', category: 'personagem' },
  { term: 'Obaru', definition: 'Onkweri Ima-Kwe, aliado relutante. Corpo denso, postura fechada, carvão-escuro sem variação.', category: 'personagem' },
  { term: 'Kemdi', definition: 'Onkweri jovem, Isilo-Ori eleita. Única do elenco sem postura de defesa.', category: 'personagem' },
  { term: 'Temi', definition: 'Onkweri nômade. Textura irregular de lugares sobrepostos, movimento fluido.', category: 'personagem' },
  { term: 'Orike', definition: 'A Ariku mais antiga do Rimba Ngozi. Carrega memórias da Era I. Ilustrada como lugar.', category: 'personagem' },
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
