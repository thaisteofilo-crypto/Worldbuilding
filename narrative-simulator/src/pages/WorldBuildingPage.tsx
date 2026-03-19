import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import type { Character, Location, TimelineEvent } from '@/types'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Label,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@overlens/legacy-components'
import {
  Add2LineIcon,
  ArrowBackLineIcon,
  DeleteLineIcon,
  EditSolidIcon,
  ProfileLineIcon,
  ImageLineIcon,
  CalendarSolidIcon,
  BookmarkLineIcon,
} from '@overlens/legacy-icons'

// ---------------------------------------------------------------------------
// Character Dialog
// ---------------------------------------------------------------------------

interface CharacterFormState {
  name: string
  role: string
  description: string
  traitsRaw: string
  motivation: string
  arc: string
  relationships: string
}

const emptyCharForm = (): CharacterFormState => ({
  name: '',
  role: '',
  description: '',
  traitsRaw: '',
  motivation: '',
  arc: '',
  relationships: '',
})

function charToForm(c: Character): CharacterFormState {
  return {
    name: c.name,
    role: c.role,
    description: c.description,
    traitsRaw: c.traits.join(', '),
    motivation: c.motivation ?? '',
    arc: c.arc ?? '',
    relationships: c.relationships ?? '',
  }
}

interface CharacterDialogProps {
  projectId: string
  character?: Character
  children: React.ReactNode
}

