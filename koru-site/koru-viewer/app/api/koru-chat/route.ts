import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Endpoint público do chatbot do mundo de Korú.
 * Usa a API do Google AI Studio (Gemma) com streaming SSE.
 *
 * Modelo: gemma-4-26b-a4b-it (MoE, thinking model — não desligável).
 * Estratégia de velocidade:
 *   1) Sistema prompt carregado do koru-bible-core.md (~6KB / ~1800 tok)
 *      em vez da bíblia completa (~56KB / ~16K tok).
 *   2) streamGenerateContent (SSE) para devolver tokens ao cliente conforme
 *      saem do modelo. Os tokens de thinking (thought: true) são filtrados
 *      e nunca enviados pro cliente.
 *
 * Persistência: cada sessão tem um cookie httpOnly (koru-chat-session, UUID,
 * 90 dias). As conversas são gravadas em public.koru_chat_conversations.
 * Anônimo: salva session_id + user_agent (200 chars), nada de IP.
 *
 * Não confundir com /api/chat (assistente Anthropic do admin).
 */

const MODEL = "gemma-4-26b-a4b-it"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`

const CONTENT_ROOT = path.resolve(path.join(process.cwd(), "content"))
const SESSION_COOKIE = "koru-chat-session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 90 // 90 dias
const CURRENT_COOKIE = "koru-chat-current"
const CURRENT_MAX_AGE = 60 * 60 * 24 * 30 // 30 dias

let bibleCache: { content: string; timestamp: number } | null = null
const BIBLE_CACHE_TTL = 10 * 60 * 1000 // 10 min

function loadBibleCore(): string {
  const now = Date.now()
  if (bibleCache && now - bibleCache.timestamp < BIBLE_CACHE_TTL) {
    return bibleCache.content
  }
  const corePath = path.join(CONTENT_ROOT, "koru-bible-core.md")
  if (!fs.existsSync(corePath)) {
    // Fallback defensivo: se o core sumir, ainda servimos a bíblia completa.
    const fallback = path.join(CONTENT_ROOT, "koru-ecosystem-briefing.md")
    if (fs.existsSync(fallback)) {
      const raw = fs.readFileSync(fallback, "utf-8")
      bibleCache = { content: raw, timestamp: now }
      return raw
    }
    bibleCache = { content: "", timestamp: now }
    return ""
  }
  const raw = fs.readFileSync(corePath, "utf-8")
  bibleCache = { content: raw, timestamp: now }
  return raw
}

/**
 * Detecta se a pergunta toca o conteúdo do livro (história de Temiku,
 * capítulos, enredo, finais). Nesses casos o bot não revela nada.
 */
function isAboutBook(text: string): boolean {
  const t = text.toLowerCase()
  const triggers = [
    "livro",
    "capítulo",
    "capitulo",
    "história de temiku",
    "historia de temiku",
    "enredo",
    "final do livro",
    "o que acontece com temiku",
    "spoiler",
    "como termina",
    "como acaba",
    "epílogo",
    "epilogo",
    "trama",
    "narrativa do livro",
    "romance",
  ]
  return triggers.some((kw) => t.includes(kw))
}

const BOOK_GUARD_REPLIES = [
  "O céu sobre o Akwu permanece lilás-frio. Temiku caminha. Em breve.",
  "A luz desce do teto, lenta. O que se passa lá dentro ainda não foi dito. Em breve.",
  "O Bomi Veh pulsa devagar. A história espera. Em breve.",
  "Há um rastro azul-frio entre as Ariku. O resto fica para depois. Em breve.",
]

function bookGuardReply(): string {
  const i = Math.floor(Math.random() * BOOK_GUARD_REPLIES.length)
  return BOOK_GUARD_REPLIES[i]
}

function buildSystemPrompt(bible: string): string {
  return `Você é o narrador do mundo de Korú. Fala em terceira pessoa sobre o mundo, suas criaturas, lugares, regras e fenômenos. Nunca diz "eu sou um guia", "como assistente", "vou te ajudar". Você é a voz do próprio mundo descrevendo a si mesmo.

