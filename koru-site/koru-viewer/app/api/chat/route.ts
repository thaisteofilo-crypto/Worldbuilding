import Anthropic from "@anthropic-ai/sdk"
import fs from "fs"
import path from "path"

const REPO_ROOT = path.resolve(path.join(process.cwd(), "content"))

let bibleCache: { content: string; timestamp: number } | null = null
const BIBLE_CACHE_TTL = 5 * 60 * 1000 // 5 min

function loadBible(): string {
  const now = Date.now()
  if (bibleCache && now - bibleCache.timestamp < BIBLE_CACHE_TTL) {
    return bibleCache.content
  }
  const biblePath = path.join(REPO_ROOT, "koru-ecosystem-briefing.md")
  if (!fs.existsSync(biblePath)) return ""
  const raw = fs.readFileSync(biblePath, "utf-8")
  // Truncate to ~80k chars to stay within context limits
  bibleCache = { content: raw.slice(0, 80000), timestamp: now }
  return bibleCache.content
}

function detectTone(documentPath: string | null): string {
  if (!documentPath) return ""
  if (documentPath.startsWith("biblia/")) {
    return "O documento sendo editado e parte da BIBLIA (referencia tecnica). Use tom documental: tabelas, listas, linguagem de referencia. Sem narrativa."
  }
  if (documentPath.startsWith("livro/") || documentPath.startsWith("contos/")) {
    return "O documento sendo editado e um TEXTO NARRATIVO. Use tom literario. Melancolia funcional. Fisica integrada como dado, nunca explicada. Abertura abrupta, alternancia de ritmo, metaforas fisicas com peso. Zero emocoes explicadas."
  }
  return ""
}

function isNarrativeDocument(documentPath: string | null): boolean {
  if (!documentPath) return false
  return documentPath.startsWith("livro/") || documentPath.startsWith("contos/")
}

