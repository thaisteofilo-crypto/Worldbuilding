export type DocumentStatus = "rascunho" | "aprimorar" | "revisar" | "completo" | "arquivar"

export interface StatusDef {
  id: DocumentStatus
  label: string
  description: string
  color: string
  dotColor: string
}

export const DOCUMENT_STATUSES: StatusDef[] = [
  {
    id: "rascunho",
    label: "Rascunho",
    description: "Primeira forma, ainda procurando estrutura.",
    color: "oklch(0.55 0.01 280)",
    dotColor: "oklch(0.60 0.02 280)",
  },
  {
    id: "aprimorar",
    label: "Aprimorar",
    description: "Tem forma, mas precisa de camada ou polimento.",
    color: "oklch(0.55 0.13 65)",
    dotColor: "oklch(0.62 0.13 65)",
  },
  {
    id: "revisar",
    label: "Revisar",
    description: "Precisa de leitura crítica ou correção pontual.",
    color: "oklch(0.52 0.22 25)",
    dotColor: "oklch(0.58 0.18 25)",
  },
  {
    id: "completo",
    label: "Completo",
    description: "Fechado, consistente, pode publicar.",
    color: "oklch(0.50 0.13 155)",
    dotColor: "oklch(0.58 0.13 155)",
  },
  {
    id: "arquivar",
    label: "Arquivar",
    description: "Fora do fluxo ativo, guardado por referência.",
    color: "oklch(0.42 0.01 280)",
    dotColor: "oklch(0.48 0.01 280)",
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
