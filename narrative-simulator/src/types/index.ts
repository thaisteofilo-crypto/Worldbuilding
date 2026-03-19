export interface Document {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: string
  name: string
  synopsis: string
  genre: string
  coverColor: string
  documents: Document[]
  bible: Bible
  beats: Beat[]
  createdAt: number
  wordCountGoal?: number
}

export interface Bible {
  characters: Character[]
  locations: Location[]
  notes: string
  timeline: TimelineEvent[]
}

export interface Character {
  id: string
  name: string
  role: string
  description: string
  traits: string[]
  motivation?: string
  arc?: string
  relationships?: string
}

export interface Location {
  id: string
  name: string
  type: string
  description: string
  sensory?: string
}

export interface TimelineEvent {
  id: string
  title: string
  description: string
  chapter?: string
  type: 'plot' | 'character' | 'world' | 'conflict'
}

export type AIFeature = 'write' | 'describe' | 'brainstorm' | 'rewrite' | 'feedback'

export interface AICard {
  id: string
  feature: AIFeature
  prompt: string
  response: string
  streaming: boolean
  documentId: string
  timestamp: number
}

export type RightPanelTab = 'history' | 'bible'

// Storyboard
export type BeatType = 'opening' | 'inciting' | 'midpoint' | 'dark-night' | 'climax' | 'resolution' | 'scene' | 'chapter'
export type BeatStatus = 'idea' | 'outlined' | 'drafted' | 'revised' | 'done'

export interface Beat {
  id: string
  title: string
  description: string
  type: BeatType
  status: BeatStatus
  act: 1 | 2 | 3
  order: number
  documentId?: string
  notes?: string
}

// Auth (local)
export interface User {
  id: string
  name: string
  email: string
  createdAt: number
}
