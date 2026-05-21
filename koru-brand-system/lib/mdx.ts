import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface PageMeta {
  section: string
  page: string
  title: string
  description?: string
  order?: number
}

export interface PageContent extends PageMeta {
  source: string
}

export async function getAllPages(): Promise<PageMeta[]> {
  const sections = fs.readdirSync(CONTENT_DIR).filter(
    (f) => fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
  )

  const pages: PageMeta[] = []

  for (const section of sections) {
    const sectionDir = path.join(CONTENT_DIR, section)
    const files = fs.readdirSync(sectionDir).filter((f) => f.endsWith('.mdx'))

    for (const file of files) {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(sectionDir, file), 'utf-8')
      const { data } = matter(raw)

      pages.push({
        section,
        page: slug,
        title: data.title ?? slug,
        description: data.description,
        order: data.order ?? 99,
      })
    }
  }

  return pages.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export async function getSections(): Promise<{ section: string; pages: PageMeta[] }[]> {
  const pages = await getAllPages()
  const map = new Map<string, PageMeta[]>()

  for (const page of pages) {
    if (!map.has(page.section)) map.set(page.section, [])
    map.get(page.section)!.push(page)
  }

  return Array.from(map.entries()).map(([section, pages]) => ({ section, pages }))
}

export async function getPageContent(section: string, page: string): Promise<PageContent | null> {
  const filePath = path.join(CONTENT_DIR, section, `${page}.mdx`)

  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    section,
    page,
    title: data.title ?? page,
    description: data.description,
    order: data.order,
    source: content,
  }
}
