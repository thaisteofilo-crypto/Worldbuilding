/**
 * Rate-limiter in-memory simples baseado em sliding window.
 *
 * Cada chave (geralmente IP) mantém um array de timestamps de hits dentro
 * da janela atual. Hits antigos são descartados a cada chamada.
 *
 * Aviso: o estado vive no processo. Em ambientes serverless com múltiplas
 * instâncias o limite é por instância, não global. Suficiente para barrar
 * abuso casual de endpoints públicos; para garantia global use Redis ou
 * uma store externa.
 */

type Entry = {
  hits: number[]
}

// Map global por chave -> entry. Compartilhado entre rotas que importam
// este módulo na mesma instância do runtime.
const store = new Map<string, Entry>()

// Limpeza periódica de entries vazias. Não usa setInterval para evitar
// segurar o event loop em testes; chamada oportunisticamente em cada
// rateLimit().
let lastSweep = 0
const SWEEP_INTERVAL_MS = 60_000

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, entry] of store) {
    if (entry.hits.length === 0) {
      store.delete(key)
    }
  }
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  /** Timestamp (ms epoch) em que o cliente pode tentar novamente. */
  reset: number
}

export interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const entry = store.get(key) ?? { hits: [] }
  const cutoff = now - windowMs

  // Descarta hits fora da janela.
  let i = 0
  while (i < entry.hits.length && entry.hits[i] < cutoff) i++
  if (i > 0) entry.hits = entry.hits.slice(i)

  if (entry.hits.length >= limit) {
    // Reset = quando o hit mais antigo sair da janela.
    const reset = entry.hits[0] + windowMs
    store.set(key, entry)
    return { success: false, remaining: 0, reset }
  }

  entry.hits.push(now)
  store.set(key, entry)

  return {
    success: true,
    remaining: limit - entry.hits.length,
    reset: entry.hits[0] + windowMs,
  }
}

/**
 * Helper: extrai a chave de identificação do cliente a partir dos headers.
 * Em produção atrás de proxy, x-forwarded-for ou x-real-ip estarão presentes.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")
  if (fwd) {
    // Pode ser uma lista; o primeiro é o cliente original.
    const first = fwd.split(",")[0]?.trim()
    if (first) return first
  }
  const real = headers.get("x-real-ip")
  if (real) return real.trim()
  return "anon"
}

/**
 * Helper: monta a Response 429 padrão para clientes que excederam o limite.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
  return new Response(
    JSON.stringify({ error: "rate_limited", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  )
}
