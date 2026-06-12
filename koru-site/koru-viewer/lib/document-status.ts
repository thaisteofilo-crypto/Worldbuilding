export type DocumentStatus = "rascunho" | "aprimorar" | "revisar" | "completo" | "arquivar"

export interface StatusDef {
  id: DocumentStatus
  label: string
  short: string
  description: string
  color: string
  dotColor: string
}

// Colors: tokens do design system Korú (cores da marca + semânticas).
// rascunho/arquivar = cinza/muted; aprimorar = Mel; revisar = Jambo; completo = Mata.
export const DOCUMENT_STATUSES: StatusDef[] = [
  {
    id: "rascunho",
    label: "Rascunho",
    short: "Rasc",
    description: "Primeira forma, ainda procurando estrutura.",
    color: "hsl(var(--muted-foreground))",
    dotColor: "hsl(var(--muted-foreground) / 0.8)",
  },
  {
    id: "aprimorar",
    label: "Aprimorar",
    short: "Aprim",
    description: "Tem forma, mas precisa de camada ou polimento.",
    color: "var(--color-mel)",
    dotColor: "var(--color-mel)",
  },
  {
    id: "revisar",
    label: "Revisar",
    short: "Rev",
    description: "Precisa de leitura crítica ou correção pontual.",
    color: "var(--color-jambo)",
    dotColor: "var(--color-jambo)",
  },
  {
    id: "completo",
    label: "Completo",
    short: "OK",
    description: "Fechado, consistente, pode publicar.",
    color: "var(--color-mata)",
    dotColor: "var(--color-mata)",
  },
  {
    id: "arquivar",
    label: "Arquivar",
    short: "Arq",
    description: "Fora do fluxo ativo, guardado por referência.",
    color: "hsl(var(--muted-foreground) / 0.7)",
    dotColor: "hsl(var(--muted-foreground) / 0.55)",
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
