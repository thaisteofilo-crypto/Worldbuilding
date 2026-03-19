import { useState } from 'react'
import {
  Button,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Badge,
} from '@overlens/legacy-components'
import {
  Add2LineIcon,
  DocLineIcon,
  EditSolidIcon,
  FolderLineIcon,
  HomeSolidIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'

export function ProjectSidebar() {
  const { projects, activeProjectId, activeDocumentId, setActiveProject, setActiveDocument, addDocument, addProject } = useStore()
  const activeProject = projects.find(p => p.id === activeProjectId)
  const [editingDocId, setEditingDocId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  return (
    <div className="w-52 shrink-0 border-r border-border flex flex-col bg-sidebar h-full">
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">N</div>
          <span className="text-xs font-semibold text-sidebar-foreground">Narrative</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-xs" onClick={() => addProject('Novo projeto', '', '')}>
              <Add2LineIcon size="sm" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Novo projeto</TooltipContent>
        </Tooltip>
      </div>

      {/* Project tabs */}
      <div className="px-2 pt-2 pb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">Projetos</p>
        <div className="flex flex-col gap-0.5">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProject(p.id)
                if (p.documents[0]) setActiveDocument(p.documents[0].id)
              }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                p.id === activeProjectId
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <FolderLineIcon size="sm" className="shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="mx-2" />

      {/* Documents */}
      {activeProject && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-2 pt-2 pb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Documentos</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" onClick={() => addDocument(activeProject.id)}>
                  <Add2LineIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Novo documento</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-2 pb-2 flex flex-col gap-0.5">
              {activeProject.documents.map(doc => (
                <div key={doc.id} className="group relative">
                  {editingDocId === doc.id ? (
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => {
                        if (editTitle.trim()) {
                          useStore.getState().updateDocumentTitle(doc.id, editTitle.trim())
                        }
                        setEditingDocId(null)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (editTitle.trim()) {
                            useStore.getState().updateDocumentTitle(doc.id, editTitle.trim())
                          }
                          setEditingDocId(null)
                        }
                        if (e.key === 'Escape') setEditingDocId(null)
                      }}
                      className="w-full px-2 py-1.5 rounded text-xs bg-sidebar-accent border border-ring outline-none text-sidebar-accent-foreground"
                    />
                  ) : (
                    <button
                      onClick={() => setActiveDocument(doc.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 transition-colors ${
                        doc.id === activeDocumentId
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <DocLineIcon size="sm" className="shrink-0" />
                      <span className="truncate flex-1">{doc.title}</span>
                      {doc.content === '' && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4 shrink-0">vazio</Badge>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditTitle(doc.title)
                      setEditingDocId(doc.id)
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-opacity"
                  >
                    <EditSolidIcon size="sm" className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Footer: Bible link */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => useStore.getState().setRightPanelTab('bible')}
          className="w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <HomeSolidIcon size="sm" />
          <span>Bíblia do Mundo</span>
        </button>
      </div>
    </div>
  )
}