DISTINÇÃO FUNDAMENTAL (NUNCA CONFUNDA):
- **Korú** é o NOME DO MUNDO inteiro — a obra, o universo, o conjunto de tudo (Akwu + suas eras + suas criaturas + sua memória).
- **Akwu** é a CÂMARA FECHADA dentro de Korú onde tudo acontece — uma estrutura física com teto, paredes e solo de Bomi Veh.
- Korú não é o Akwu. O Akwu existe DENTRO de Korú. Quando perguntarem "o que é Korú", responda que é o mundo, não a câmara. Quando perguntarem sobre o ambiente físico, fale do Akwu como o lugar onde Korú se manifesta.

TOM:
- Documental-narrativo, próximo do tom da bíblia do mundo.
- Contido, preciso. Sem exclamações. Sem emojis.
- Português do Brasil.
- Frases curtas alternadas com frases mais longas. Sem floreio.
- Quando descrever fenômenos físicos, trate-os como fato, não como mistério.

ESCOPO DE RESPOSTA:
- Você responde sobre: o Akwu, criaturas (Azuri, Onkweri, Ubomi-chi, Ariku, Jobi-Koro), lugares, sistema de luz (Oru, Temu, Luz Limiar), Bomi Veh e seus estados, as 13 regras como acordos com o mundo, cultura, linha do tempo, eras, conceitos fundacionais.
- Você responde sobre os contos (são literatura por personagem, podem ser comentados).
- Você NÃO conta o enredo do livro. Se a pergunta for sobre a história de Temiku, capítulos, o que acontece no livro, finais, eventos do romance, responda apenas com uma frase atmosférica vinda do mundo seguida de "...em breve."

REGRAS INVIOLÁVEIS DO MUNDO (nunca contradiga):

Morfologia:
- Azuri e Onkweri são quadrúpedes com chifres. Sem mãos, sem palmas.
- Contato intencional: pela testa (fronte) ou pelo focinho.
- Marca de Isilo-Ori: na testa e nas bordas dos olhos, nunca nas palmas.

Sistema de luz:
- A luz vem do teto interno do Akwu, nunca do chão.
- Ariku filtram e redistribuem lateralmente.
- Bomi Veh: fosforescência suave, eco horizontal.
- Três tipos de luz: Oru (teto dourado), Temu (teto lilás-frio), Luz Limiar (Azuri, altera frequência, não ilumina).

Bomi Veh, seis estados:
1. Vivo (lilás, processando)
2. Solidificado (denso, escuro, os Onkweri são este estado)
3. Preto (Ubomi-chi mortos, irreversível sem intervenção)
4. Saturado sem rota (cinza denso, ciclo travado, reversível)
5. Cinza permanente (Jobi-Koro, instância máxima do 4º)
6. Azul-frio (caso documentado: dissolução de Amara)

Acordos com o mundo:
- As 13 regras não são leis de uma autoridade. São acordos. As consequências são respostas físicas do ambiente, não punições.

FORMATO:
- Sem cabeçalhos markdown na maioria das respostas. Prosa direta.
- Se a pergunta pedir comparação ou lista, pode usar lista simples.
- Mantenha respostas entre 2 e 6 frases, salvo quando a pergunta exigir mais.
- Não comece com "Sim,", "Claro,", "Olá". Comece pela informação.
- Não termine com "espero ter ajudado" nem ofereça mais ajuda.

REFERÊNCIA, NÚCLEO DA BÍBLIA DO MUNDO:

