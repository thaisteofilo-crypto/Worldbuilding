import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, Document, AICard, RightPanelTab, Bible, Beat, User, Character, Location, TimelineEvent } from '@/types'

const DEFAULT_BIBLE: Bible = { characters: [], locations: [], notes: '', timeline: [] }

const SAMPLE_BEATS: Beat[] = [
  { id: 'b1', title: 'O Mundo Ordinário', description: 'Mara em seu apartamento, vida comum, algo levemente errado.', type: 'opening', status: 'done', act: 1, order: 1 },
  { id: 'b2', title: 'A Fissura', description: 'A fresta de luz olha de volta. Primeiro contato com o Entre.', type: 'inciting', status: 'drafted', act: 1, order: 2 },
  { id: 'b3', title: 'A Escolha', description: 'Mara decide atravessar a fresta deliberadamente.', type: 'scene', status: 'outlined', act: 1, order: 3 },
  { id: 'b4', title: 'O Meio do Nada', description: 'Mara presa entre os dois mundos. Regras começam a clarear.', type: 'midpoint', status: 'idea', act: 2, order: 4 },
  { id: 'b5', title: 'O Tribunal', description: 'O Guardião convoca Mara ao Tribunal do Nada.', type: 'dark-night', status: 'idea', act: 2, order: 5 },
  { id: 'b6', title: 'O Nome Proibido', description: 'Mara descobre que nomear algo no Entre tem consequências.', type: 'climax', status: 'idea', act: 3, order: 6 },
  { id: 'b7', title: 'O Retorno', description: 'Mara volta — ou não volta — mas algo mudou para sempre.', type: 'resolution', status: 'idea', act: 3, order: 7 },
]

const SAMPLE_PROJECT: Project = {
  id: 'p1',
  name: 'O Entre',
  synopsis: 'Uma jovem descobre o espaço entre a decisão de existir e a existência em si — e o ser que o habita.',
  genre: 'Ficção especulativa',
  coverColor: '#8B7355',
  createdAt: Date.now(),
  wordCountGoal: 80000,
  beats: SAMPLE_BEATS,
  bible: {
    characters: [
      { id: 'c1', name: 'Mara', role: 'Protagonista', description: 'Jovem curiosa que descobriu O Entre acidentalmente', traits: ['curiosa', 'introspectiva', 'corajosa'], motivation: 'Entender o que viu', arc: 'De observadora passiva a agente ativa do Entre' },
      { id: 'c2', name: 'O Guardião', role: 'Antagonista', description: 'Entidade sem forma física que habita as fronteiras do Entre', traits: ['enigmático', 'antigo', 'neutro'], motivation: 'Manter a ordem do Entre', arc: 'Revelação de que não é antagonista — é espelho' },
    ],
    locations: [
      { id: 'l1', name: 'O Entre', type: 'Plano de existência', description: 'Espaço entre decisão e existência. Sem física convencional.', sensory: 'Silêncio que pesa. Luz que não vem de lugar nenhum. Cheiro de antes das coisas.' },
      { id: 'l2', name: 'Apartamento 4B', type: 'Local físico', description: 'Onde Mara vive. A fresta de luz embaixo da porta é a entrada.', sensory: 'Café frio, luz de rua laranja, carpete bege desgastado.' },
    ],
    notes: 'O Entre não obedece leis físicas. Apenas humanos com "fratura perceptiva" conseguem entrar. O tempo lá não corresponde ao tempo físico.',
    timeline: [
      { id: 't1', title: 'Primeira visão da fresta', description: 'Mara percebe a fresta olhando de volta', chapter: 'Cap. 1', type: 'plot' },
      { id: 't2', title: 'Entrada no Entre', description: 'Primeira travessia deliberada', chapter: 'Cap. 2', type: 'plot' },
    ],
  },
  documents: [
    { id: 'd1', title: 'Prólogo: O Silêncio Antes', content: 'O Entre não era um lugar.\n\nEra o espaço entre a decisão de existir e a existência em si — aquele intervalo imperceptível onde algo ainda não sabe que vai ser.\n\nNinguém sabia do Entre porque ninguém voltava de lá para contá-lo. Ou voltavam tão diferentes que as palavras certas simplesmente não existiam mais para eles.', createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000 },
    { id: 'd2', title: 'Cap. 1 — A Fissura', content: 'Mara descobriu o Entre da única maneira possível: sem querer.\n\nEla estava olhando para a fresta de luz embaixo da porta do quarto quando percebeu que a fresta olhava de volta.\n\nNão foi assustador. Foi pior: foi familiar.\n\nComo reconhecer uma música que você nunca ouviu, mas que seu corpo já sabia como dançar.', createdAt: Date.now() - 43200000, updatedAt: Date.now() - 43200000 },
    { id: 'd3', title: 'Cap. 2 — Nomes Sem Forma', content: '', createdAt: Date.now(), updatedAt: Date.now() },
  ],
}

