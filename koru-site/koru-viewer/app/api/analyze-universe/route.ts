import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"
import { clientKeyFromHeaders, rateLimit, rateLimitResponse } from "@/lib/rate-limit"

export const runtime = "nodejs"

const REPO_ROOT = path.resolve(path.join(process.cwd(), "content"))

interface DocSection {
  section: string
  title: string
  content: string
}

// Cache loaded docs + the built document context string to avoid re-reading
// ~25 markdown files + rebuilding a ~200KB string on every POST.
// TTL = 5 min: long enough to cover bursts of analyses (4 types × user retries),
// short enough that edits via the editor show up in the next analysis.
const DOCS_CACHE_TTL = 5 * 60 * 1000
let docsCache: { docs: DocSection[]; context: string; timestamp: number } | null = null

function loadAllDocs(): DocSection[] {
  const docs: DocSection[] = []

  // Biblia parts
  const bibliaDir = path.join(REPO_ROOT, "biblia")
  if (fs.existsSync(bibliaDir)) {
    const files = fs
      .readdirSync(bibliaDir)
      .filter((f) => /^parte-\d+/.test(f) && f.endsWith(".md"))
      .sort()
    for (const file of files) {
      const raw = fs.readFileSync(path.join(bibliaDir, file), "utf-8")
      docs.push({ section: "Biblia", title: file.replace(".md", ""), content: raw.slice(0, 6000) })
    }
  }

  // Livro chapters
  const livroDir = path.join(REPO_ROOT, "livro")
  if (fs.existsSync(livroDir)) {
    const files = fs
      .readdirSync(livroDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
    for (const file of files) {
      const raw = fs.readFileSync(path.join(livroDir, file), "utf-8")
      docs.push({ section: "Livro", title: file.replace(".md", ""), content: raw.slice(0, 10000) })
    }
  }

  // Contos
  const contosDir = path.join(REPO_ROOT, "contos")
  if (fs.existsSync(contosDir)) {
    const files = fs
      .readdirSync(contosDir)
      .filter((f) => f.startsWith("conto-") && f.endsWith(".md"))
      .sort()
    for (const file of files) {
      const raw = fs.readFileSync(path.join(contosDir, file), "utf-8")
      docs.push({ section: "Contos", title: file.replace(".md", ""), content: raw.slice(0, 8000) })
    }
  }

  return docs
}

function getCachedDocsContext(): { docs: DocSection[]; context: string } {
  const now = Date.now()
  if (docsCache && now - docsCache.timestamp < DOCS_CACHE_TTL) {
    return { docs: docsCache.docs, context: docsCache.context }
  }
  const docs = loadAllDocs()
  const context = buildDocumentContext(docs)
  docsCache = { docs, context, timestamp: now }
  return { docs, context }
}

function buildDocumentContext(docs: DocSection[]): string {
  const sections: Record<string, DocSection[]> = {}
  for (const doc of docs) {
    if (!sections[doc.section]) sections[doc.section] = []
    sections[doc.section].push(doc)
  }

  let context = ""
  for (const [section, items] of Object.entries(sections)) {
    context += `\n\n=== ${section.toUpperCase()} (${items.length} documentos) ===\n`
    for (const item of items) {
      context += `\n--- ${item.title} ---\n${item.content}\n`
    }
  }
  return context
}

const ANALYSIS_PROMPTS: Record<string, string> = {
  all: `Leia com atenção todos os documentos do universo de Koru e escreva uma análise em prosa — como uma leitora crítica experiente conversando com a autora, não como um relatório técnico.

Estruture em quatro seções, nessa ordem:

## Onde o mundo está respirando bem
O que está funcionando. O que a autora construiu que já tem vida própria. Quais ideias do mundo (física da memória, Bomi Veh, o silêncio dos Azuri, a origem de Temiku) estão firmes e ressoam entre documentos. Seja específica: cite passagens curtas que mostram o mundo acontecendo sem precisar ser explicado.

## Onde o mundo ainda está procurando forma
Lacunas, zonas frágeis, inconsistências pequenas que valem a pena notar. Não use lista de "ERRO/CORREÇÃO" — descreva o que percebeu e o efeito disso na experiência. Se encontrar algo que contradiz a bíblia (morfologia, luz, Bomi Veh, Oruku, acordos), cite o trecho exato e explique por quê afeta a coerência, não só que "está errado".

## A voz da autora
Leitura atenta dos textos narrativos (livro e contos). Comente ritmo, abertura, como as emoções aparecem no corpo em vez de serem nomeadas, como a física do mundo é integrada como dado. Cite 2-3 passagens curtas que ilustrem o que funciona, e 1-2 que ainda pedem ajuste. Fale como quem ama os textos e quer que eles fiquem melhores — não como auditoria.

## O que eu faria agora
Não uma lista de TODO. Um parágrafo pensando em voz alta: se eu fosse a autora, o que tocaria primeiro e por quê? Qual é o gesto que destrava mais coisa ao mesmo tempo?

Tom: analítico, caloroso, específico. Frases que respiram. Evite bullets longos, tabelas, e formato "campo: valor". Quando precisar listar, use no máximo 3-5 itens curtos. Cite sempre de onde veio o trecho (nome do arquivo).`,

  inconsistencies: `Leia todos os documentos e me conte o que não está fechando entre eles. Não faça uma tabela de erros — escreva como uma leitora crítica que percebeu atritos.

Organize por tipo de atrito, não por arquivo. Para cada atrito:

- Descreva o que você notou em prosa (1-2 frases).
- Cite o trecho exato que causa o problema, com o nome do arquivo de onde veio.
- Explique o que a bíblia diz sobre esse elemento e por que a discrepância importa — o efeito que causa no mundo, não só a regra violada.
- Se tiver uma sugestão de como reescrever o trecho mantendo a intenção da autora, ofereça.

Atrite com especial atenção a:
- **Morfologia**: Azuri e Onkweri são quadrúpedes com chifres. Sem mãos, sem palmas. Contato intencional pela testa ou pelo focinho. Se algum texto diz "pegou com as mãos", "colocou a palma", isso é atrito.
- **Luz**: vem do teto do Akwu, nunca do chão. Bomi Veh é fosforescência horizontal. Luz ominosa "de baixo para cima" é atrito.
- **Bomi Veh**: só 5 estados válidos (vivo/lilás, solidificado/escuro, preto/morto, cinza/Jobi-Koro, azul-frio/Amara). Estado inventado é atrito.
- **Temiku**: luz baixa endurece, luz alta dissolve. Azul-frio é herança física da frequência de Oruku, não herança sentimental.
- **Oruku**: nunca aparece em cena visualmente. Só o rastro. Se aparece como personagem ativo, é atrito.
- **Acordos**: consequências são respostas físicas do ambiente, não punições por autoridade. Linguagem moralista ("foi punido por", "quebrou a lei") é atrito.

Se alguma categoria estiver limpa, diga em uma frase e siga. Se encontrar algo que não se encaixa em nenhuma dessas categorias mas incomoda, comente também. Tom analítico e respeitoso — a autora sabe o que está fazendo, você está ajudando a afinar.`,

  feedback: `Leia os textos narrativos (livro e contos) como uma leitora atenta que conhece a voz da autora — Clarice Lispector por dentro, Ursula Le Guin por fora, frases que respiram, emoção que aparece no corpo e não no nome. Escreva um feedback em prosa, não um checklist.

Para cada texto narrativo, escreva 2-3 parágrafos (curtos) respondendo:

- Qual é a temperatura deste texto? O que ele está fazendo bem?
- Onde a voz vacila — momentos em que o texto explica em vez de mostrar, ou em que o ritmo perde a alternância longa/curta, ou em que uma emoção foi nomeada quando poderia ter ficado no gesto.
- Cite 1-2 trechos curtos (menos de 20 palavras) que exemplifiquem o que você disse. Um que funciona, um que pede ajuste, se houver.

Depois, um parágrafo final chamado **Padrão da voz entre os textos** onde você observa o que é consistente na escrita da autora em todo o conjunto, e uma coisa que ainda está se firmando.

Evite linguagem de manual de escrita ("o ritmo poderia ser melhor calibrado"). Escreva com especificidade literária, como um leitor que está junto com a autora dentro do texto. Cite o nome do arquivo sempre que comentar um texto específico.`,

  report: `Escreva um relatório de estado do projeto — mas em prosa, como se estivesse conversando com a autora num café, não um documento corporativo.

Abra com um parágrafo de síntese: onde o projeto está hoje, qual o tamanho do mundo já escrito, o que já tem densidade e o que ainda é esqueleto. Use os números mas solte-os dentro de frases, não em tabela.

Depois três seções:

## Bíblia
O que está assentado, o que ainda precisa de camada. Se alguma parte está rica (física, criaturas, eras) e outra está rascunhada (tecnologia, geografia, rituais), comente. Apresente como diagnóstico, não como inventário.

## Livro
Como o arco narrativo de Temiku está se desenhando nos capítulos existentes. O que já tem massa, onde o texto ainda precisa respirar mais. Mencione explicitamente o epílogo como material pronto que não deve ser tocado.

## Contos
Quais já existem, quais faltam, qual é a ordem que faz mais sentido (origens primeiro, contexto depois, o de Orike por último porque exige perspectiva invertida). Se os contos escritos têm qualidade desigual, seja honesta sobre isso.

Termine com um parágrafo curto chamado **Por onde eu começaria agora** — não uma lista, uma recomendação pensada, explicando por que esse é o próximo passo que destrava mais coisa.

Seja específica, use números quando ajudarem, mas escreva com voz. Nada de "Status: em andamento" ou bullets formais. Frases completas.`,
}

export async function POST(req: Request) {
  try {
    // Rate-limit: 5 req/min por IP. Carrega todos os docs e gera análise longa.
    const rl = rateLimit({
      key: `analyze-universe:${clientKeyFromHeaders(req.headers)}`,
      limit: 5,
      windowMs: 60_000,
    })
    if (!rl.success) return rateLimitResponse(rl)

    const { type = "all" } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key nao configurada. Va em Configuracoes para adicionar." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { docs, context: docContext } = getCachedDocsContext()
    if (docs.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum documento encontrado." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const analysisPrompt = ANALYSIS_PROMPTS[type] ?? ANALYSIS_PROMPTS.all

    const systemPrompt = `Você é uma leitora crítica experiente que conhece profundamente o universo de Koru — um mundo cuja física é baseada em memória — e está conversando com a autora sobre a obra dela. Não é uma auditoria. É uma conversa entre duas pessoas que levam o texto a sério.

TOM
- Prosa analítica e calorosa. Frases que respiram. Nada de bullets longos, tabelas, checklists, ou formato "CAMPO: valor".
- Específica sempre: cite trechos curtos entre aspas, com o nome do arquivo de onde vieram.
- Quando precisar listar algo, use no máximo 3-5 itens curtos e volte para prosa logo depois.
- Evite elogios genéricos ("está muito bom") e elogios exagerados. Aponte o que funciona dizendo *por que* funciona.
- Evite linguagem de manual ("o ritmo poderia ser melhor calibrado"). Fale como leitora real.
- Não peça desculpas, não faça meta-comentários sobre o que vai fazer. Comece direto.
- Responda em português do Brasil, com naturalidade.
- **Nunca use travessões** (—, –, --). Onde usaria travessão, use vírgula, dois pontos, ponto final, parênteses, ou comece uma frase nova. Isso vale para todo o texto, sem exceção.

O QUE VOCÊ SABE DO MUNDO (use como referência interna, não como régua moral)
- **Morfologia**: Azuri e Onkweri são quadrúpedes com chifres. Sem mãos, sem palmas. Contato intencional pela testa (fronte) ou pelo focinho. Temiku também é quadrúpede híbrida — tem patas, cascos, flancos, pescoço, testa, focinho; nunca antebraço, mão, palma.
- **Luz**: vem do teto interno do Akwu, nunca do chão. Ariku filtram lateralmente. Bomi Veh é eco fosforescente horizontal, nunca ominoso de baixo para cima. Três tipos: Oru (teto dourado), Temu (teto lilás-frio), Luz Limiar (Azuri — altera frequência, não ilumina).
- **Bomi Veh**: 5 estados apenas — vivo (lilás, processando), solidificado (denso, escuro, os Onkweri *são* este estado), preto (Ubomi-chi mortos, irreversível), cinza permanente (Jobi-Koro, violação do ciclo), azul-frio (único caso: dissolução de Amara).
- **Temiku**: equilíbrio instável. Luz baixa = parte Onkweri endurece. Luz alta = dissolução acelera, perde memória. A cor azul-fria dela é herança *física* da frequência de Oruku, não herança sentimental. A contenção emocional é mecanismo de sobrevivência física.
- **Oruku**: nunca aparece visualmente em cena. Só o rastro — cor azul-fria, frequência nas veias de Temiku. Se aparece como personagem ativo num texto, é atrito.
- **Acordos vs regras**: as 13 são acordos com o mundo. Consequências são respostas físicas do ambiente, não punições por autoridade. Linguagem moralista ("foi punido", "quebrou a lei") destoa do mundo.

COMO VOCÊ AGE
- Quando notar algo que contradiz a bíblia, não diga "erro". Diga o que você percebeu, cite o trecho, explique o efeito que causa no mundo, e se fizer sentido, ofereça uma reescrita curta que preserve a intenção da autora.
- Quando algo estiver funcionando, diga *o que* está funcionando e *por que*. "A contenção aqui é física — ela endurece antes de sentir." é útil. "Lindo trecho!" não é.
- Diferencie bíblia (documento técnico, tom de referência) de livro/contos (narrativa literária com voz específica). Não julgue bíblia por padrões literários nem textos literários por padrões técnicos.`

    const userMessage = `Aqui estao todos os documentos do universo de Koru:\n\n${docContext}\n\n${analysisPrompt}`

    const anthropic = new Anthropic({ apiKey })

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 12000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream error" })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Falha na analise" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