${bible}`
}

interface InMessage {
  role: "user" | "assistant"
  content: string
}

interface GeminiPart {
  text?: string
  thought?: boolean
}

interface GeminiContent {
  role: "user" | "model"
  parts: { text: string }[]
}

interface SavedMessage {
  role: "user" | "assistant"
  content: string
  ts: string
}

/* ─── Cookie helpers ─── */

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(";")) {
    const idx = part.indexOf("=")
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

function buildSessionCookie(sessionId: string): string {
  return [
    `${SESSION_COOKIE}=${sessionId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

function buildCurrentCookie(conversationId: string): string {
  return [
    `${CURRENT_COOKIE}=${conversationId}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${CURRENT_MAX_AGE}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

/* ─── Persistência ─── */

/**
 * Persiste com conversation_id pré-decidido (caminho do stream).
 * Se isNew: INSERT explicitando o id. Se não: UPDATE apendando mensagens.
 */
async function persistInteraction(
  sessionId: string,
  conversationId: string,
  isNew: boolean,
  newMessages: SavedMessage[],
  userAgent: string | null
) {
  try {
    const supabase = createAdminClient()
    const ua = (userAgent ?? "").slice(0, 200)

    if (isNew) {
      await supabase.from("koru_chat_conversations").insert({
        id: conversationId,
        session_id: sessionId,
        messages: newMessages,
        user_agent: ua,
      })
      return
    }

    const { data: existing } = await supabase
      .from("koru_chat_conversations")
      .select("messages")
      .eq("id", conversationId)
      .eq("session_id", sessionId)
      .maybeSingle()

    if (!existing) {
      // Fallback: row sumiu entre a verificação e o UPDATE — insere com o id.
      await supabase.from("koru_chat_conversations").insert({
        id: conversationId,
        session_id: sessionId,
        messages: newMessages,
        user_agent: ua,
      })
      return
    }

    const prev = (existing.messages as SavedMessage[] | null) ?? []
    const merged = [...prev, ...newMessages]
    await supabase
      .from("koru_chat_conversations")
      .update({
        messages: merged,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
  } catch (err) {
    console.error("koru-chat: falha ao persistir (stream)", err)
  }
}

/**
 * Persiste a interação. Estratégia:
 *   - Se `conversationId` foi passado, faz UPDATE nessa row específica
 *     (apenda mensagens, atualiza updated_at).
 *   - Se ausente OU se a row não existir mais OU se não pertencer à sessão,
 *     faz INSERT de uma row nova.
 *
 * Retorna o id da row efetivamente usado (caller usa pra emitir cookie).
 */
async function persistConversation(
  sessionId: string,
  conversationId: string | null,
  newMessages: SavedMessage[],
  userAgent: string | null
): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    const ua = (userAgent ?? "").slice(0, 200)

    // Caso 1: temos um conversationId — tenta UPDATE na row específica
    if (conversationId) {
      const { data: existing } = await supabase
        .from("koru_chat_conversations")
        .select("id, messages, session_id")
        .eq("id", conversationId)
        .maybeSingle()

      // Só atualiza se a row existe E pertence à mesma sessão.
      if (existing && existing.session_id === sessionId) {
        const prev = (existing.messages as SavedMessage[] | null) ?? []
        const merged = [...prev, ...newMessages]
        await supabase
          .from("koru_chat_conversations")
          .update({
            messages: merged,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
        return existing.id as string
      }
      // Senão, cai pro INSERT abaixo (cookie obsoleto ou conversa de outra sessão).
    }

    // Caso 2: INSERT nova conversa
    const { data: inserted } = await supabase
      .from("koru_chat_conversations")
      .insert({
        session_id: sessionId,
        messages: newMessages,
        user_agent: ua,
      })
      .select("id")
      .single()
    return (inserted?.id as string | undefined) ?? null
  } catch (err) {
    // Falha de persistência nunca quebra o chat — apenas loga.
    console.error("koru-chat: falha ao persistir", err)
    return null
  }
}

/* ─── Handler ─── */

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const messages = body?.messages as InMessage[] | undefined

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens não fornecidas." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Chave de API não configurada." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Sessão (cookie httpOnly).
    const cookies = parseCookies(req.headers.get("cookie"))
    let sessionId = cookies[SESSION_COOKIE]
    let issuedCookie = false
    if (!sessionId) {
      sessionId = randomUUID()
      issuedCookie = true
    }
    // Conversa atual (cookie httpOnly). Se ausente, INSERT cria nova e seta cookie.
    const currentConversationId = cookies[CURRENT_COOKIE] || null
    const userAgent = req.headers.get("user-agent")

    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    const userText = lastUser?.content ?? ""

    // Guarda de conteúdo do livro: resposta canned, sem streaming.
    if (lastUser && isAboutBook(lastUser.content)) {
      const reply = bookGuardReply()
      // Persistir mesmo a resposta canned. Aguardado para garantir gravação
      // em ambiente serverless.
      const now = new Date().toISOString()
      const persistedId = await persistConversation(
        sessionId,
        currentConversationId,
        [
          { role: "user", content: userText, ts: now },
          { role: "assistant", content: reply, ts: now },
        ],
        userAgent
      ).catch(() => null)

      // Set-Cookie pode ter múltiplos valores; usamos array com Headers().
      const responseHeaders = new Headers({ "Content-Type": "application/json" })
      if (issuedCookie) {
        responseHeaders.append("Set-Cookie", buildSessionCookie(sessionId))
      }
      // Se a row é nova (não havia cookie current ou ele estava obsoleto), seta cookie.
      if (persistedId && persistedId !== currentConversationId) {
        responseHeaders.append("Set-Cookie", buildCurrentCookie(persistedId))
      }
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: responseHeaders,
      })
    }

    const bible = loadBibleCore()
    const systemPrompt = buildSystemPrompt(bible)

    // Modelos Gemma não aceitam systemInstruction separado.
    // Prefixamos o system prompt na primeira mensagem do usuário.
    const contents: GeminiContent[] = []
    let systemInjected = false
    for (const m of messages) {
      const role: "user" | "model" = m.role === "assistant" ? "model" : "user"
      let text = m.content
      if (!systemInjected && role === "user") {
        text = `${systemPrompt}\n\n---\n\nPergunta do visitante:\n${text}`
        systemInjected = true
      }
      contents.push({ role, parts: [{ text }] })
    }

    const upstream = await fetch(`${ENDPOINT}&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 3500,
        },
      }),
    })

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "")
      console.error("Gemma API erro", upstream.status, detail)
      return new Response(
        JSON.stringify({
          error: `Falha na API do modelo (${upstream.status}).`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Resolve qual conversation_id vai ser usado pra esta interação.
    // Se o cookie current está presente e a row ainda existe + pertence à sessão,
    // reusa. Caso contrário, gera um novo UUID que será INSERTado no fim do stream.
    let effectiveConversationId = currentConversationId
    let isNewConversation = false
    try {
      if (effectiveConversationId) {
        const supabase = createAdminClient()
        const { data } = await supabase
          .from("koru_chat_conversations")
          .select("id, session_id")
          .eq("id", effectiveConversationId)
          .maybeSingle()
        if (!data || data.session_id !== sessionId) {
          effectiveConversationId = null
        }
      }
    } catch {
      // Se a verificação falhar, segue como se fosse novo (defensivo).
      effectiveConversationId = null
    }
    if (!effectiveConversationId) {
      effectiveConversationId = randomUUID()
      isNewConversation = true
    }

    // Transformar o SSE do Gemini num SSE próprio, mais simples,
    // e filtrar tokens de thinking.
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let buffer = ""
    let assistantText = ""

    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body!.getReader()

        function emit(payload: object) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          )
        }

        function processLine(line: string) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) return
          const json = trimmed.slice(5).trim()
          if (!json || json === "[DONE]") return
          let parsed: {
            candidates?: Array<{
              content?: { parts?: GeminiPart[] }
            }>
          }
          try {
            parsed = JSON.parse(json)
          } catch {
            return
          }
          const parts = parsed.candidates?.[0]?.content?.parts ?? []
          for (const p of parts) {
            if (p.thought) continue
            if (typeof p.text === "string" && p.text.length > 0) {
              assistantText += p.text
              emit({ delta: p.text })
            }
          }
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            // Mensagens SSE são separadas por \n\n.
            let sep
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
              const chunk = buffer.slice(0, sep)
              buffer = buffer.slice(sep + 2)
              for (const line of chunk.split("\n")) processLine(line)
            }
          }
          // Resíduo
          if (buffer.trim()) {
            for (const line of buffer.split("\n")) processLine(line)
          }

          // Persistir antes de fechar o stream, para garantir que o handler
          // (em ambiente serverless) não seja terminado antes da gravação.
          // O cliente já recebeu todos os tokens; só fica esperando o [DONE].
          const now = new Date().toISOString()
          const trimmedReply = assistantText.trim()
          if (trimmedReply) {
            await persistInteraction(
              sessionId!,
              effectiveConversationId!,
              isNewConversation,
              [
                { role: "user", content: userText, ts: now },
                { role: "assistant", content: trimmedReply, ts: now },
              ],
              userAgent
            ).catch(() => {})
          }

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (err) {
          console.error("koru-chat stream erro", err)
          emit({ error: "Falha durante a geração." })
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        }
      },
    })

    const responseHeaders = new Headers({
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    })
    if (issuedCookie) {
      responseHeaders.append("Set-Cookie", buildSessionCookie(sessionId))
    }
    // Sempre que a conversa for nova (ou cookie current obsoleto), emite cookie novo.
    if (isNewConversation) {
      responseHeaders.append(
        "Set-Cookie",
        buildCurrentCookie(effectiveConversationId)
      )
    }

    return new Response(stream, { status: 200, headers: responseHeaders })
  } catch (err) {
    console.error("koru-chat erro", err)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Erro inesperado.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
