import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Input,
  Textarea,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Separator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@overlens/legacy-components'
import {
  Add2LineIcon,
  SearchLineIcon,
  LogoutLineIcon,
  MoreLineIcon,
  DocLineIcon,
  ChartLineIcon,
  BookmarkLineIcon,
  DeleteLineIcon,
  EditSolidIcon,
  FolderSolidIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'
import type { Project } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GENRE_OPTIONS = [
  'Fantasia',
  'Ficção científica',
  'Ficção especulativa',
  'Romance',
  'Mistério',
  'Terror',
  'Thriller',
  'Histórico',
  'Aventura',
  'Drama',
  'Outro',
]

function wordCount(docs: Project['documents']): number {
  return docs.reduce((sum, d) => {
    const words = d.content.trim() === '' ? 0 : d.content.trim().split(/\s+/).length
    return sum + words
  }, 0)
}

function formatWordCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora mesmo'
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'ontem'
  if (days < 30) return `há ${days} dias`
  const months = Math.floor(days / 30)
  return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const navigate = useNavigate()
  const addProject = useStore(s => s.addProject)

  const [pName, setPName] = useState('')
  const [pGenre, setPGenre] = useState(GENRE_OPTIONS[0])
  const [pSynopsis, setPSynopsis] = useState('')
  const [formErrors, setFormErrors] = useState<{ name?: string }>({})

  function resetForm() {
    setPName('')
    setPGenre(GENRE_OPTIONS[0])
    setPSynopsis('')
    setFormErrors({})
  }

  function handleCreate() {
    const next: { name?: string } = {}
    if (!pName.trim()) next.name = 'O título é obrigatório'
    setFormErrors(next)
    if (Object.keys(next).length > 0) return

    const newId = addProject(pName.trim(), pSynopsis.trim(), pGenre)
    resetForm()
    onOpenChange(false)
    navigate(`/projects/${newId}/write`)
  }

  function handleOpenChange(v: boolean) {
    if (!v) resetForm()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-neutral-950 border border-neutral-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-bold text-white">
            Novo Projeto
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="np-name" className="text-neutral-300 text-sm font-medium">
              Título <span className="text-red-400">*</span>
            </Label>
            <Input
              id="np-name"
              placeholder="Ex: A Última Luz do Norte"
              value={pName}
              onChange={e => {
                setPName(e.target.value)
                if (formErrors.name) setFormErrors({})
              }}
              className={`bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 ${
                formErrors.name ? 'border-red-500' : ''
              }`}
              autoFocus
            />
            {formErrors.name && (
              <p className="text-xs text-red-400">{formErrors.name}</p>
            )}
          </div>

          {/* Genre */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="np-genre" className="text-neutral-300 text-sm font-medium">
              Gênero
            </Label>
            <select
              id="np-genre"
              value={pGenre}
              onChange={e => setPGenre(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 appearance-none cursor-pointer"
            >
              {GENRE_OPTIONS.map(g => (
                <option key={g} value={g} className="bg-neutral-900">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Synopsis */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="np-synopsis" className="text-neutral-300 text-sm font-medium">
              Sinopse{' '}
              <span className="text-neutral-600 font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="np-synopsis"
              placeholder="Em uma ou duas frases, do que é esse projeto?"
              value={pSynopsis}
              onChange={e => setPSynopsis(e.target.value)}
              rows={3}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              className="text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleCreate}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
          >
            Criar projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Rename Dialog
// ---------------------------------------------------------------------------

interface RenameDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

function RenameDialog({ project, open, onOpenChange }: RenameDialogProps) {
  const updateProject = useStore(s => s.updateProject)
  const [newName, setNewName] = useState(project.name)
  const [error, setError] = useState<string | undefined>()

  function handleRename() {
    if (!newName.trim()) {
      setError('O título é obrigatório')
      return
    }
    updateProject(project.id, { name: newName.trim() })
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (v) setNewName(project.name)
    setError(undefined)
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-neutral-950 border border-neutral-800 text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold text-white">
            Renomear projeto
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-2">
          <Label htmlFor="rename-input" className="text-neutral-300 text-sm font-medium">
            Novo título
          </Label>
          <Input
            id="rename-input"
            value={newName}
            onChange={e => {
              setNewName(e.target.value)
              if (error) setError(undefined)
            }}
            className={`bg-neutral-900 border-neutral-700 text-white focus-visible:ring-violet-500 focus-visible:border-violet-500 ${
              error ? 'border-red-500' : ''
            }`}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleRename() }}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-800">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleRename}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
          >
            Renomear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Delete Confirm Dialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DeleteDialog({ project, open, onOpenChange }: DeleteDialogProps) {
  const deleteProject = useStore(s => s.deleteProject)

  function handleDelete() {
    deleteProject(project.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-950 border border-neutral-800 text-white sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-bold text-white">
            Excluir projeto?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-neutral-400 py-1">
          Tem certeza que deseja excluir{' '}
          <span className="text-white font-medium">"{project.name}"</span>? Essa ação não pode ser
          desfeita.
        </p>
        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-neutral-800">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="font-semibold"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

interface ProjectCardProps {
  project: Project
}

function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const totalWords = wordCount(project.documents)
  const docCount = project.documents.length
  const beatCount = project.beats.length
  const synopsisTruncated =
    project.synopsis.length > 100
      ? project.synopsis.slice(0, 100).trimEnd() + '…'
      : project.synopsis

  function openWrite() {
    navigate(`/projects/${project.id}/write`)
  }

  function openStoryboard() {
    navigate(`/projects/${project.id}/storyboard`)
  }

  function openWorld() {
    navigate(`/projects/${project.id}/bible`)
  }

  return (
    <>
      <Card className="bg-neutral-950 border border-neutral-800 flex flex-col overflow-hidden group transition-all duration-200 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40">
        {/* Color accent bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{ backgroundColor: project.coverColor }}
        />

        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="font-heading text-lg font-bold text-white leading-snug truncate">
                {project.name}
              </CardTitle>
              <div className="mt-1.5">
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 border-0">
                  {project.genre}
                </Badge>
              </div>
            </div>

            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Opções do projeto"
                >
                  <MoreLineIcon size="sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-neutral-900 border border-neutral-700 text-neutral-200 min-w-[160px]"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800"
                  onClick={() => setRenameOpen(true)}
                >
                  <EditSolidIcon size="sm" />
                  Renomear
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800"
                  onClick={openStoryboard}
                >
                  <ChartLineIcon size="sm" />
                  Storyboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800"
                  onClick={openWorld}
                >
                  <BookmarkLineIcon size="sm" />
                  Mundo
                </DropdownMenuItem>
                <Separator className="my-1 bg-neutral-800" />
                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-950 focus:bg-red-950 hover:text-red-300 focus:text-red-300"
                  onClick={() => setDeleteOpen(true)}
                >
                  <DeleteLineIcon size="sm" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3 flex-1">
          {synopsisTruncated ? (
            <CardDescription className="text-sm text-neutral-500 leading-relaxed">
              {synopsisTruncated}
            </CardDescription>
          ) : (
            <CardDescription className="text-sm text-neutral-700 italic leading-relaxed">
              Sem sinopse ainda.
            </CardDescription>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <DocLineIcon size="sm" className="text-neutral-700" />
              <span>
                {docCount} {docCount === 1 ? 'doc' : 'docs'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <ChartLineIcon size="sm" className="text-neutral-700" />
              <span>{formatWordCount(totalWords)} palavras</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <BookmarkLineIcon size="sm" className="text-neutral-700" />
              <span>
                {beatCount} {beatCount === 1 ? 'beat' : 'beats'}
              </span>
            </div>
          </div>

          {/* Word count goal bar */}
          {project.wordCountGoal && project.wordCountGoal > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-neutral-700">Meta de palavras</span>
                <span className="text-xs text-neutral-600">
                  {Math.min(100, Math.round((totalWords / project.wordCountGoal) * 100))}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (totalWords / project.wordCountGoal) * 100)}%`,
                    backgroundColor: project.coverColor,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <span className="text-xs text-neutral-700">{timeAgo(project.createdAt)}</span>
          <Button
            size="sm"
            onClick={openWrite}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 shadow-sm shadow-violet-900/30 transition-colors"
          >
            Abrir
          </Button>
        </CardFooter>
      </Card>

      <RenameDialog project={project} open={renameOpen} onOpenChange={setRenameOpen} />
      <DeleteDialog project={project} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  onNew: () => void
}

function EmptyState({ onNew }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 px-4">
      <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-6">
        <FolderSolidIcon size="sm" className="text-neutral-700" />
      </div>
      <h2 className="font-heading text-xl font-bold text-white mb-2">
        Nenhum projeto ainda
      </h2>
      <p className="text-sm text-neutral-500 text-center max-w-xs leading-relaxed mb-8">
        Todo grande livro começa com uma ideia. Crie o seu primeiro projeto e comece a escrever.
      </p>
      <Button
        onClick={onNew}
        size="lg"
        className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 shadow-lg shadow-violet-900/30 transition-colors"
      >
        <Add2LineIcon size="sm" className="mr-2" />
        Criar primeiro projeto
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const navigate = useNavigate()
  const user = useStore(s => s.user)
  const projects = useStore(s => s.projects)
  const logout = useStore(s => s.logout)

  const [search, setSearch] = useState('')
  const [newOpen, setNewOpen] = useState(false)

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 w-full border-b border-neutral-900 bg-black/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow shadow-violet-900/40">
              <span className="text-white text-xs font-black select-none">N</span>
            </div>
            <span className="font-heading font-bold text-sm text-white tracking-tight hidden sm:block">
              Narrative Simulator
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-semibold text-neutral-300 select-none">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-neutral-500 hover:text-white hover:bg-neutral-900 gap-1.5 transition-colors"
            >
              <LogoutLineIcon size="sm" />
              <span className="hidden sm:block text-xs">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 py-8">
        {/* Page heading + actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {user ? `Olá, ${user.name.split(' ')[0]}` : 'Projetos'}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {projects.length === 0
                ? 'Comece criando seu primeiro projeto'
                : `${projects.length} ${projects.length === 1 ? 'projeto' : 'projetos'} no total`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchLineIcon
                size="sm"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
              />
              <Input
                placeholder="Buscar projeto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 w-52 bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-violet-500 focus-visible:border-violet-500 text-sm"
              />
            </div>

            {/* New project button */}
            <Button
              onClick={() => setNewOpen(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-1.5 shrink-0 shadow-md shadow-violet-900/30 transition-colors"
            >
              <Add2LineIcon size="sm" />
              Novo Projeto
            </Button>
          </div>
        </div>

        {/* Content */}
        {projects.length === 0 ? (
          <EmptyState onNew={() => setNewOpen(true)} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <SearchLineIcon size="sm" className="text-neutral-800 mb-4" />
            <p className="text-neutral-500 text-sm">
              Nenhum projeto encontrado para "{search}"
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch('')}
              className="mt-3 text-neutral-500 hover:text-white"
            >
              Limpar busca
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      {/* New Project Dialog */}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}