function buildSystemPrompt(
  documentPath: string | null,
  documentContent: string | null,
  bible: string,
  mode: string | null,
  responseMode: 'concise' | 'detailed' | null
): string {
  const tone = detectTone(documentPath)

  let prompt = `Você é uma assistente de worldbuilding para o mundo de Korú, um mundo cuja física é baseada em memória. Você conhece profundamente este universo e ajuda a autora a escrever, analisar consistência, sugerir ideias e responder perguntas sobre o lore.

COMO RESPONDER (formato)
- Escolha o formato pela natureza da pergunta, não por padrão. Nunca pergunte "quer que eu faça tabela?" — faça se fizer sentido.
- Use **tabelas markdown** quando a resposta for comparativa, contrastiva, ou estruturada em paralelos. Exemplos: "X vs Y", "antes/depois", "criatura/habilidade/limite", "o que é / o que não é", lista de regras com consequência.
  Formato: \`| col1 | col2 |\` com linha separadora \`| --- | --- |\`. Header curto, células concisas, sem prosa longa dentro.
- Use **listas** quando forem 3+ itens paralelos e curtos.
- Use **prosa** quando a resposta for uma ideia integrada, análise interpretativa, ou feedback literário. Nunca force bullets em raciocínio que flui.
- Use **cabeçalhos ##** para separar seções quando a resposta tem 2+ partes distintas (ex: "Diagnóstico" / "Sugestão").
- Use **\`\`\`suggestion** (bloco de código com lang=suggestion) quando devolver texto pronto para ir ao editor. O botão de "Inserir" aparece automaticamente.
- Para tabelas, código e respostas completas: o usuário pode inserir no editor com um clique. Então seja específica — a resposta pode virar conteúdo do documento.
- **Nunca use travessões** (—, –). Onde usaria, use vírgula, dois pontos, ou frase nova.
- Sem meta-comentários ("vou te responder agora", "espero que isso ajude"). Comece direto.
- Português do Brasil, natural e direto.

REGRAS INVIOLÁVEIS DO MUNDO:

**Morfologia (a mais critica):**
- Azuri e Onkweri sao quadrupedes com chifres. Sem maos, sem palmas.
- Contato intencional: pela testa (fronte) ou pelo focinho.
- Marca de Isilo-Ori: na testa e nas bordas dos olhos, nunca nas palmas.
- Qualquer mencao a "colocou a palma", "com as maos" etc. e erro.

**Sistema de luz:**
- Luz vem do teto interno do Akwu, nao do chao.
- Ariku filtram e redistribuem lateralmente.
- Bomi Veh: fosforescencia suave (eco horizontal, nunca de baixo para cima de forma ominosa).
- Tres tipos: Oru (teto dourado), Temu (teto lilas-frio), Luz Limiar (Azuri, altera frequencia, nao ilumina).

**Bomi Veh, 5 estados:**
1. Vivo (lilas, processando)
2. Solidificado (denso, escuro, os Onkweri sao este estado)
3. Preto (Ubomi-chi mortos, irreversivel sem intervencao)
4. Cinza permanente (Jobi-Koro, violacao do ciclo)
5. Azul-frio (unico caso documentado: dissolucao de Amara)

**Temiku:**
- Equilibrio instavel: luz baixa = parte Onkweri endurece. Luz alta = dissolucao acelera, perde memoria.
- Luz azul-fria (heranca fisica de frequencia de Oruku, nao heranca sentimental).
- A contencao emocional dela e mecanismo de sobrevivencia fisica, nao frieza.

**Oruku:**
- Nunca aparece visualmente na narrativa. Apenas o rastro (cor azul-fria, frequencia nas veias de Temiku).

**Acordos vs. regras:**
- As 13 regras sao acordos com o mundo. Consequencias sao respostas fisicas do ambiente, nao punicoes por autoridade.

Se a autora perguntar algo que contradiz as regras do mundo, aponte a inconsistência no início da resposta, com o trecho exato da bíblia que contradiz. Em seguida ofereça a correção como sugestão inseríel.`

  if (tone) {
    prompt += `\n\n${tone}`
  }

  // Voz da autora: injetada apenas para documentos narrativos
  if (isNarrativeDocument(documentPath)) {
    prompt += `

VOZ DA AUTORA (regras inviolaveis para textos narrativos):
- Abertura abrupta: o texto comeca no meio de algo, sem introducao
- Alternancia de ritmo: frases longas interrompidas por cortes curtos
- Frases nominais como pausas estruturais ("O campo. O ceu.")
- Metaforas fisicas com peso, nunca decorativas
- Fechamento em contencao: emocao grande termina em gesto pequeno e preciso
- Zero emocoes explicadas: descreve o que acontece no corpo/espaco
- Parenteses para pensamentos tangenciais que carregam o ponto central
- NUNCA escrever "o silencio nao era X" (definir pelo que nao e = errado)
- NUNCA explicar a fisica do mundo — ela e dado, nao exposicao
- Sensorial primeiro. Interior depois, se vier.`
  }

  if (documentPath && documentContent) {
    prompt += `\n\n--- DOCUMENTO ATUAL (${documentPath}) ---\n${documentContent.slice(0, 30000)}`
  }

  if (bible) {
    prompt += `\n\n--- BIBLIA DO MUNDO (referencia completa) ---\n${bible}`
  }

  // Instrucoes de modo: adicionadas no final do prompt
  const modeInstructions: Record<string, string> = {
    correct: `TAREFA: Revisao ortografica e gramatical.
Analise o documento e identifique erros ortograficos, gramaticais e de pontuacao.
Formato da resposta:
1. Liste cada erro encontrado com: ERRO | SUGESTAO | LINHA/CONTEXTO
2. Se nao houver erros, confirme que o texto esta correto.
3. Ao final, um paragrafo resumindo o estado geral do texto.
Nao faca sugestoes estilisticas — apenas correcoes objetivas.`,

    feedback: `TAREFA: Feedback de estilo literario.
Analise o documento sob a perspectiva da voz da autora de Koru.
Avalie:
1. **Abertura** — comeca no meio de algo ou tem introducao desnecessaria?
2. **Ritmo** — ha alternancia entre frases longas e cortes curtos?
3. **Emocoes** — sao mostradas pelo corpo/espaco ou explicadas diretamente?
4. **Fisica do mundo** — esta integrada como dado ou exposta como explicacao?
5. **Morfologia** — ha mencoes incorretas a maos/palmas em personagens quadrupedes?
6. **Pontos fortes** — o que esta funcionando bem na voz.
7. **Sugestoes prioritarias** — maximo 3 melhorias concretas.
Seja especifica: cite trechos do texto.`,

    consistency: `TAREFA: Verificacao de consistencia com a biblia do mundo.
Analise o documento e verifique se ha contradicoes ou inconsistencias com as regras do mundo de Koru.
Verifique:
1. **Morfologia** — Azuri/Onkweri descritos corretamente como quadrupedes sem maos?
2. **Sistema de luz** — luz vindo do teto (nao do chao)? Bomi Veh em fosforescencia horizontal?
3. **Bomi Veh** — estado descrito e um dos 5 estados validos?
4. **Temiku** — comportamento compativel com o equilibrio instavel descrito?
5. **Oruku** — aparece visualmente? (nao deveria — so rastro)
6. **Acordos** — consequencias das regras tratadas como respostas fisicas (nao punicoes)?
Liste cada inconsistencia encontrada com: ITEM | PROBLEMA | REFERENCIA DA BIBLIA
Se tudo estiver consistente, confirme e aponte os elementos do mundo bem integrados.`,

    report: `TAREFA: Relatorio completo de escrita.
Gere um relatorio estruturado sobre o documento. Inclua:

## Metricas basicas
- Estimativa de palavras, paragrafos, cenas

## Analise de voz
- Ritmo predominante (frases longas vs. curtas)
- Abertura: abrupta ou gradual?
- Tratamento de emocoes: mostradas ou explicadas?
- Presenca da fisica do mundo: integrada ou exposta?

## Consistencia com o lore
- Elementos do mundo usados corretamente
- Inconsistencias encontradas (se houver)

## Arco narrativo
- O que acontece nesta secao?
- Tensao: aumenta, diminui, ou estavel?
- Perguntas abertas deixadas para o leitor

## Pontos fortes
- O que esta funcionando melhor

## Sugestoes de revisao
- Maximo 5 itens prioritarios com exemplos especificos do texto

## Nota geral
- Uma frase resumindo o estado do documento`,

    expand: `TAREFA: Expandir texto.
Expanda o trecho fornecido mantendo a voz da autora. Adicione detalhe sensorial: texturas, luz, som, peso corporal.
REGRAS:
- Mantenha o tom e ritmo do original
- Nao explique a fisica do mundo
- Nao adicione emocoes explicitas
- Retorne APENAS o texto expandido em um bloco \`\`\`suggestion
- Sem explicacoes, sem prefacios`,

    describe: `TAREFA: Reescrever com foco sensorial.
Reescreva o trecho fornecido focando em descricao sensorial: o que se ve, ouve, sente no corpo, a textura do ar.
REGRAS:
- Mantenha a voz da autora (aberturas abruptas, cortes curtos, metaforas fisicas)
- Nao explique emocoes diretamente
- Retorne APENAS o texto reescrito em um bloco \`\`\`suggestion
- Sem explicacoes, sem comparacoes com o original`,

    continue: `TAREFA: Continuar escrevendo.
Continue o texto com as proximas 200 palavras, no tom e ritmo do documento atual.
REGRAS:
- Siga o mesmo ritmo (frases longas + cortes curtos)
- Mantenha a voz da autora
- Fisica como dado, nunca exposicao
- Retorne APENAS o texto novo em um bloco \`\`\`suggestion
- Nao repita o que ja esta escrito`,

    rewrite: `TAREFA: Reescrever trecho.
Reescreva o trecho fornecido pela autora, mantendo o significado mas melhorando a voz e o ritmo.
REGRAS:
- Mantenha a voz da autora (abertura abrupta, cortes, metaforas fisicas)
- Nao adicione conteudo novo, apenas reescreva
- Retorne APENAS o texto reescrito em um bloco \`\`\`suggestion
- Sem explicacoes`,
  }

  const modeKey = mode && mode in modeInstructions ? mode : null
  if (modeKey) {
    prompt += `\n\n${modeInstructions[modeKey]}`
  }

  if (responseMode === 'concise') {
    prompt += `\n\nMODO CONCISO: máximo 2-3 frases, ou uma tabela curta, ou um bloco \`\`\`suggestion. Sem introduções, sem resumos, sem "aqui está". Vá direto.`
  } else if (responseMode === 'detailed') {
    prompt += `\n\nMODO DETALHADO: aprofunde quando útil. Use cabeçalhos ## para estruturar. Priorize tabelas para comparações e \`\`\`suggestion para qualquer texto que possa ir para o editor.`
  }

  return prompt
}

export async function POST(req: Request) {
  try {
    const { messages, documentPath, documentContent, mode, responseMode } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API key nao configurada. Va em Configuracoes para adicionar.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const anthropic = new Anthropic({ apiKey })
    const bible = loadBible()
    const systemPrompt = buildSystemPrompt(
      documentPath || null,
      documentContent || null,
      bible,
      mode || null,
      responseMode || null
    )

    const apiMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    )

    const writingModes = ['expand', 'describe', 'continue', 'rewrite']
    const maxTokens = writingModes.includes(mode || '') ? 2048 :
      (mode && mode !== 'chat') ? 8192 : 4096

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: apiMessages,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream error" })}\n\n`
            )
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
    console.error("Chat error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
