import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@overlens/legacy-components'
import {
  Add2LineIcon,
  BookmarkLineIcon,
  DeleteLineIcon,
  HistoryLineIcon,
  ImageLineIcon,
  ProfileLineIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'
import { AICard } from './AICard'
import type { Character, Location } from '@/types'

export function AIPanel() {
  const { cards, activeDocumentId, rightPanelTab, setRightPanelTab, activeProject, updateBible } = useStore()
  const project = activeProject()

  const docCards = cards.filter(c => c.documentId === activeDocumentId)

  return (
    <div className="flex flex-col h-full border-l border-border bg-card">
      <Tabs value={rightPanelTab} onValueChange={v => setRightPanelTab(v as 'history' | 'bible')} className="flex flex-col h-full">
        <div className="border-b border-border px-3 pt-2 pb-0">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1 gap-1.5">
              <HistoryLineIcon size="sm" />
              Histórico
              {docCards.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4 min-w-[18px]">
                  {docCards.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bible" className="flex-1 gap-1.5">
              <BookmarkLineIcon size="sm" />
              Bíblia
            </TabsTrigger>
          </TabsList>
        </div>

        {/* HISTORY */}
        <TabsContent value="history" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-3 flex flex-col gap-2">
              {docCards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <HistoryLineIcon size="md" className="text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">Sem resultados ainda</p>
                  <p className="text-xs text-muted-foreground">
                    Use os botões na barra superior para gerar texto com IA. Os resultados aparecerão aqui como cards.
                  </p>
                </div>
              ) : (
                <>
                  {docCards.map(card => (
                    <AICard key={card.id} card={card} />
                  ))}
                  {docCards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive text-xs w-full"
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

        {/* BIBLE */}
        <TabsContent value="bible" className="flex-1 overflow-hidden m-0">
          {project ? (
            <BibleEditor projectId={project.id} bible={project.bible} onUpdate={updateBible} />
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">Selecione um projeto</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BibleEditor({ projectId, bible, onUpdate }: {
  projectId: string
  bible: { characters: Character[]; locations: Location[]; notes: string }
  onUpdate: (id: string, b: Partial<typeof bible>) => void
}) {
  const [newChar, setNewChar] = useState({ name: '', role: '', description: '' })
  const [newLoc, setNewLoc] = useState({ name: '', type: '', description: '' })

  const addCharacter = () => {
    if (!newChar.name.trim()) return
    const char: Character = {
      id: `c${Date.now()}`,
      name: newChar.name,
      role: newChar.role || 'Personagem',
      description: newChar.description,
      traits: [],
    }
    onUpdate(projectId, { characters: [...bible.characters, char] })
    setNewChar({ name: '', role: '', description: '' })
  }

  const addLocation = () => {
    if (!newLoc.name.trim()) return
    const loc: Location = {
      id: `l${Date.now()}`,
      name: newLoc.name,
      type: newLoc.type || 'Local',
      description: newLoc.description,
    }
    onUpdate(projectId, { locations: [...bible.locations, loc] })
    setNewLoc({ name: '', type: '', description: '' })
  }

  const removeChar = (id: string) =>
    onUpdate(projectId, { characters: bible.characters.filter(c => c.id !== id) })

  const removeLoc = (id: string) =>
    onUpdate(projectId, { locations: bible.locations.filter(l => l.id !== id) })

  return (
    <ScrollArea className="h-full">
      <div className="p-3 flex flex-col gap-4">
        {/* Characters */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ProfileLineIcon size="sm" className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Personagens</span>
            </div>
            <Badge variant="secondary" className="text-xs">{bible.characters.length}</Badge>
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            {bible.characters.map(c => (
              <Card key={c.id} className="border-border/50">
                <CardContent className="p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{c.role}</Badge>
                      </div>
                      {c.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.description}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeChar(c.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive">
                      <DeleteLineIcon size="sm" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 p-2.5 rounded-md border border-dashed border-border">
            <Input placeholder="Nome" value={newChar.name} onChange={e => setNewChar(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs" />
            <Input placeholder="Papel (ex: Protagonista)" value={newChar.role} onChange={e => setNewChar(p => ({ ...p, role: e.target.value }))} className="h-7 text-xs" />
            <Textarea placeholder="Descrição breve" value={newChar.description} onChange={e => setNewChar(p => ({ ...p, description: e.target.value }))} className="text-xs min-h-[52px]" />
            <Button size="sm" variant="outline" className="h-7 text-xs w-full gap-1" onClick={addCharacter}>
              <Add2LineIcon size="sm" /> Adicionar personagem
            </Button>
          </div>
        </section>

        <Separator />

        {/* Locations */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ImageLineIcon size="sm" className="text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Locais</span>
            </div>
            <Badge variant="secondary" className="text-xs">{bible.locations.length}</Badge>
          </div>

          <div className="flex flex-col gap-1.5 mb-2">
            {bible.locations.map(l => (
              <Card key={l.id} className="border-border/50">
                <CardContent className="p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{l.name}</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{l.type}</Badge>
                      </div>
                      {l.description && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{l.description}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon-xs" onClick={() => removeLoc(l.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive">
                      <DeleteLineIcon size="sm" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 p-2.5 rounded-md border border-dashed border-border">
            <Input placeholder="Nome do local" value={newLoc.name} onChange={e => setNewLoc(p => ({ ...p, name: e.target.value }))} className="h-7 text-xs" />
            <Input placeholder="Tipo (ex: Cidade, Reino)" value={newLoc.type} onChange={e => setNewLoc(p => ({ ...p, type: e.target.value }))} className="h-7 text-xs" />
            <Textarea placeholder="Descrição breve" value={newLoc.description} onChange={e => setNewLoc(p => ({ ...p, description: e.target.value }))} className="text-xs min-h-[52px]" />
            <Button size="sm" variant="outline" className="h-7 text-xs w-full gap-1" onClick={addLocation}>
              <Add2LineIcon size="sm" /> Adicionar local
            </Button>
          </div>
        </section>

        <Separator />

        {/* Notes */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <BookmarkLineIcon size="sm" className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Notas do Mundo</span>
          </div>
          <Textarea
            placeholder="Regras do mundo, lore, notas gerais..."
            value={bible.notes}
            onChange={e => onUpdate(projectId, { notes: e.target.value })}
            className="text-xs min-h-[100px] leading-relaxed"
          />
        </section>
      </div>
    </ScrollArea>
  )
}