function CharacterDialog({ projectId, character, children }: CharacterDialogProps) {
  const addCharacter = useStore((s) => s.addCharacter)
  const updateCharacter = useStore((s) => s.updateCharacter)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<CharacterFormState>(emptyCharForm)

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setForm(character ? charToForm(character) : emptyCharForm())
    }
    setOpen(isOpen)
  }

  function handleChange(field: keyof CharacterFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    const traits = form.traitsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload: Omit<Character, 'id'> = {
      name: form.name.trim(),
      role: form.role.trim(),
      description: form.description.trim(),
      traits,
      motivation: form.motivation.trim() || undefined,
      arc: form.arc.trim() || undefined,
      relationships: form.relationships.trim() || undefined,
    }
    if (character) {
      updateCharacter(projectId, character.id, payload)
    } else {
      addCharacter(projectId, payload)
    }
    setOpen(false)
  }

  const isEditing = !!character
  const canSave = form.name.trim().length > 0 && form.role.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {isEditing ? 'Editar Personagem' : 'Novo Personagem'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="char-name" className="text-zinc-300 text-sm">
                Nome *
              </Label>
              <Input
                id="char-name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Mara"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="char-role" className="text-zinc-300 text-sm">
                Papel *
              </Label>
              <Input
                id="char-role"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Ex: Protagonista"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="char-description" className="text-zinc-300 text-sm">
              Descrição
            </Label>
            <Textarea
              id="char-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Quem é este personagem?"
              rows={3}
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="char-traits" className="text-zinc-300 text-sm">
              Traços de personalidade
              <span className="text-zinc-500 ml-1 font-normal">(separados por vírgula)</span>
            </Label>
            <Input
              id="char-traits"
              value={form.traitsRaw}
              onChange={(e) => handleChange('traitsRaw', e.target.value)}
              placeholder="Ex: curioso, corajoso, introspectivo"
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="char-motivation" className="text-zinc-300 text-sm">
              Motivação
            </Label>
            <Input
              id="char-motivation"
              value={form.motivation}
              onChange={(e) => handleChange('motivation', e.target.value)}
              placeholder="O que move este personagem?"
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="char-arc" className="text-zinc-300 text-sm">
              Arco
            </Label>
            <Input
              id="char-arc"
              value={form.arc}
              onChange={(e) => handleChange('arc', e.target.value)}
              placeholder="Como este personagem muda ao longo da história?"
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="char-relationships" className="text-zinc-300 text-sm">
              Relacionamentos
            </Label>
            <Textarea
              id="char-relationships"
              value={form.relationships}
              onChange={(e) => handleChange('relationships', e.target.value)}
              placeholder="Conexões com outros personagens..."
              rows={2}
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
          >
            {isEditing ? 'Salvar alterações' : 'Criar personagem'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Location Dialog
// ---------------------------------------------------------------------------

interface LocationFormState {
  name: string
  type: string
  description: string
  sensory: string
}

const emptyLocForm = (): LocationFormState => ({
  name: '',
  type: '',
  description: '',
  sensory: '',
})

function locToForm(l: Location): LocationFormState {
  return {
    name: l.name,
    type: l.type,
    description: l.description,
    sensory: l.sensory ?? '',
  }
}

interface LocationDialogProps {
  projectId: string
  location?: Location
  children: React.ReactNode
}

function LocationDialog({ projectId, location, children }: LocationDialogProps) {
  const addLocation = useStore((s) => s.addLocation)
  const updateLocation = useStore((s) => s.updateLocation)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<LocationFormState>(emptyLocForm)

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      setForm(location ? locToForm(location) : emptyLocForm())
    }
    setOpen(isOpen)
  }

  function handleChange(field: keyof LocationFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    const payload: Omit<Location, 'id'> = {
      name: form.name.trim(),
      type: form.type.trim(),
      description: form.description.trim(),
      sensory: form.sensory.trim() || undefined,
    }
    if (location) {
      updateLocation(projectId, location.id, payload)
    } else {
      addLocation(projectId, payload)
    }
    setOpen(false)
  }

  const isEditing = !!location
  const canSave = form.name.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            {isEditing ? 'Editar Local' : 'Novo Local'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-name" className="text-zinc-300 text-sm">
                Nome *
              </Label>
              <Input
                id="loc-name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: O Entre"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="loc-type" className="text-zinc-300 text-sm">
                Tipo
              </Label>
              <Input
                id="loc-type"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                placeholder="Ex: Plano de existência"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loc-description" className="text-zinc-300 text-sm">
              Descrição
            </Label>
            <Textarea
              id="loc-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="O que torna este lugar especial ou único?"
              rows={3}
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="loc-sensory" className="text-zinc-300 text-sm">
              Detalhes sensoriais
            </Label>
            <Textarea
              id="loc-sensory"
              value={form.sensory}
              onChange={(e) => handleChange('sensory', e.target.value)}
              placeholder="Sons, cheiros, texturas, luz... como se sente estar aqui?"
              rows={3}
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-50"
          >
            {isEditing ? 'Salvar alterações' : 'Criar local'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Timeline Event Dialog
// ---------------------------------------------------------------------------

interface EventFormState {
  title: string
  description: string
  chapter: string
  type: TimelineEvent['type']
}

const emptyEventForm = (): EventFormState => ({
  title: '',
  description: '',
  chapter: '',
  type: 'plot',
})

const eventTypeLabels: Record<TimelineEvent['type'], string> = {
  plot: 'Enredo',
  character: 'Personagem',
  world: 'Mundo',
  conflict: 'Conflito',
}

interface EventDialogProps {
  projectId: string
  children: React.ReactNode
}

function EventDialog({ projectId, children }: EventDialogProps) {
  const addTimelineEvent = useStore((s) => s.addTimelineEvent)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<EventFormState>(emptyEventForm)

  function handleOpen(isOpen: boolean) {
    if (isOpen) setForm(emptyEventForm())
    setOpen(isOpen)
  }

  function handleChange(field: keyof EventFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    const payload: Omit<TimelineEvent, 'id'> = {
      title: form.title.trim(),
      description: form.description.trim(),
      chapter: form.chapter.trim() || undefined,
      type: form.type,
    }
    addTimelineEvent(projectId, payload)
    setOpen(false)
  }

  const canSave = form.title.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Adicionar Evento</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 col-span-2">
              <Label htmlFor="event-title" className="text-zinc-300 text-sm">
                Título *
              </Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Primeira visão da fresta"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-chapter" className="text-zinc-300 text-sm">
                Capítulo
              </Label>
              <Input
                id="event-chapter"
                value={form.chapter}
                onChange={(e) => handleChange('chapter', e.target.value)}
                placeholder="Ex: Cap. 1"
                className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="event-type" className="text-zinc-300 text-sm">
                Tipo
              </Label>
              <select
                id="event-type"
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="h-9 rounded-md border border-zinc-600 bg-zinc-800 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="plot">Enredo</option>
                <option value="character">Personagem</option>
                <option value="world">Mundo</option>
                <option value="conflict">Conflito</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-description" className="text-zinc-300 text-sm">
              Descrição
            </Label>
            <Textarea
              id="event-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="O que acontece neste evento?"
              rows={3}
              className="bg-zinc-800 border-zinc-600 text-zinc-100 placeholder:text-zinc-500 resize-none"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
          >
            Adicionar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Event type color helpers
// ---------------------------------------------------------------------------

function eventDotColor(type: TimelineEvent['type']): string {
  switch (type) {
    case 'plot':
      return 'bg-blue-500'
    case 'character':
      return 'bg-purple-500'
    case 'world':
      return 'bg-emerald-500'
    case 'conflict':
      return 'bg-red-500'
  }
}

function eventBadgeVariant(
  type: TimelineEvent['type']
): 'info' | 'default' | 'success' | 'warning' {
  switch (type) {
    case 'plot':
      return 'info'
    case 'character':
      return 'default'
    case 'world':
      return 'success'
    case 'conflict':
      return 'warning'
  }
}

// ---------------------------------------------------------------------------
// Tab: Personagens
// ---------------------------------------------------------------------------

function TabPersonagens({ projectId }: { projectId: string }) {
  const characters = useStore((s) => s.activeProject()?.bible.characters ?? [])
  const deleteCharacter = useStore((s) => s.deleteCharacter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Personagens</h2>
          <p className="text-sm text-zinc-500">
            {characters.length === 0
              ? 'Nenhum personagem criado ainda'
              : `${characters.length} personagem${characters.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <CharacterDialog projectId={projectId}>
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5">
            <Add2LineIcon className="w-4 h-4" />
            Novo Personagem
          </Button>
        </CharacterDialog>
      </div>

      {characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          <ProfileLineIcon className="w-10 h-10 opacity-40" />
          <div className="text-center">
            <p className="font-medium">Nenhum personagem ainda</p>
            <p className="text-sm mt-1">Crie o primeiro personagem da sua história.</p>
          </div>
          <CharacterDialog projectId={projectId}>
            <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:text-zinc-100 gap-1.5">
              <Add2LineIcon className="w-4 h-4" />
              Criar personagem
            </Button>
          </CharacterDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {characters.map((char) => (
            <Card
              key={char.id}
              className="bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-zinc-100 text-base truncate">
                      {char.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {char.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CharacterDialog projectId={projectId} character={char}>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                            >
                              <EditSolidIcon className="w-3.5 h-3.5" />
                            </Button>
                          </CharacterDialog>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                          Editar
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                            onClick={() => deleteCharacter(projectId, char.id)}
                          >
                            <DeleteLineIcon className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                          Excluir
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {char.description && (
                  <p className="text-sm text-zinc-400 line-clamp-3">{char.description}</p>
                )}
                {char.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {char.traits.map((trait) => (
                      <Badge key={trait} variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                )}
                {char.motivation && (
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Motivação
                    </span>
                    <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{char.motivation}</p>
                  </div>
                )}
                {char.arc && (
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Arco
                    </span>
                    <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{char.arc}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Locais
// ---------------------------------------------------------------------------

function TabLocais({ projectId }: { projectId: string }) {
  const locations = useStore((s) => s.activeProject()?.bible.locations ?? [])
  const deleteLocation = useStore((s) => s.deleteLocation)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Locais</h2>
          <p className="text-sm text-zinc-500">
            {locations.length === 0
              ? 'Nenhum local criado ainda'
              : `${locations.length} local${locations.length !== 1 ? 'is' : ''}`}
          </p>
        </div>
        <LocationDialog projectId={projectId}>
          <Button className="bg-teal-600 hover:bg-teal-500 text-white gap-1.5">
            <Add2LineIcon className="w-4 h-4" />
            Novo Local
          </Button>
        </LocationDialog>
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          <ImageLineIcon className="w-10 h-10 opacity-40" />
          <div className="text-center">
            <p className="font-medium">Nenhum local ainda</p>
            <p className="text-sm mt-1">Mapeie os lugares que compõem o seu mundo.</p>
          </div>
          <LocationDialog projectId={projectId}>
            <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:text-zinc-100 gap-1.5">
              <Add2LineIcon className="w-4 h-4" />
              Criar local
            </Button>
          </LocationDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {locations.map((loc) => (
            <Card
              key={loc.id}
              className="bg-zinc-900 border-zinc-700 hover:border-zinc-600 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-zinc-100 text-base truncate">
                      {loc.name}
                    </CardTitle>
                    {loc.type && (
                      <Badge variant="info" className="mt-1 text-xs">
                        {loc.type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <LocationDialog projectId={projectId} location={loc}>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                            >
                              <EditSolidIcon className="w-3.5 h-3.5" />
                            </Button>
                          </LocationDialog>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                          Editar
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                            onClick={() => deleteLocation(projectId, loc.id)}
                          >
                            <DeleteLineIcon className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                          Excluir
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {loc.description && (
                  <p className="text-sm text-zinc-400 line-clamp-3">{loc.description}</p>
                )}
                {loc.sensory && (
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                      Sensorial
                    </span>
                    <p className="text-sm text-zinc-400 mt-0.5 line-clamp-3 italic">
                      {loc.sensory}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Linha do Tempo
// ---------------------------------------------------------------------------

function TabTimeline({ projectId }: { projectId: string }) {
  const timeline = useStore((s) => s.activeProject()?.bible.timeline ?? [])
  const deleteTimelineEvent = useStore((s) => s.deleteTimelineEvent)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Linha do Tempo</h2>
          <p className="text-sm text-zinc-500">
            {timeline.length === 0
              ? 'Nenhum evento registrado ainda'
              : `${timeline.length} evento${timeline.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <EventDialog projectId={projectId}>
          <Button className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5">
            <Add2LineIcon className="w-4 h-4" />
            Adicionar Evento
          </Button>
        </EventDialog>
      </div>

      {timeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          <CalendarSolidIcon className="w-10 h-10 opacity-40" />
          <div className="text-center">
            <p className="font-medium">Nenhum evento ainda</p>
            <p className="text-sm mt-1">Registre os eventos que moldam a sua narrativa.</p>
          </div>
          <EventDialog projectId={projectId}>
            <Button variant="outline" className="border-zinc-600 text-zinc-300 hover:text-zinc-100 gap-1.5">
              <Add2LineIcon className="w-4 h-4" />
              Adicionar evento
            </Button>
          </EventDialog>
        </div>
      ) : (
        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-4 bottom-4 w-px bg-zinc-700" />
          <div className="flex flex-col gap-0">
            {timeline.map((event) => (
              <div key={event.id} className="flex gap-4 group relative pb-6 last:pb-0">
                {/* Dot */}
                <div className="relative z-10 mt-1 shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border-2 border-zinc-900 ${eventDotColor(event.type)} shadow-sm`}
                  />
                </div>
                {/* Content */}
                <Card className="flex-1 bg-zinc-900 border-zinc-700 group-hover:border-zinc-600 transition-colors">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <CardTitle className="text-zinc-100 text-sm font-semibold">
                            {event.title}
                          </CardTitle>
                          <Badge variant={eventBadgeVariant(event.type)} className="text-xs">
                            {eventTypeLabels[event.type]}
                          </Badge>
                          {event.chapter && (
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {event.chapter}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-zinc-600 hover:text-red-400 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => deleteTimelineEvent(projectId, event.id)}
                            >
                              <DeleteLineIcon className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                            Excluir
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  {event.description && (
                    <CardContent className="pt-0 pb-3 px-4">
                      <p className="text-sm text-zinc-400">{event.description}</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Notas do Mundo
// ---------------------------------------------------------------------------

function TabNotes({ projectId }: { projectId: string }) {
  const notes = useStore((s) => s.activeProject()?.bible.notes ?? '')
  const updateBible = useStore((s) => s.updateBible)
  const [localNotes, setLocalNotes] = useState(notes)

  function handleBlur() {
    updateBible(projectId, { notes: localNotes })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Lore e Regras do Mundo</h2>
          <p className="text-sm text-zinc-500">
            Anotações livres sobre o universo da sua história
          </p>
        </div>
        <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs font-mono">
          {localNotes.length} caracteres
        </Badge>
      </div>
      <Card className="bg-zinc-900 border-zinc-700">
        <CardContent className="p-4">
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleBlur}
            placeholder="Escreva aqui as regras do mundo, lore, mitologia, sistema de magia, história do universo... Salvo automaticamente ao sair do campo."
            rows={20}
            className="bg-transparent border-none text-zinc-300 placeholder:text-zinc-600 resize-none focus:ring-0 focus:outline-none text-sm leading-relaxed w-full p-0"
          />
        </CardContent>
      </Card>
      <p className="text-xs text-zinc-600 text-right">
        Salvo automaticamente ao sair do campo de texto
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function WorldBuildingPage() {
  const navigate = useNavigate()
  const activeProjectId = useStore((s) => s.activeProjectId)
  const getActiveProject = useStore((s) => s.activeProject)
  const project = getActiveProject()

  if (!project || !activeProjectId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 text-zinc-400">
        <BookmarkLineIcon className="w-14 h-14 opacity-30" />
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-300">Nenhum projeto selecionado</p>
          <p className="text-sm mt-1 text-zinc-500">
            Selecione um projeto para acessar a construção do mundo.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-zinc-700 text-zinc-300 hover:text-zinc-100 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowBackLineIcon className="w-4 h-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 shrink-0"
                  onClick={() => navigate(-1)}
                >
                  <ArrowBackLineIcon className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-800 text-zinc-200 border-zinc-700">
                Voltar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-5 bg-zinc-700" />

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-zinc-100 truncate">
              Construção do Mundo
              <span className="text-zinc-500 font-normal"> — {project.name}</span>
            </h1>
            <nav className="flex items-center gap-1 text-xs text-zinc-600 mt-0.5">
              <span
                className="hover:text-zinc-400 cursor-pointer transition-colors"
                onClick={() => navigate(-1)}
              >
                Projetos
              </span>
              <span>/</span>
              <span className="hover:text-zinc-400 cursor-pointer transition-colors text-zinc-500">
                {project.name}
              </span>
              <span>/</span>
              <span className="text-zinc-400">Mundo</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Tabs defaultValue="characters" className="flex flex-col gap-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto w-fit">
            <TabsTrigger
              value="characters"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
            >
              Personagens
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
            >
              Locais
            </TabsTrigger>
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
            >
              Linha do Tempo
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 hover:text-zinc-300 text-sm px-4 py-1.5 transition-colors"
            >
              Notas do Mundo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="characters" className="mt-0">
            <TabPersonagens projectId={activeProjectId} />
          </TabsContent>

          <TabsContent value="locations" className="mt-0">
            <TabLocais projectId={activeProjectId} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <TabTimeline projectId={activeProjectId} />
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <TabNotes projectId={activeProjectId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
