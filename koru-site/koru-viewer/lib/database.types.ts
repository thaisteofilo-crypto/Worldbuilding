export interface Document {
  id: string
  slug: string
  title: string
  section: 'biblia' | 'livro' | 'contos' | 'briefing' | 'workflow'
  content: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  slug: string
  name: string
  role: string | null
  gradient: string | null
  accent_color: string | null
  morphology: string | null
  ability: string | null
  status: string | null
  origin: string | null
  species: string | null
  location: string | null
  mark: string | null
  quote: string | null
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  category: 'conto' | 'capitulo' | 'biblia' | 'site' | 'outro'
  priority: 'low' | 'normal' | 'high'
  order_index: number
  created_at: string
  updated_at: string
}
