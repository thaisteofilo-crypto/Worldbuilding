// Glossary of key Korú world terms.
// Sourced from koru-ecosystem-briefing.md (v2.0).

export type GlossaryCategory =
  | "cosmologia"
  | "geografia"
  | "criaturas"
  | "cultura"
  | "luz"
  | "tempo"

export interface GlossaryTerm {
  term: string
  definition: string
  category: GlossaryCategory
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "Akwu",
    definition:
      "A camara fechada que constitui o universo de Koru. Nao foi criado por entidade — aconteceu como evento cosmologico. Sustenta seu proprio campo de frequencia, sistema de luz, tempo e ciclo de energia.",
    category: "cosmologia",
  },
  {
    term: "Ngurui",
    definition:
      "O pulso gravitacional de Koru. A gravidade pulsa levemente, como batimento cardiaco lento. Criaturas aprendem a se mover com esse ritmo antes de qualquer outra coisa.",
    category: "cosmologia",
  },
  {
    term: "Zoeji",
    definition:
      "O tempo espiral de Koru. O passado dobra sobre o presente — os ancestrais nao estao atras no tempo, estao ao redor, em outra frequencia.",
    category: "tempo",
  },
  {
    term: "Ariku",
    definition:
      "Arquivo vivo. Colunas vegetais verticais de tronco carvao-escuro com interior vermelho-sangue. Filtram e redistribuem a luz do teto do Akwu pelo dossel. Cada Ariku e um arquivo: os Ubomi-chi em suas raizes registram tudo.",
    category: "criaturas",
  },
  {
    term: "Azuri",
    definition:
      "Criaturas de limiar. Cervideo longo e leve, quadrupede com chifres geometricos ramificados. Traduzem memoria entre vivos e Ariku. Sua Luz Limiar altera a frequencia do ar, nao ilumina.",
    category: "criaturas",
  },
  {
    term: "Onkweri",
    definition:
      "Corporificacao viva da memoria da terra — Bomi Veh solidificado com intencao de forma. Quadrupedes robustos com chifres curvados como raizes mineralizadas. Memoria nao e algo que possuem — e aquilo do que sao feitos.",
    category: "criaturas",
  },
  {
    term: "Bomi Veh",
    definition:
      "O solo-memoria de Koru. Possui cinco estados: vivo (lilas, processando), solidificado (denso — os Onkweri sao este estado), preto (morto, irreversivel), cinza permanente (Jobi-Koro), e azul-frio (caso unico de Amara).",
    category: "cosmologia",
  },
  {
    term: "Isilo-Ori",
    definition:
      "Marca de eleicao que aparece na testa e nas bordas dos olhos de um Onkweri apos toque intencional de um Azuri. Transformacao irreversivel. Portadores aconselham e medeiam entre Azuri e Onkweri.",
    category: "cultura",
  },
  {
    term: "Ikwe",
    definition:
      "O continente habitado de Koru. A nomenclatura e relacional — nao e o nome de uma massa de terra, e o nome do ato de habita-la.",
    category: "geografia",
  },
  {
    term: "Rimba Ngozi",
    definition:
      "A floresta sagrada. Ariku de tronco carvao-escuro, chao de Bomi Veh lilas-rosado com fosforescencia horizontal suave. Contem o circulo azul-frio onde Amara se dissolveu.",
    category: "geografia",
  },
  {
    term: "Orunjo",
    definition:
      "A cidade principal, localizada atras da floresta. Arquitetura de blocos geometricos que crescem como cristal, com Ubomi-chi pulsando nas paredes. Nao e capital — e o Chi-Oa maior.",
    category: "geografia",
  },
  {
    term: "Jobi-Koro",
    definition:
      "Ruinas da Era IV, chamadas localmente de memorias em pe. Bomi Veh cinza permanente, Zoeji colapsado — passado e presente simultaneos. Entrar sem preparacao e entrar em colapso temporal.",
    category: "geografia",
  },
  {
    term: "Oa-Chi",
    definition:
      "Conselho que governa por escuta, nao por decreto. Composto por Orime (porta-voz eleito por cada Chi-Oa) e Isilo-Ori (conselheiros, mediadores).",
    category: "cultura",
  },
  {
    term: "Ima-ri",
    definition:
      "Clareiras proximas a Ariku com grandes colonias de Ubomi-chi, usadas para transmissao de conhecimento. Aprendizado por contato com as Ariku — encostar a testa na casca transmite impressoes.",
    category: "cultura",
  },
  {
    term: "Asa",
    definition:
      "Estacoes de Koru, determinadas pelo estado do teto do Akwu. Quatro periodos: Mwanga (dourado, expansao), Rimbi (cinza umido, interioridade), Temu (lilas frio, silencio ritual) e Nkosi (dinamico, mudanca).",
    category: "tempo",
  },
  {
    term: "Ubomi-chi",
    definition:
      "Rede nervosa da floresta. Organismo fungico com memoria distribuida, invisivel a visao direta. Representados como filamentos lilas bioluminescentes nas raizes das Ariku.",
    category: "criaturas",
  },
  {
    term: "Nkosi-ha",
    definition:
      "Criaturas de transicao, marcadoras de limiar biologico. Grandes aves sem penas com ossos translucidos. Movimento absolutamente silencioso. Presentes em momentos de morte e nascimento.",
    category: "criaturas",
  },
  {
    term: "Kanda",
    definition:
      "Tuberculo que muda de sabor conforme o estado emocional de quem o prepara. Cozinhar e pratica de autorregulacao — raiva produz sabor amargo-metalico, afeto produz doce com fundo complexo.",
    category: "cultura",
  },
  {
    term: "Luz Oru",
    definition:
      "Luz ambar-dourada emitida pelo teto do Akwu em estado Oru. Amplificada e suavizada pelas Ariku, cria luz dappled no chao da floresta. Sensacao de tarde de verao em floresta densa.",
    category: "luz",
  },
  {
    term: "Luz Temu",
    definition:
      "Luz lilas fria e profunda do teto do Akwu em estado Temu. Filtragem reduzida pelas Ariku resulta em luz mais dura, direcional, com sombras marcadas. Clareza estranha — tudo visivel, nada aquecido.",
    category: "luz",
  },
  {
    term: "Luz Limiar",
    definition:
      "Terceiro tipo de luz, emitida pelos Azuri. Nao ilumina fisicamente nem aquece. Altera a frequencia do que esta ao redor — criaturas ficam mais nitidas, como se o ruido do ar diminuisse.",
    category: "luz",
  },
  {
    term: "Mwanga-ji",
    definition:
      "Extracao predatoria de memoria-nucleo dos Ubomi-chi, destruindo a capacidade da colonia de se reconhecer. Irreversivel. Projeto de Beku para forcar o teto do Akwu ao estado Oru permanente.",
    category: "cultura",
  },
  {
    term: "Bomi-Weh",
    definition:
      "Planicies abertas sem dossel de Ariku, onde o teto do Akwu e visivel diretamente. Usadas para nomadismo, festividades e encontros entre Chi-Oa.",
    category: "geografia",
  },
  {
    term: "Chi-Oa",
    definition:
      "Comunidades em mandala arquitetonica — espiral ao redor de nucleo comunitario. Separacao entre privado e coletivo feita por vegetacao, nao por paredes.",
    category: "cultura",
  },
  {
    term: "Temiku",
    definition:
      "Ser de origem hibrida — emergiu de Bomi Veh saturado simultaneamente pela dissolucao de Amara (Onkweri) e pela Luz Limiar de Oruku (Azuri). Tem origem de evento, nao de lugar. Equilibrio instavel entre luz e densidade.",
    category: "criaturas",
  },
]

// Helper: get terms by category
export function getTermsByCategory(
  category: GlossaryCategory
): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.category === category)
}

// Helper: find a single term
export function findTerm(term: string): GlossaryTerm | undefined {
  const lower = term.toLowerCase()
  return GLOSSARY.find((t) => t.term.toLowerCase() === lower)
}