interface Store {
  // Auth
  user: User | null
  login: (name: string, email: string) => void
  logout: () => void

  // Projects
  projects: Project[]
  activeProjectId: string | null
  activeDocumentId: string | null

  // UI state
  rightPanelTab: RightPanelTab
  selectedText: string
  isGenerating: boolean
  errorMessage: string | null

  // AI Cards
  cards: AICard[]

  // Derived helpers
  activeProject: () => Project | null
  activeDocument: () => Document | null

  // Actions
  setActiveProject: (id: string) => void
  setActiveDocument: (id: string) => void
  updateDocumentContent: (docId: string, content: string) => void
  updateDocumentTitle: (docId: string, title: string) => void
  addDocument: (projectId: string) => void
  addProject: (name: string, synopsis: string, genre: string) => string
  deleteProject: (id: string) => void
  updateProject: (id: string, patch: Partial<Pick<Project, 'name' | 'synopsis' | 'genre' | 'wordCountGoal' | 'coverColor'>>) => void
  setSelectedText: (text: string) => void
  setRightPanelTab: (tab: RightPanelTab) => void

  // Cards
  addCard: (card: Omit<AICard, 'id' | 'timestamp'>) => string
  updateCard: (id: string, patch: Partial<AICard>) => void
  removeCard: (id: string) => void
  insertCardText: (cardId: string) => void

  // Generation
  setGenerating: (v: boolean) => void
  setError: (msg: string | null) => void

  // Bible
  updateBible: (projectId: string, bible: Partial<Bible>) => void
  addCharacter: (projectId: string, char: Omit<Character, 'id'>) => void
  updateCharacter: (projectId: string, charId: string, patch: Partial<Character>) => void
  deleteCharacter: (projectId: string, charId: string) => void
  addLocation: (projectId: string, loc: Omit<Location, 'id'>) => void
  updateLocation: (projectId: string, locId: string, patch: Partial<Location>) => void
  deleteLocation: (projectId: string, locId: string) => void
  addTimelineEvent: (projectId: string, event: Omit<TimelineEvent, 'id'>) => void
  deleteTimelineEvent: (projectId: string, eventId: string) => void

  // Beats
  addBeat: (projectId: string, beat: Omit<Beat, 'id'>) => void
  updateBeat: (projectId: string, beatId: string, patch: Partial<Beat>) => void
  deleteBeat: (projectId: string, beatId: string) => void
  reorderBeats: (projectId: string, beats: Beat[]) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      projects: [SAMPLE_PROJECT],
      activeProjectId: null,
      activeDocumentId: null,
      rightPanelTab: 'history',
      selectedText: '',
      isGenerating: false,
      errorMessage: null,
      cards: [],

      login: (name, email) => set({ user: { id: `u${Date.now()}`, name, email, createdAt: Date.now() } }),
      logout: () => set({ user: null, activeProjectId: null, activeDocumentId: null }),

      activeProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find(p => p.id === activeProjectId) ?? null
      },
      activeDocument: () => {
        const { activeDocumentId } = get()
        const project = get().activeProject()
        return project?.documents.find(d => d.id === activeDocumentId) ?? null
      },

      setActiveProject: (id) => set({ activeProjectId: id }),
      setActiveDocument: (id) => set({ activeDocumentId: id }),

      updateDocumentContent: (docId, content) =>
        set(state => ({ projects: state.projects.map(p => ({ ...p, documents: p.documents.map(d => d.id === docId ? { ...d, content, updatedAt: Date.now() } : d) })) })),

      updateDocumentTitle: (docId, title) =>
        set(state => ({ projects: state.projects.map(p => ({ ...p, documents: p.documents.map(d => d.id === docId ? { ...d, title, updatedAt: Date.now() } : d) })) })),

      addDocument: (projectId) => {
        const newDoc: Document = { id: `d${Date.now()}`, title: 'Novo capítulo', content: '', createdAt: Date.now(), updatedAt: Date.now() }
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, documents: [...p.documents, newDoc] } : p), activeDocumentId: newDoc.id }))
      },

      addProject: (name, synopsis, genre) => {
        const id = `p${Date.now()}`
        const firstDoc: Document = { id: `d${Date.now()}`, title: 'Cap. 1', content: '', createdAt: Date.now(), updatedAt: Date.now() }
        const newProject: Project = { id, name, synopsis, genre, coverColor: `hsl(${Math.floor(Math.random() * 360)}, 40%, 50%)`, documents: [firstDoc], bible: DEFAULT_BIBLE, beats: [], createdAt: Date.now() }
        set(state => ({ projects: [...state.projects, newProject], activeProjectId: id, activeDocumentId: firstDoc.id }))
        return id
      },

      deleteProject: (id) =>
        set(state => ({ projects: state.projects.filter(p => p.id !== id), activeProjectId: state.activeProjectId === id ? null : state.activeProjectId })),

      updateProject: (id, patch) =>
        set(state => ({ projects: state.projects.map(p => p.id === id ? { ...p, ...patch } : p) })),

      setSelectedText: (text) => set({ selectedText: text }),
      setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

      addCard: (card) => {
        const id = `card${Date.now()}`
        set(state => ({ cards: [{ ...card, id, timestamp: Date.now() }, ...state.cards] }))
        return id
      },
      updateCard: (id, patch) => set(state => ({ cards: state.cards.map(c => c.id === id ? { ...c, ...patch } : c) })),
      removeCard: (id) => set(state => ({ cards: state.cards.filter(c => c.id !== id) })),
      insertCardText: (cardId) => {
        const { cards, activeDocumentId, updateDocumentContent, activeDocument } = get()
        const card = cards.find(c => c.id === cardId)
        const doc = activeDocument()
        if (!card || !doc || !activeDocumentId) return
        updateDocumentContent(activeDocumentId, doc.content + (doc.content.endsWith('\n') ? '' : '\n\n') + card.response)
      },

      setGenerating: (v) => set({ isGenerating: v }),
      setError: (msg) => set({ errorMessage: msg }),

      updateBible: (projectId, bible) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, ...bible } } : p) })),

      addCharacter: (projectId, char) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, characters: [...p.bible.characters, { ...char, id: `c${Date.now()}` }] } } : p) })),
      updateCharacter: (projectId, charId, patch) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, characters: p.bible.characters.map(c => c.id === charId ? { ...c, ...patch } : c) } } : p) })),
      deleteCharacter: (projectId, charId) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, characters: p.bible.characters.filter(c => c.id !== charId) } } : p) })),

      addLocation: (projectId, loc) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, locations: [...p.bible.locations, { ...loc, id: `l${Date.now()}` }] } } : p) })),
      updateLocation: (projectId, locId, patch) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, locations: p.bible.locations.map(l => l.id === locId ? { ...l, ...patch } : l) } } : p) })),
      deleteLocation: (projectId, locId) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, locations: p.bible.locations.filter(l => l.id !== locId) } } : p) })),

      addTimelineEvent: (projectId, event) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, timeline: [...p.bible.timeline, { ...event, id: `t${Date.now()}` }] } } : p) })),
      deleteTimelineEvent: (projectId, eventId) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, bible: { ...p.bible, timeline: p.bible.timeline.filter(e => e.id !== eventId) } } : p) })),

      addBeat: (projectId, beat) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, beats: [...p.beats, { ...beat, id: `b${Date.now()}` }] } : p) })),
      updateBeat: (projectId, beatId, patch) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, beats: p.beats.map(b => b.id === beatId ? { ...b, ...patch } : b) } : p) })),
      deleteBeat: (projectId, beatId) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, beats: p.beats.filter(b => b.id !== beatId) } : p) })),
      reorderBeats: (projectId, beats) =>
        set(state => ({ projects: state.projects.map(p => p.id === projectId ? { ...p, beats } : p) })),
    }),
    {
      name: 'narrative-simulator-v2',
      partialize: (state) => ({ user: state.user, projects: state.projects, activeProjectId: state.activeProjectId, activeDocumentId: state.activeDocumentId, cards: state.cards.slice(0, 50) }),
    }
  )
)
