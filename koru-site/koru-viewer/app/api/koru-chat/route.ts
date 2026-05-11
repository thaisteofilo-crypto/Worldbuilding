import fs from "fs"
import path from "path"

/**
 * Endpoint público do chatbot do mundo de Korú.
 * Usa a API do Google AI Studio (Gemma).
 *
 * Se o modelo `gemma-3-27b-it` retornar 404 ou indisponível, trocar para:
 *   - `gemma-3-12b-it`
 *   - `gemma-2-27b-it`
 * Basta alterar a constante MODEL abaixo.
 *
 * Não confundir com /api/chat (que é o assistente do admin, Anthropic).
 */

const MODEL = "gemma-3-27b-it"
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const CONTENT_ROOT = path.resolve(path.join(process.cwd(), "content"))

let bibleCache: { content: string; timestamp: number } | null = null
const BIBLE_CACHE_TTL = 10 * 60 * 1000 // 10 min

function loadBible(): string {
  const now = Date.now()
  if (bibleCache && now - bibleCache.timestamp < BIBLE_CACHE_TTL) {
    return bibleCache.content
  }
  const biblePath = path.join(CONTENT_ROOT, "koru-ecosystem-briefing.md")
  if (!fs.existsSync(biblePath)) {
    bibleCache = { content: "", timestamp: now }
    return ""
  }
  const raw = fs.readFileSync(biblePath, "utf-8")
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

Bomi Veh, cinco estados:
1. Vivo (lilás, processando)
2. Solidificado (denso, escuro, os Onkweri são este estado)
3. Preto (Ubomi-chi mortos, irreversível sem intervenção)
4. Cinza permanente (Jobi-Koro, violação do ciclo)
5. Azul-frio (caso documentado: dissolução de Amara)

Acordos com o mundo:
- As 13 regras não são leis de uma autoridade. São acordos. As consequências são respostas físicas do ambiente, não punições.

FORMATO:
- Sem cabeçalhos markdown na maioria das respostas. Prosa direta.
- Se a pergunta pedir comparação ou lista, pode usar lista simples.
- Mantenha respostas entre 2 e 6 frases, salvo quando a pergunta exigir mais.
- Não comece com "Sim,", "Claro,", "Olá". Comece pela informação.
- Não termine com "espero ter ajudado" nem ofereça mais ajuda.

REFERÊNCIA, A BÍBLIA DO MUNDO:

${bible}`
}

interface InMessage {
  role: "user" | "assistant"
  content: string
}

interface GeminiPart {
  text: string
}

interface GeminiContent {
  role: "user" | "model"
  parts: GeminiPart[]
}

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

    // Guarda de conteúdo do livro: avalia a última mensagem do usuário.
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (lastUser && isAboutBook(lastUser.content)) {
      return new Response(
        JSON.stringify({ reply: bookGuardReply() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    const bible = loadBible()
    const systemPrompt = buildSystemPrompt(bible)

    // Modelos Gemma do Google AI Studio não aceitam `systemInstruction` separado.
    // Estratégia: prefixar o system prompt na primeira mensagem do usuário.
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

    const upstream = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 800,
        },
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "")
      console.error("Gemma API erro", upstream.status, detail)
      return new Response(
        JSON.stringify({
          error: `Falha na API do modelo (${upstream.status}).`,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const data = (await upstream.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
        finishReason?: string
      }>
    }

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("")
        .trim() ?? ""

    if (!reply) {
      return new Response(
        JSON.stringify({
          error: "O modelo não retornou conteúdo. Tente novamente.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
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
