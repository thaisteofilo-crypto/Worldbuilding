import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Badge,
  Card,
  CardContent,
  ScrollArea,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@overlens/legacy-components'
import {
  ArrowBackLineIcon,
  Add2LineIcon,
  BookmarkLineIcon,
  CognitionLineIcon,
  DeleteLineIcon,
  DocLineIcon,
  DockToRightLineIcon,
  EditSolidIcon,
  GraphicEqLineIcon,
  HistoryLineIcon,
  ImageLineIcon,
  LanguageLineIcon,
  ProfileLineIcon,
  SettingsLineIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'
import { useAI } from '@/hooks/useAI'
import type { AIFeature, AICard } from '@/types'

// ─── Feature metadata ─────────────────────────────────────────────────────────

const FEATURES: {
  feature: AIFeature
  label: string
  icon: React.ElementType
  description: string
}[] = [
  {
    feature: 'write',
    label: 'Escrever',
    icon: EditSolidIcon,
    description: 'Continua a história a partir do cursor',
  },
  {
    feature: 'describe',
    label: 'Descrever',
    icon: ImageLineIcon,
    description: 'Adiciona descrições sensoriais ricas ao trecho selecionado',
  },
  {
    feature: 'brainstorm',
    label: 'Brainstorm',
    icon: CognitionLineIcon,
    description: 'Gera 3 direções possíveis para a história',
  },
  {
    feature: 'rewrite',
    label: 'Reescrever',
    icon: GraphicEqLineIcon,
    description: 'Reescreve o trecho selecionado em 3 versões',
  },
  {
    feature: 'feedback',
    label: 'Feedback',
    icon: HistoryLineIcon,
    description: 'Análise criativa do trecho atual',
  },
]

const FEATURE_META: Record<
  AIFeature,
  { label: string; icon: React.ElementType; color: string }
> = {
  write: { label: 'Escrever', icon: EditSolidIcon, color: 'text-blue-400' },
  describe: { label: 'Descrever', icon: ImageLineIcon, color: 'text-emerald-400' },
  brainstorm: { label: 'Brainstorm', icon: CognitionLineIcon, color: 'text-amber-400' },
  rewrite: { label: 'Reescrever', icon: GraphicEqLineIcon, color: 'text-purple-400' },
  feedback: { label: 'Feedback', icon: HistoryLineIcon, color: 'text-cyan-400' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  if (diff < 60000) return 'agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
  return `${Math.floor(diff / 3600000)}h`
}

// ─── AI Card component (inline for this page) ────────────────────────────────

function AICardItem({ card }: { card: AICard }) {
  const { insertCardText, removeCard } = useStore()
  const [expanded, setExpanded] = useState(true)
  const meta = FEATURE_META[card.feature]
  const Icon = meta.icon

  return (
    <Card className="border-border/60 overflow-hidden bg-card/80">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors text-left"
      >
        <Icon size="sm" className={meta.color} />
        <span className="text-xs font-medium text-foreground flex-1">{meta.label}</span>
        <span className="text-xs text-muted-foreground">{timeAgo(card.timestamp)}</span>
        <span className="text-muted-foreground text-[10px]">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <CardContent className="p-0">
          {/* Prompt excerpt */}
          {card.prompt && (
            <div className="px-3 py-2 border-t border-border/40 bg-muted/10">
              <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                &ldquo;{card.prompt.slice(0, 120)}{card.prompt.length > 120 ? '…' : ''}&rdquo;
              </p>
            </div>
          )}

          {/* Response */}
          <div className="px-3 py-3 border-t border-border/40">
            {card.streaming && !card.response ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="animate-pulse">●</span>
                <span>Gerando...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {card.response}
                {card.streaming && (
                  <span className="animate-pulse ml-0.5 text-primary">▌</span>
                )}
              </p>
            )}
          </div>

          {/* Actions */}
          {!card.streaming && card.response && (
            <div className="px-3 pb-3 flex items-center gap-2 border-t border-border/30 pt-2">
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5 flex-1"
                onClick={() => insertCardText(card.id)}
              >
                <Add2LineIcon size="sm" />
                Inserir no texto
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => removeCard(card.id)}
              >
                <DeleteLineIcon size="sm" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WritingPage() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()

  const {
    projects,
    activeProjectId,
    activeDocumentId,
    setActiveProject,
    setActiveDocument,
    addDocument,
    updateDocumentContent,
    updateDocumentTitle,
    activeProject,
    activeDocument,
    selectedText,
    setSelectedText,
    isGenerating,
    errorMessage,
    setError,
    rightPanelTab,
    setRightPanelTab,
    cards,
  } = useStore()

  const { run } = useAI()

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const project = activeProject()
  const doc = activeDocument()

  // Sync project from URL param on mount
  useEffect(() => {
    if (projectId && projectId !== activeProjectId) {
      const found = projects.find(p => p.id === projectId)
      if (found) {
        setActiveProject(projectId)
        if (found.documents[0]) setActiveDocument(found.documents[0].id)
      }
    }
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, 500) + 'px'
  }, [])

  useEffect(() => {
    resize()
  }, [doc?.content, resize])

  // Track text selection
  const handleSelect = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    const selected = el.value.slice(el.selectionStart, el.selectionEnd).trim()
    setSelectedText(selected)
  }, [setSelectedText])

  const wordCount = doc?.content ? countWords(doc.content) : 0
  const docCards = cards.filter(c => c.documentId === activeDocumentId)

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">

        {/* ── TopBar ───────────────────────────────────────────────────────── */}
        <header className="h-11 shrink-0 border-b border-border bg-card flex items-center px-3 gap-2 z-10">
          {/* Back + Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0 w-[200px] shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => navigate('/projects')}
                  className="shrink-0"
                >
                  <ArrowBackLineIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Voltar aos projetos</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-1 min-w-0 text-xs">
              <span className="text-muted-foreground truncate max-w-[80px]">
                {project?.name ?? 'Projeto'}
              </span>
              {doc && (
                <>
                  <span className="text-muted-foreground/50 shrink-0">/</span>
                  <span className="text-foreground/80 truncate max-w-[80px] font-medium">
                    {doc.title}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center: AI Feature Buttons */}
          <div className="flex-1 flex items-center justify-center gap-1">
            {FEATURES.map(({ feature, label, icon: Icon, description }) => (
              <Tooltip key={feature}>
                <TooltipTrigger asChild>
                  <Button
                    variant={feature === 'write' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => run(feature)}
                    disabled={isGenerating || !doc}
                    className="gap-1.5 h-8 text-xs"
                  >
                    <Icon size="sm" />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{label}</p>
                  <p className="text-muted-foreground text-xs">{description}</p>
                  {(feature === 'describe' || feature === 'rewrite') && (
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Selecione texto primeiro para melhores resultados
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}

            {selectedText && (
              <Badge variant="secondary" className="text-xs h-6 ml-1 shrink-0">
                {countWords(selectedText)} sel.
              </Badge>
            )}
          </div>

          {/* Right: status + word count + settings */}
          <div className="flex items-center gap-3 w-[200px] shrink-0 justify-end">
            {errorMessage && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-destructive truncate max-w-[120px]">
                  {errorMessage}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setError(null)}
                  className="shrink-0 text-muted-foreground"
                >
                  ✕
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                <span className="inline-block size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Gerando...</span>
              </div>
            )}

            <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
              {wordCount.toLocaleString('pt-BR')} palavras
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground shrink-0"
                  onClick={() => navigate(`/projects/${activeProjectId}/settings`)}
                >
                  <SettingsLineIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Configurações do projeto</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* ── Body (3 columns) ─────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left Sidebar ────────────────────────────────────────────────── */}
          <aside className="w-[200px] shrink-0 border-r border-border flex flex-col bg-sidebar h-full overflow-hidden">
            {/* Project title */}
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-snug">
                {project?.name ?? 'Nenhum projeto'}
              </p>
              {project?.genre && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {project.genre}
                </p>
              )}
            </div>

            {/* Documents list */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Documentos
                </span>
                {project && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => addDocument(project.id)}
                        className="text-muted-foreground hover:text-foreground -mr-1"
                      >
                        <Add2LineIcon size="sm" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Novo documento</TooltipContent>
                  </Tooltip>
                )}
              </div>

              <ScrollArea className="flex-1 px-2">
                <div className="pb-2 flex flex-col gap-0.5">
                  {project?.documents.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setActiveDocument(d.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors group ${
                        d.id === activeDocumentId
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <DocLineIcon size="sm" className="shrink-0" />
                      <span className="truncate flex-1">{d.title}</span>
                      {!d.content && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-3.5 shrink-0 opacity-60"
                        >
                          vazio
                        </Badge>
                      )}
                    </button>
                  ))}

                  {!project && (
                    <p className="text-xs text-muted-foreground px-2 py-2">
                      Nenhum projeto ativo.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Bottom: "+ Novo" + nav links */}
            <div className="border-t border-border p-2 flex flex-col gap-0.5">
              {project && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => addDocument(project.id)}
                >
                  <Add2LineIcon size="sm" />
                  Novo capítulo
                </Button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      navigate(activeProjectId ? `/projects/${activeProjectId}/world` : '/projects')
                    }
                    className="w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <LanguageLineIcon size="sm" className="shrink-0" />
                    <span>Mundo</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Bíblia do mundo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      navigate(activeProjectId ? `/projects/${activeProjectId}/storyboard` : '/projects')
                    }
                    className="w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <DockToRightLineIcon size="sm" className="shrink-0" />
                    <span>Storyboard</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Storyboard / Beats</TooltipContent>
              </Tooltip>
            </div>
          </aside>

          {/* ── Center Editor ────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">
            {doc ? (
              <ScrollArea className="flex-1 h-full">
                <div className="min-h-full px-6 py-10 max-w-3xl mx-auto w-full">
                  {/* Document title */}
                  <input
                    ref={titleRef}
                    value={doc.title}
                    onChange={e => updateDocumentTitle(doc.id, e.target.value)}
                    placeholder="Título do documento..."
                    className="w-full text-[1.75rem] font-heading font-bold text-foreground bg-transparent border-0 outline-none mb-2 placeholder:text-muted-foreground/30 leading-tight tracking-tight"
                  />

                  <Separator className="mb-8 opacity-20" />

                  {/* Writing textarea */}
                  <textarea
                    ref={textareaRef}
                    value={doc.content}
                    onChange={e => {
                      updateDocumentContent(doc.id, e.target.value)
                      resize()
                    }}
                    onSelect={handleSelect}
                    onKeyUp={handleSelect}
                    onMouseUp={handleSelect}
                    placeholder="Comece a escrever aqui..."
                    className="w-full resize-none bg-transparent border-0 outline-none text-base text-foreground font-body placeholder:text-muted-foreground/25 min-h-[500px]"
                    style={{ lineHeight: '1.8', letterSpacing: '0.012em' }}
                  />
                </div>

                {/* Word count footer */}
                <div className="max-w-3xl mx-auto px-6 pb-8">
                  <Separator className="mb-4 opacity-15" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground/50">
                    <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                    {project?.wordCountGoal && (
                      <span>
                        Meta: {project.wordCountGoal.toLocaleString('pt-BR')} palavras
                        {' '}
                        ({Math.round((wordCount / project.wordCountGoal) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                <div className="size-14 rounded-2xl bg-muted/30 flex items-center justify-center">
                  <DocLineIcon size="md" className="text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground/70 mb-1">
                    Nenhum documento selecionado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escolha um documento na barra lateral ou crie um novo capítulo.
                  </p>
                </div>
                {project && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 mt-2"
                    onClick={() => addDocument(project.id)}
                  >
                    <Add2LineIcon size="sm" />
                    Novo capítulo
                  </Button>
                )}
              </div>
            )}
          </main>

          {/* ── Right AI Panel ───────────────────────────────────────────────── */}
          <aside className="w-[280px] shrink-0 border-l border-border flex flex-col bg-card h-full overflow-hidden">
            <Tabs
              value={rightPanelTab}
              onValueChange={v => setRightPanelTab(v as 'history' | 'bible')}
              className="flex flex-col h-full"
            >
              {/* Tab header */}
              <div className="border-b border-border px-3 pt-2 pb-0 shrink-0">
                <TabsList className="w-full">
                  <TabsTrigger value="history" className="flex-1 gap-1.5 text-xs">
                    <HistoryLineIcon size="sm" />
                    IA
                    {docCards.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 min-w-[16px]"
                      >
                        {docCards.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="bible" className="flex-1 gap-1.5 text-xs">
                    <BookmarkLineIcon size="sm" />
                    Bíblia
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* IA / History tab */}
              <TabsContent value="history" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-3 flex flex-col gap-2">
                    {/* Error banner */}
                    {errorMessage && (
                      <div className="flex items-start gap-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive flex-1 leading-relaxed">
                          {errorMessage}
                        </p>
                        <button
                          onClick={() => setError(null)}
                          className="text-destructive/70 hover:text-destructive text-xs shrink-0 mt-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {docCards.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-14 text-center px-3">
                        <div className="size-10 rounded-xl bg-muted/30 flex items-center justify-center mb-3">
                          <HistoryLineIcon size="md" className="text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-medium text-foreground/70 mb-1.5">
                          Resultados de IA
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Use os botões acima para gerar texto. Os resultados aparecem aqui.
                        </p>
                      </div>
                    ) : (
                      <>
                        {docCards.map(card => (
                          <AICardItem key={card.id} card={card} />
                        ))}

                        {docCards.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive text-xs w-full gap-1.5 mt-1"
                            onClick={() => {
                              docCards.forEach(c => useStore.getState().removeCard(c.id))
                            }}
                          >
                            <DeleteLineIcon size="sm" />
                            Limpar histórico
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Bíblia tab */}
              <TabsContent value="bible" className="flex-1 overflow-hidden m-0">
                {project ? (
                  <ScrollArea className="h-full">
                    <div className="p-3 flex flex-col gap-4">
                      {/* Characters */}
                      {project.bible.characters.length > 0 && (
                        <section>
                          <div className="flex items-center gap-1.5 mb-2">
                            <ProfileLineIcon size="sm" className="text-muted-foreground" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Personagens
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
                              {project.bible.characters.length}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {project.bible.characters.map(c => (
                              <div
                                key={c.id}
                                className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-muted/20 border border-border/40"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">
                                      {c.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                    >
                                      {c.role}
                                    </Badge>
                                  </div>
                                  {c.description && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                      {c.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {project.bible.characters.length > 0 && project.bible.locations.length > 0 && (
                        <Separator className="opacity-30" />
                      )}

                      {/* Locations */}
                      {project.bible.locations.length > 0 && (
                        <section>
                          <div className="flex items-center gap-1.5 mb-2">
                            <LanguageLineIcon size="sm" className="text-muted-foreground" />
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              Locais
                            </span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-auto">
                              {project.bible.locations.length}
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            {project.bible.locations.map(l => (
                              <div
                                key={l.id}
                                className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-muted/20 border border-border/40"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-foreground">
                                      {l.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                                    >
                                      {l.type}
                                    </Badge>
                                  </div>
                                  {l.description && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                      {l.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Notes preview */}
                      {project.bible.notes && (
                        <>
                          <Separator className="opacity-30" />
                          <section>
                            <div className="flex items-center gap-1.5 mb-2">
                              <BookmarkLineIcon size="sm" className="text-muted-foreground" />
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Notas
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-4 px-2.5 py-2 rounded-md bg-muted/20 border border-border/40">
                              {project.bible.notes}
                            </p>
                          </section>
                        </>
                      )}

                      {/* Empty state */}
                      {project.bible.characters.length === 0 &&
                        project.bible.locations.length === 0 &&
                        !project.bible.notes && (
                          <div className="flex flex-col items-center justify-center py-10 text-center px-3">
                            <BookmarkLineIcon size="md" className="text-muted-foreground/30 mb-2" />
                            <p className="text-xs text-muted-foreground">
                              Bíblia ainda vazia. Adicione personagens e locais no editor de mundo.
                            </p>
                          </div>
                        )}

                      <Separator className="opacity-20" />

                      {/* Edit Bible link */}
                      <button
                        onClick={() =>
                          navigate(`/projects/${activeProjectId}/world`)
                        }
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors border border-border/40"
                      >
                        <BookmarkLineIcon size="sm" />
                        Editar Bíblia completa
                      </button>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Selecione um projeto para ver a Bíblia.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </div>
    </TooltipProvider>
  )
}
