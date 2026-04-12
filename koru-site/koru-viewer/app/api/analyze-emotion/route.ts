import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { readMarkdown } from "@/lib/content"

const anthropic = new Anthropic() // Uses ANTHROPIC_API_KEY env var

export async function POST(req: Request) {
  try {
    const { chapter } = await req.json()
    if (!chapter)
      return NextResponse.json({ error: "chapter required" }, { status: 400 })

    const doc = readMarkdown(`livro/${chapter}.md`)
    if (!doc.content || doc.content.startsWith("##")) {
      return NextResponse.json(
        { error: "chapter not found" },
        { status: 404 }
      )
    }

    // Truncate to ~8000 chars to stay within limits
    const text = doc.content.slice(0, 8000)

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analise as emoções deste capítulo de um livro de ficção. Retorne APENAS um JSON válido (sem markdown, sem code blocks) no formato:
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
  "summary": "uma frase sobre o tom emocional do capítulo"
}

Texto do capítulo:
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
