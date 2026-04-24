export type DocumentStatus = "rascunho" | "aprimorar" | "revisar" | "completo" | "arquivar"

export interface StatusDef {
  id: DocumentStatus
  label: string
  short: string
  description: string
  color: string
  dotColor: string
}

// Colors: chroma reduzido (tom editorial/contemplativo, não SaaS).
// Para uso em fundo escuro, dot lightness ~0.62, color (texto) ~0.70.
export const DOCUMENT_STATUSES: StatusDef[] = [
  {
    id: "rascunho",
    label: "Rascunho",
    short: "Rasc",
    description: "Primeira forma, ainda procurando estrutura.",
    color: "oklch(0.70 0.02 280)",
    dotColor: "oklch(0.62 0.03 280)",
  },
  {
    id: "aprimorar",
    label: "Aprimorar",
    short: "Aprim",
    description: "Tem forma, mas precisa de camada ou polimento.",
    color: "oklch(0.72 0.08 75)",
    dotColor: "oklch(0.66 0.10 72)",
  },
  {
    id: "revisar",
    label: "Revisar",
    short: "Rev",
    description: "Precisa de leitura crítica ou correção pontual.",
    color: "oklch(0.68 0.12 25)",
    dotColor: "oklch(0.62 0.14 25)",
  },
  {
    id: "completo",
    label: "Completo",
    short: "OK",
    description: "Fechado, consistente, pode publicar.",
    color: "oklch(0.70 0.09 155)",
    dotColor: "oklch(0.64 0.10 155)",
  },
  {
    id: "arquivar",
    label: "Arquivar",
    short: "Arq",
    description: "Fora do fluxo ativo, guardado por referência.",
    color: "oklch(0.58 0.01 280)",
    dotColor: "oklch(0.50 0.01 280)",
  },
]

const STATUS_BY_ID: Record<DocumentStatus, StatusDef> = Object.fromEntries(
  DOCUMENT_STATUSES.map((s) => [s.id, s])
) as Record<DocumentStatus, StatusDef>

export function getStatusDef(id: DocumentStatus | string | null | undefined): StatusDef | null {
  if (!id) return null
  return STATUS_BY_ID[id as DocumentStatus] ?? null
}

export function isValidStatus(value: unknown): value is DocumentStatus {
  return typeof value === "string" && value in STATUS_BY_ID
}

export const STATUS_KEY_PREFIX = "status."

export function statusKey(docPath: string): string {
  return STATUS_KEY_PREFIX + docPath
}

export function parseStatusKey(key: string): string | null {
  if (!key.startsWith(STATUS_KEY_PREFIX)) return null
  return key.slice(STATUS_KEY_PREFIX.length)
}
