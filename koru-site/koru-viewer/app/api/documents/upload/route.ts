import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import mammoth from "mammoth"

// Limites e schema do upload de documentos.
// Documentos são textos (md/txt/docx/rtf): 10 MB é teto generoso.
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED_DOCUMENT_MIMETYPES = new Set([
  "text/markdown",
  "text/plain",
  "text/x-markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // alguns clientes mandam isso para .docx
  "application/rtf",
  "text/rtf",
  // Alguns navegadores enviam "" para .md; aceitamos via extensão.
  "application/octet-stream",
  "",
])

const ALLOWED_DOCUMENT_EXTENSIONS = new Set(["md", "txt", "docx", "rtf"])

const documentUploadSchema = z.object({
  name: z.string().min(1, "Nome do arquivo obrigatório"),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_DOCUMENT_BYTES, "Arquivo excede 10 MB"),
  type: z.string().refine(
    (t) => ALLOWED_DOCUMENT_MIMETYPES.has(t),
    "Tipo de arquivo não permitido"
  ),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function detectSection(filename: string, content: string): string {
  const lower = filename.toLowerCase()
  if (lower.includes("biblia") || lower.includes("parte-")) return "biblia"
  if (lower.includes("livro") || lower.includes("capitulo") || lower.includes("cap")) return "livro"
  if (lower.includes("conto")) return "contos"
  if (lower.includes("briefing")) return "briefing"
  if (lower.includes("workflow")) return "workflow"
  // Try content-based detection
  const lowerContent = content.slice(0, 500).toLowerCase()
  if (lowerContent.includes("bíblia") || lowerContent.includes("cosmologia")) return "biblia"
  if (lowerContent.includes("capítulo")) return "livro"
  if (lowerContent.includes("conto")) return "contos"
  return "biblia" // default
}

async function parseFile(file: File): Promise<{ content: string; format: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""

  if (ext === "docx") {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await mammoth.extractRawText({ buffer })
    return { content: result.value, format: "docx" }
  }

  if (ext === "md" || ext === "txt") {
    const text = await file.text()
    return { content: text, format: ext }
  }

  if (ext === "rtf") {
    // Basic RTF strip - remove RTF tags
    const text = await file.text()
    const stripped = text
      .replace(/\{\\[^{}]*\}/g, "")
      .replace(/\\[a-z]+\d*\s?/gi, "")
      .replace(/[{}]/g, "")
      .trim()
    return { content: stripped, format: "rtf" }
  }

  // Fallback: try as text
  try {
    const text = await file.text()
    return { content: text, format: ext }
  } catch {
    throw new Error(`Formato não suportado: .${ext}`)
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const customTitle = formData.get("title") as string | null
  const customSection = formData.get("section") as string | null

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
  }

  // Validação de tamanho separada do schema para devolver 413 (Payload Too Large)
  // em vez do 400 genérico de validação Zod.
  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      { error: "Arquivo excede 10 MB", maxBytes: MAX_DOCUMENT_BYTES },
      { status: 413 }
    )
  }

  // Validação Zod do mimetype + extensão. Aceitamos vários mimetypes porque
  // navegadores variam; combinamos com checagem por extensão.
  const parsed = documentUploadSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  })
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!parsed.success || !ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      {
        error: "Arquivo inválido",
        details: parsed.success
          ? "Extensão não permitida (use md, txt, docx ou rtf)"
          : parsed.error.issues.map((i) => i.message).join("; "),
      },
      { status: 400 }
    )
  }

  try {
    const { content, format } = await parseFile(file)

    if (!content.trim()) {
      return NextResponse.json({ error: "Arquivo vazio ou sem conteúdo extraível" }, { status: 400 })
    }

    const baseName = file.name.replace(/\.[^.]+$/, "")
    const title = customTitle?.trim() || baseName
    const slug = slugify(title)
    const section = customSection || detectSection(file.name, content)

    const admin = createAdminClient()

    // Check if document with this slug already exists
    const { data: existing } = await admin
      .from("documents")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (existing) {
      // Update existing document
      const { error } = await admin
        .from("documents")
        .update({ content, title, section, updated_at: new Date().toISOString() })
        .eq("id", existing.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        id: existing.id,
        slug,
        title,
        section,
        format,
        words: content.split(/\s+/).filter(Boolean).length,
        updated: true,
      })
    }

    // Insert new document
    const { data, error } = await admin
      .from("documents")
      .insert({ slug, title, section, content })
      .select("id")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      slug,
      title,
      section,
      format,
      words: content.split(/\s+/).filter(Boolean).length,
      updated: false,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar arquivo" },
      { status: 500 }
    )
  }
}
