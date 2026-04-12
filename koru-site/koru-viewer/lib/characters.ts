export interface Character {
  name: string
  role: string
  gradient: string
  accentColor: string
  morphology: string
  ability: string
  status: string
  origin: string
}

export const characters: Record<string, Character> = {
  temiku: {
    name: "Temiku",
    role: "Ser de limiar — origem de evento",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.06 220) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--blue-cold)",
    morphology:
      "Quadrúpede com chifres. Partes sólidas (herança Onkweri) coexistindo com partes translúcidas (herança Azuri).",
    ability:
      "Equilíbrio de luz instável. Luz baixa = endurece. Luz alta = dissolução acelera.",
    status: "Existindo",
    origin:
      "Emergiu de Bomi Veh saturado pela dissolução de Amara + Luz Limiar de Oruku",
  },
  amara: {
    name: "Amara",
    role: "Azuri — dissolvida",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.22 0.08 290) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--accent)",
    morphology:
      "Azuri — quadrúpede com chifres, sem mãos. Toque pela testa ou focinho.",
    ability:
      "Dissolução voluntária em Bomi Veh. Única instância de Bomi Veh azul-frio documentada.",
    status: "Dissolvida — frequência preservada no Bomi Veh",
    origin: "Azuri. Isilo-Ori na testa e bordas dos olhos.",
  },
  oruku: {
    name: "Oruku",
    role: "Onkweri — passagem presa",
    gradient:
      "linear-gradient(160deg, oklch(0.05 0.008 280) 0%, oklch(0.15 0.06 220) 40%, oklch(0.08 0.008 280) 100%)",
    accentColor: "var(--blue-cold)",
    morphology:
      "Onkweri — quadrúpede sólido. Bomi Veh solidificado. Chifres.",
    ability:
      "Luz Limiar (Azuri) — altera frequência do ambiente. Nunca aparece visualmente na narrativa.",
    status: "Passagem presa — frequência sem receptor, fora do ciclo",
    origin: "Onkweri. Estado atual: anomalia.",
  },
  beku: {
    name: "Beku",
    role: "Azuri",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.07 270) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--accent)",
    morphology: "Azuri — quadrúpede com chifres.",
    ability: "A definir.",
    status: "A definir",
    origin: "Azuri.",
  },
  obaru: {
    name: "Obaru",
    role: "Onkweri",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.20 0.07 75) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--gold)",
    morphology: "Onkweri — quadrúpede sólido. Bomi Veh solidificado.",
    ability: "A definir.",
    status: "A definir",
    origin: "Onkweri.",
  },
  kemdi: {
    name: "Kemdi",
    role: "Onkweri",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 300) 50%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--accent)",
    morphology: "Onkweri — quadrúpede sólido.",
    ability: "A definir.",
    status: "A definir",
    origin: "Onkweri.",
  },
  orike: {
    name: "Orike",
    role: "Perspectiva do Bomi Veh",
    gradient:
      "linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 290) 30%, oklch(0.16 0.08 75) 70%, oklch(0.10 0.008 280) 100%)",
    accentColor: "var(--gold)",
    morphology:
      "Bomi Veh — campo de memória fosforescente. Não tem forma física definida.",
    ability: "Percepção total do campo de memória do Akwu.",
    status: "Presente — campo ativo",
    origin: "O próprio Bomi Veh como entidade.",
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
