import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { readLocalState, writeLocalState } from "@/lib/local-state"
import path from "path"
import fs from "fs"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  folders: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(path.join(process.cwd(), "..", ".."))
const PROJECTS_KEY = "projects"

const DEFAULT_PROJECT: Project = {
  id: "koru-default",
  name: "Korú",
  description: "Mundo cuja física é baseada em memória",
  createdAt: "2024-01-01T00:00:00Z",
  folders: ["biblia", "livro", "contos"],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readProjects(): Project[] {
  const state = readLocalState()
  if (state[PROJECTS_KEY]) {
    try {
      return JSON.parse(state[PROJECTS_KEY]) as Project[]
    } catch {
      /* corrupted — fall through to default */
    }
  }
  return [DEFAULT_PROJECT]
}

function saveProjects(projects: Project[]): void {
  writeLocalState(PROJECTS_KEY, JSON.stringify(projects))

  // Fire-and-forget sync to Supabase
  try {
    const admin = createAdminClient()
    void admin
      .from("site_content")
      .upsert(
        { key: PROJECTS_KEY, value: JSON.stringify(projects) },
        { onConflict: "key" },
      )
  } catch {
    /* ignore — local file is the source of truth */
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Count markdown files inside a folder (non-recursive). */
function countDocsInFolder(folderPath: string): number {
  try {
    if (!fs.existsSync(folderPath)) return 0
    return fs.readdirSync(folderPath).filter((f) => f.endsWith(".md")).length
  } catch {
    return 0
  }
}

// ---------------------------------------------------------------------------
// GET /api/projects
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const projects = readProjects()

    const enriched = projects.map((p) => {
      let totalDocs = 0
      for (const folder of p.folders) {
        totalDocs += countDocsInFolder(path.join(REPO_ROOT, folder))
      }
      return { ...p, documentCount: totalDocs }
    })

    return NextResponse.json({ projects: enriched })
  } catch (err) {
    console.error("[projects] GET error:", err)
    return NextResponse.json(
      { error: "Failed to read projects" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// POST /api/projects
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json()
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 },
      )
    }

    const slug = slugify(name)
    if (!slug) {
      return NextResponse.json(
        { error: "name must contain at least one alphanumeric character" },
        { status: 400 },
      )
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name,
      description: description || undefined,
      createdAt: new Date().toISOString(),
      folders: [slug],
    }

    // Create project folder on disk
    const projectDir = path.join(REPO_ROOT, "projects", slug)
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true })
    }

    const projects = readProjects()
    projects.push(project)
    saveProjects(projects)

    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    console.error("[projects] POST error:", err)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/projects
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const { id, name, description } = await req.json()
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const projects = readProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      )
    }

    if (name !== undefined) projects[idx].name = name
    if (description !== undefined) projects[idx].description = description

    saveProjects(projects)

    return NextResponse.json({ project: projects[idx] })
  } catch (err) {
    console.error("[projects] PATCH error:", err)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 },
    )
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/projects
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    if (id === "koru-default") {
      return NextResponse.json(
        { error: "Cannot delete the default project" },
        { status: 403 },
      )
    }

    const projects = readProjects()
    const filtered = projects.filter((p) => p.id !== id)

    if (filtered.length === projects.length) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 },
      )
    }

    saveProjects(filtered)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[projects] DELETE error:", err)
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 },
    )
  }
}
