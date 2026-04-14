import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: Request) {
  try {
    const { analysis } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key não configurada." },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    const systemPrompt =
      "Você é um assistente que extrai tarefas concretas e acionáveis de uma análise de universo literário. Retorne APENAS JSON válido, sem markdown."

    const userMessage = `Extraia até 12 tarefas concretas e acionáveis do seguinte relatório de análise do universo de Korú.

Para cada tarefa, retorne:
- title: título curto e acionável (máximo 80 caracteres, começar com verbo no infinitivo)
- description: 1-2 frases explicando o que fazer e por quê
- category: uma das opções: conto, capitulo, biblia, site, outro
- priority: uma das opções: high (urgente/crítico), normal, low (melhorias futuras)

Retorne APENAS um array JSON válido, sem markdown, sem explicações:
[{"title":"...","description":"...","category":"...","priority":"..."}]

RELATÓRIO:
${analysis}`

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : ""

    // Strip markdown code fences if present
    const jsonStr = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json(
        { error: "Não foi possível extrair tarefas." },
        { status: 500 }
      )
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: "Formato de tarefas inválido", tasks: [] },
        { status: 400 }
      )
    }

    const tasks = parsed.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).title === "string"
    )

    if (tasks.length === 0 && parsed.length > 0) {
      return NextResponse.json(
        { error: "Formato de tarefas inválido", tasks: [] },
        { status: 400 }
      )
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("suggest-tasks error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao sugerir tarefas." },
      { status: 500 }
    )
  }
}
