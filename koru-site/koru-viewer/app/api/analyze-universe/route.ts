import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"

const REPO_ROOT = path.resolve(path.join(process.cwd(), "..", ".."))

interface DocSection {
  section: string
  title: string
  content: string
}

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
  all: `Analise todos os documentos do universo de Koru e gere um relatorio completo com as seguintes secoes (use exatamente estes cabecalhos):

## Analise Geral
Estado atual do universo: coerencia interna, pontos fortes, lacunas. Avalie cada secao (Biblia, Livro, Contos) separadamente.

## Inconsistencias
Lista de problemas de consistencia entre documentos. Para cada item: DOCUMENTO | PROBLEMA ENCONTRADO | REFERENCIA CORRETA DA BIBLIA. Verifique: morfologia (maos/palmas em quadrupedes), sistema de luz (de onde vem), estados do Bomi Veh, comportamento de Temiku, aparicao de Oruku, acordos vs punicoes.

## Feedback Narrativo
Analise da voz da autora nos textos narrativos (Livro e Contos). Avalie: abertura (abrupta ou gradual?), ritmo (alternancia de frases longas e curtas), emocoes (mostradas pelo corpo ou explicadas?), uso da fisica do mundo (integrada ou exposta?). Cite trechos especificos.

## Relatorio de Progresso
Estado quantitativo e qualitativo: quantos documentos existem em cada secao, quais estao completos vs esqueleto, qual o proximo passo logico para cada secao. Seja objetiva e pratica.`,

  inconsistencies: `Analise todos os documentos e encontre APENAS inconsistencias e contradicoes entre eles.

## Inconsistencias Encontradas

Para cada problema, use o formato:
**DOCUMENTO:** [nome do arquivo]
**PROBLEMA:** [descricao do erro]
**REFERENCIA CORRETA:** [o que a biblia diz que deveria ser]

Verifique especialmente:
- Morfologia: Azuri e Onkweri sao quadrupedes sem maos. Contato pela testa ou focinho, nunca palma.
- Sistema de luz: luz vem do TETO do Akwu, nunca do chao. Bomi Veh = fosforescencia horizontal.
- Bomi Veh: apenas 5 estados validos (vivo/lilac, solidificado/escuro, preto/morto, cinza/Jobi-Koro, azul-frio/Amara).
- Temiku: luz baixa = endurece, luz alta = dissolucao. Luz azul-fria e heranca fisica (nao sentimental).
- Oruku: NAO aparece visualmente. Apenas rastro (cor azul-fria, frequencia em Temiku).
- Acordos: consequencias sao respostas fisicas, nao punicoes de autoridade.

Se nao houver inconsistencias em algum ponto, diga explicitamente.`,

  feedback: `Analise apenas os textos narrativos (Livro e Contos) e gere feedback de voz e estilo.

## Feedback Narrativo por Documento

Para cada capitulo/conto analisado:

### [nome do documento]
- **Abertura:** abrupta ou tem introducao desnecessaria?
- **Ritmo:** ha alternancia entre frases longas e cortes curtos?
- **Emocoes:** sao mostradas pelo corpo/espaco ou explicadas?
- **Fisica do mundo:** integrada como dado ou exposta como explicacao?
- **Ponto forte:** o que funciona melhor neste texto
- **Prioridade de revisao:** maximo 2 sugestoes especificas com citacao do trecho

## Padrao Geral da Voz
Ao final, um paragrafo sobre o padrao geral observado em todos os textos narrativos.`,

  report: `Gere um relatorio completo de producao e estado do projeto Koru.

## Metricas do Projeto
Contagens de documentos por secao, estimativa de palavras total, estado de cada secao.

## Estado por Secao

### Biblia
Quais partes existem, quais estao completas, quais precisam de expansao ou correcao.

### Livro
Estado de cada capitulo (esqueleto, parcial, completo), arco narrativo atual, lacunas.

### Contos
Quais contos existem, quais estao por escrever, ordem recomendada.

## Dependencias e Ordem de Criacao
O que deve ser feito primeiro, o que depende do que.

## Proximos Passos Recomendados
Lista priorizada de acoes concretas para avancao do projeto.

## Saude Geral do Universo
Uma avaliacao honesta do estado atual: o que esta funcionando, o que precisa de atencao urgente.`,
}

export async function POST(req: Request) {
  try {
    const { type = "all" } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key nao configurada. Va em Configuracoes para adicionar." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const docs = loadAllDocs()
    if (docs.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum documento encontrado." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const docContext = buildDocumentContext(docs)
    const analysisPrompt = ANALYSIS_PROMPTS[type] ?? ANALYSIS_PROMPTS.all

    const systemPrompt = `Voce e uma assistente especialista no universo de Koru, um mundo cuja fisica e baseada em memoria. Voce conhece profundamente este universo e vai analisar todos os documentos fornecidos.

REGRAS DO MUNDO (referencia rapida):
- Azuri e Onkweri: quadrupedes com chifres, SEM MAOS. Contato pela testa ou focinho.
- Luz vem do TETO do Akwu. Bomi Veh = fosforescencia horizontal, nunca ominosa de baixo para cima.
- Bomi Veh: 5 estados (vivo/lilas, solidificado/escuro, preto/morto, cinza/Jobi-Koro, azul-frio/Amara).
- Temiku: quadrupede hibrida, luz baixa = endurece, luz alta = dissolucao. Luz azul-fria = heranca fisica de Oruku.
- Oruku: NUNCA aparece visualmente. Apenas rastro.
- Acordos: consequencias sao respostas fisicas do ambiente, nao punicoes.

Responda sempre em portugues. Seja especifica, cite documentos e trechos. Nao faca elogios genericos.`

    const userMessage = `Aqui estao todos os documentos do universo de Koru:\n\n${docContext}\n\n${analysisPrompt}`

    const anthropic = new Anthropic({ apiKey })

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
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
