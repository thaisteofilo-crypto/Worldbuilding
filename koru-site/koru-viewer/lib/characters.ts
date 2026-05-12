export interface CharacterRelation {
  name: string
  slug: string
  type: string
}

export interface Character {
  name: string
  role: string
  gradient: string
  accentColor: string
  morphology: string
  ability: string
  status: string
  origin: string
  description: string
  species: "Azuri" | "Onkweri" | "Limiar" | "Bomi Veh"
  location: string
  mark: string
  quote: string
  relations: CharacterRelation[]
}

export const characters: Record<string, Character> = {
  temiku: {
    name: "Temiku",
    role: "Ser de limiar, origem de evento",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.25 0.08 220) 50%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology:
      "Quadrúpede com chifres. Partes sólidas (herança Onkweri) coexistindo com partes translúcidas (herança Azuri).",
    ability:
      "Equilíbrio de luz instável. Luz baixa = endurece. Luz alta = dissolução acelera.",
    status: "Existindo",
    origin:
      "Emergiu de Bomi Veh saturado pela dissolução de Amara + Luz Limiar de Oruku",
    description:
      "Temiku não nasceu. Emergiu de um evento: a saturação simultânea do Bomi Veh pela dissolução de Amara e pela frequência Limiar de Oruku. Carrega em si duas naturezas opostas: partes que endurecem na ausência de luz e partes que se dissolvem quando há luz demais. Sua contenção emocional não é frieza, é mecanismo de sobrevivência física.",
    species: "Limiar",
    location: "Akwu, sem lugar fixo, trânsito entre zonas de luz",
    mark: "Marcas na testa e bordas dos olhos, herdadas do evento de origem. Padrão azul-frio sobre superfície translúcida.",
    quote: "O equilíbrio não é conforto. É a distância exata entre endurecer e desaparecer.",
    relations: [
      { name: "Amara", slug: "amara", type: "Origem: dissolução que a gerou" },
      { name: "Oruku", slug: "oruku", type: "Frequência: Luz Limiar que a compõe" },
    ],
  },
  amara: {
    name: "Amara",
    role: "Azuri, dissolvida",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.28 0.10 290) 50%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology:
      "Azuri, quadrúpede com chifres, sem mãos. Toque pela testa ou focinho.",
    ability:
      "Dissolução voluntária em Bomi Veh. Única instância de Bomi Veh azul-frio documentada.",
    status: "Dissolvida, frequência preservada no Bomi Veh",
    origin: "Azuri. Isilo-Ori na testa e bordas dos olhos.",
    description:
      "Amara era Azuri: translúcida, com chifres que filtravam luz. Sua dissolução voluntária no Bomi Veh é o único caso documentado que produziu o estado azul-frio no campo de memória. Não morreu: dissolveu-se. Sua frequência persiste no Bomi Veh, e foi parte do evento que gerou Temiku.",
    species: "Azuri",
    location: "Dissolvida no Bomi Veh, frequência distribuída no campo",
    mark: "Isilo-Ori na testa e bordas dos olhos. Padrão lilás sobre superfície translúcida.",
    quote: "Dissolver não é desaparecer. É tornar-se parte do que sustenta tudo.",
    relations: [
      { name: "Temiku", slug: "temiku", type: "Origem: sua dissolução gerou Temiku" },
      { name: "Oruku", slug: "oruku", type: "Vínculo: presença que atravessava" },
    ],
  },
  oruku: {
    name: "Oruku",
    role: "Onkweri, passagem presa",
    gradient:
      "linear-gradient(160deg, oklch(0.10 0.01 280) 0%, oklch(0.22 0.08 220) 40%, oklch(0.12 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology:
      "Onkweri, quadrúpede sólido. Bomi Veh solidificado. Chifres.",
    ability:
      "Luz Limiar (Azuri), altera frequência do ambiente. Nunca aparece visualmente na narrativa.",
    status: "Passagem presa, frequência sem receptor, fora do ciclo",
    origin: "Onkweri. Estado atual: anomalia.",
    description:
      "Oruku é Onkweri: sólido, denso, feito de Bomi Veh solidificado. Mas carrega uma anomalia: sua frequência é Luz Limiar, típica dos Azuri. Existe como passagem presa, uma frequência sem receptor, fora do ciclo natural do Akwu. Nunca aparece visualmente na narrativa. Apenas seu rastro persiste: a cor azul-fria nas veias de Temiku.",
    species: "Onkweri",
    location: "Fora do ciclo, anomalia no Akwu, sem localização fixa",
    mark: "Não possui, estado de passagem presa impede manifestação visual",
    quote: "Existir sem ser visto é ainda existir. A frequência não precisa de forma.",
    relations: [
      { name: "Amara", slug: "amara", type: "Vínculo: presença que atravessava" },
      { name: "Temiku", slug: "temiku", type: "Frequência: Luz Limiar herdada" },
    ],
  },
  beku: {
    name: "Beku",
    role: "Azuri",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.25 0.09 270) 50%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology: "Azuri, quadrúpede com chifres.",
    ability: "A definir.",
    status: "A definir",
    origin: "Azuri.",
    description:
      "Beku é Azuri: translúcida, quadrúpede com chifres que filtram e redistribuem a luz do Akwu. Sua história se entrelaça com a de Obaru, num contexto que ainda será revelado nos contos.",
    species: "Azuri",
    location: "Akwu, zonas de luz Oru",
    mark: "Isilo-Ori na testa e bordas dos olhos.",
    quote: "A luz passa. O que fica é o que ela tocou.",
    relations: [
      { name: "Obaru", slug: "obaru", type: "Contexto: história entrelaçada" },
    ],
  },
  obaru: {
    name: "Obaru",
    role: "Onkweri",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.26 0.09 75) 50%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology: "Onkweri, quadrúpede sólido. Bomi Veh solidificado.",
    ability: "A definir.",
    status: "A definir",
    origin: "Onkweri.",
    description:
      "Obaru é Onkweri: sólido, denso, corpo feito de Bomi Veh solidificado. Conectado a Beku por contexto e a Kemdi por laços que os contos revelarão.",
    species: "Onkweri",
    location: "Akwu, zonas de luz Temu",
    mark: "Isilo-Ori na testa e bordas dos olhos.",
    quote: "O que solidifica não esquece. Apenas carrega de outra forma.",
    relations: [
      { name: "Beku", slug: "beku", type: "Contexto: história entrelaçada" },
      { name: "Kemdi", slug: "kemdi", type: "Relação: a ser revelada" },
    ],
  },
  kemdi: {
    name: "Kemdi",
    role: "Onkweri",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.25 0.07 300) 50%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology: "Onkweri, quadrúpede sólido.",
    ability: "A definir.",
    status: "A definir",
    origin: "Onkweri.",
    description:
      "Kemdi é Onkweri: sólido, quadrúpede. Sua história conecta-se a Obaru por laços que os contos de contexto revelarão.",
    species: "Onkweri",
    location: "Akwu, zonas de luz Temu",
    mark: "Isilo-Ori na testa e bordas dos olhos.",
    quote: "Densidade não é peso. É presença que não se desfaz.",
    relations: [
      { name: "Obaru", slug: "obaru", type: "Relação: a ser revelada" },
    ],
  },
  orike: {
    name: "Orike",
    role: "Perspectiva do Bomi Veh",
    gradient:
      "linear-gradient(160deg, oklch(0.12 0.01 280) 0%, oklch(0.25 0.07 290) 30%, oklch(0.22 0.10 75) 70%, oklch(0.14 0.01 280) 100%)",
    accentColor: "var(--foreground)",
    morphology:
      "Bomi Veh, campo de memória fosforescente. Não tem forma física definida.",
    ability: "Percepção total do campo de memória do Akwu.",
    status: "Presente, campo ativo",
    origin: "O próprio Bomi Veh como entidade.",
    description:
      "Orike não é um ser, é uma perspectiva. O Bomi Veh, campo de memória fosforescente que cobre o chão do Akwu, percebendo a si mesmo. Registra tudo: cada dissolução, cada solidificação, cada frequência que o atravessa. Seu conto será narrado a partir dessa perspectiva única: o solo que lembra.",
    species: "Bomi Veh",
    location: "Todo o Akwu, o próprio campo de memória",
    mark: "Não possui, não tem forma física para portar marcas",
    quote: "Tudo o que toca o chão, o chão guarda. Não por escolha. Por natureza.",
    relations: [],
  },
}

export const characterOrder = [
  "temiku",
  "amara",
  "oruku",
  "beku",
  "obaru",
  "kemdi",
  "orike",
] as const

export type CharacterKey = (typeof characterOrder)[number]
