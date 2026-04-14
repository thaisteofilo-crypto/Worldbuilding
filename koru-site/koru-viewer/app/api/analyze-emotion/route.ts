import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { readMarkdown } from "@/lib/content"

const anthropic = new Anthropic() // Uses ANTHROPIC_API_KEY env var

function smartTruncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text
  const truncated = text.slice(0, maxChars)
  const lastParagraph = truncated.lastIndexOf("\n\n")
  return lastParagraph > maxChars * 0.7 ? truncated.slice(0, lastParagraph) : truncated
}

export async function POST(req: Request) {
  try {
    const { chapter } = await req.json()
    if (!chapter)
      return NextResponse.json({ error: "chapter required" }, { status: 400 })

    const slug = chapter === "epilogo" ? "epilogo" : `capitulo-${chapter}`
    const doc = readMarkdown(`livro/${slug}.md`)
    if (!doc.content || doc.content.startsWith("##")) {
      return NextResponse.json(
        { error: "chapter not found" },
        { status: 404 }
      )
    }

    const chapterTitle = doc.frontmatter?.title as string | undefined
    const titleLine = chapterTitle ? `Título: ${chapterTitle}\n` : ""
    const chapterLabel = chapter === "epilogo" ? "Epílogo" : `Capítulo ${chapter}`

    // Paragraph-aware truncation to ~8000 chars
    const text = smartTruncate(doc.content, 8000)

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `Você é um analista literário especializado no mundo de Korú — um mundo cuja física é baseada em memória. Neste mundo:
- A "melancolia funcional" é o tom base: não é desespero, é uma tristeza que permite movimento. Os personagens funcionam apesar (e através) da perda.
- As emoções se manifestam fisicamente: luz que muda de frequência, substâncias que solidificam ou dissolvem, presença que deixa rastro no espaço.
- Temiku: contenção emocional como mecanismo de sobrevivência física, não como frieza. Sua emoção central é equilíbrio instável.
- Amara: calor e presença — emoção como campo gravitacional que atrai e retém.
- Oruku: ausência como estado ativo — não está, mas a frequência persiste.
- O "medo" neste mundo é frequentemente medo de dissolução ou de solidificação excessiva.
- A "esperança" é rara e pequena — um gesto, não uma declaração.
Analise com atenção a essas particularidades ao calibrar as intensidades emocionais.`,
      messages: [
        {
          role: "user",
          content: `Analise as emoções deste trecho de Korú. Retorne APENAS um JSON válido (sem markdown, sem code blocks) no formato:
{
  "chapter": "${chapter}",
  "emotions": [
    { "name": "melancolia", "intensity": 0.0-1.0, "peak_excerpt": "trecho curto" },
    { "name": "esperança", "intensity": 0.0-1.0, "peak_excerpt": "trecho curto" },
    { "name": "medo", "intensity": 0.0-1.0, "peak_excerpt": "trecho curto" },
    { "name": "ternura", "intensity": 0.0-1.0, "peak_excerpt": "trecho curto" },
    { "name": "tensão", "intensity": 0.0-1.0, "peak_excerpt": "trecho curto" }
  ],
  "overall_tension": 0.0-1.0,
  "narrative_arc": "rising" | "falling" | "climax" | "resolution",
  "summary": "uma frase sobre o tom emocional do capítulo, considerando a melancolia funcional de Korú"
}

${titleLine}Seção: ${chapterLabel}

Texto:
${text}`,
        },
      ],
    })

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : ""

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonStr = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
    const analysis = JSON.parse(jsonStr)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Emotion analysis error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      { status: 500 }
    )
  }
}
