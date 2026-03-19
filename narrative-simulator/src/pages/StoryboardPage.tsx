import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import type { Beat, BeatType, BeatStatus } from '@/types'
import {
  Button,
  Badge,
  Input,
  Textarea,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@overlens/legacy-components'
import {
  Add2LineIcon,
  ArrowBackLineIcon,
  ArrowUpwardLineIcon,
  ArrowDownwardLineIcon,
  EditSolidIcon,
  DeleteLineIcon,
  DocLineIcon,
  CheckSolidIcon,
} from '@overlens/legacy-icons'

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BEAT_TYPE_LABELS: Record<BeatType, string> = {
  opening: 'Abertura',
  inciting: 'Incidente',
  midpoint: 'Ponto Médio',
  'dark-night': 'Noite Escura',
  climax: 'Clímax',
  resolution: 'Resolução',
  scene: 'Cena',
  chapter: 'Capítulo',
}

const BEAT_TYPE_COLORS: Record<BeatType, string> = {
  opening: '#3b82f6',      // blue-500
  inciting: '#a855f7',     // purple-500
  midpoint: '#f59e0b',     // amber-500
  'dark-night': '#ef4444', // red-500
  climax: '#f97316',       // orange-500
  resolution: '#22c55e',   // green-500
  scene: '#6b7280',        // gray-500
  chapter: '#14b8a6',      // teal-500
}

const STATUS_LABELS: Record<BeatStatus, string> = {
  idea: 'Ideia',
  outlined: 'Esboçado',
  drafted: 'Rascunho',
  revised: 'Revisado',
  done: 'Concluído',
}

const STATUS_COLORS: Record<BeatStatus, string> = {
  idea: '#6b7280',      // gray-500
  outlined: '#3b82f6',  // blue-500
  drafted: '#f59e0b',   // amber-500
  revised: '#a855f7',   // purple-500
  done: '#22c55e',      // green-500
}

const ACT_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Ato I',
  2: 'Ato II',
  3: 'Ato III',
}

const ACT_COLORS: Record<1 | 2 | 3, string> = {
  1: '#3b82f6',   // blue
  2: '#f59e0b',   // amber
  3: '#22c55e',   // green
}

const ACT_BG_COLORS: Record<1 | 2 | 3, string> = {
  1: 'rgba(59,130,246,0.08)',
  2: 'rgba(245,158,11,0.08)',
  3: 'rgba(34,197,94,0.08)',
}

const ACT_BORDER_COLORS: Record<1 | 2 | 3, string> = {
  1: 'rgba(59,130,246,0.25)',
  2: 'rgba(245,158,11,0.25)',
  3: 'rgba(34,197,94,0.25)',
}

const BEAT_TYPE_OPTIONS: BeatType[] = [
  'opening', 'inciting', 'scene', 'chapter', 'midpoint', 'dark-night', 'climax', 'resolution',
]

const BEAT_STATUS_OPTIONS: BeatStatus[] = [
  'idea', 'outlined', 'drafted', 'revised', 'done',
]

// ---------------------------------------------------------------------------
// Empty beat form
// ---------------------------------------------------------------------------

interface BeatFormData {
  title: string
  description: string
  type: BeatType
  status: BeatStatus
  act: 1 | 2 | 3
  notes: string
}

const emptyForm = (defaultAct: 1 | 2 | 3 = 1): BeatFormData => ({
  title: '',
  description: '',
  type: 'scene',
  status: 'idea',
  act: defaultAct,
  notes: '',
})

// ---------------------------------------------------------------------------
// BeatTypeDot
// ---------------------------------------------------------------------------

function BeatTypeDot({ type }: { type: BeatType }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: BEAT_TYPE_COLORS[type],
        flexShrink: 0,
      }}
    />
  )
}

// ---------------------------------------------------------------------------
// BeatCard
// ---------------------------------------------------------------------------

interface BeatCardProps {
  beat: Beat
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: () => void
  onDelete: () => void
}

function BeatCard({ beat, isFirst, isLast, onMoveUp, onMoveDown, onEdit, onDelete }: BeatCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        ...(hovered ? {
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.16)',
        } : {}),
      }}
      onClick={() => setExpanded(v => !v)}
    >
      {/* Top row: type dot + type label + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <BeatTypeDot type={beat.type} />
        <span style={{ fontSize: 11, color: BEAT_TYPE_COLORS[beat.type], fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {BEAT_TYPE_LABELS[beat.type]}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: 99,
            color: '#fff',
            background: STATUS_COLORS[beat.status],
            opacity: 0.9,
          }}
        >
          {STATUS_LABELS[beat.status]}
        </span>
      </div>

      {/* Title */}
      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#f1f5f9', lineHeight: 1.4, marginBottom: 4 }}>
        {beat.title}
      </p>

      {/* Description — truncated unless expanded */}
      {beat.description && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: '#94a3b8',
            lineHeight: 1.5,
            ...(expanded ? {} : {
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }),
          }}
        >
          {beat.description}
        </p>
      )}

      {/* Expanded: notes */}
      {expanded && beat.notes && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, borderLeft: '3px solid rgba(255,255,255,0.15)' }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</p>
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{beat.notes}</p>
        </div>
      )}

      {/* Hover action buttons */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 2,
            zIndex: 2,
          }}
          onClick={e => e.stopPropagation()}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onMoveUp}
                  disabled={isFirst}
                  style={{ opacity: isFirst ? 0.3 : 1 }}
                >
                  <ArrowUpwardLineIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover para cima</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={onMoveDown}
                  disabled={isLast}
                  style={{ opacity: isLast ? 0.3 : 1 }}
                >
                  <ArrowDownwardLineIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mover para baixo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" onClick={onEdit}>
                  <EditSolidIcon size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar beat</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" onClick={onDelete}>
                  <DeleteLineIcon size="sm" style={{ color: '#f87171' }} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir beat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ActColumn
// ---------------------------------------------------------------------------

interface ActColumnProps {
  act: 1 | 2 | 3
  beats: Beat[]
  projectId: string
  onAddBeat: (act: 1 | 2 | 3) => void
  onEditBeat: (beat: Beat) => void
  onDeleteBeat: (beatId: string) => void
  onMoveUp: (beat: Beat, actBeats: Beat[]) => void
  onMoveDown: (beat: Beat, actBeats: Beat[]) => void
}

function ActColumn({ act, beats, onAddBeat, onEditBeat, onDeleteBeat, onMoveUp, onMoveDown }: ActColumnProps) {
  const actBeats = beats
    .filter(b => b.act === act)
    .sort((a, b) => a.order - b.order)

  const doneCount = actBeats.filter(b => b.status === 'done').length

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: ACT_BG_COLORS[act],
        border: `1px solid ${ACT_BORDER_COLORS[act]}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Column header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${ACT_BORDER_COLORS[act]}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: ACT_COLORS[act],
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{ACT_LABELS[act]}</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: ACT_COLORS[act],
              background: `${ACT_COLORS[act]}22`,
              padding: '2px 8px',
              borderRadius: 99,
              fontWeight: 600,
            }}
          >
            {actBeats.length} beat{actBeats.length !== 1 ? 's' : ''}
          </span>
        </div>
        {actBeats.length > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
            {doneCount} de {actBeats.length} concluído{doneCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Beat list */}
      <ScrollArea style={{ flex: 1, minHeight: 0, maxHeight: 'calc(100vh - 280px)' }}>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {actBeats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: 12 }}>
              <DocLineIcon size="md" style={{ opacity: 0.3, marginBottom: 6, display: 'block', margin: '0 auto 6px' }} />
              Nenhum beat ainda
            </div>
          ) : (
            actBeats.map((beat, idx) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                isFirst={idx === 0}
                isLast={idx === actBeats.length - 1}
                onMoveUp={() => onMoveUp(beat, actBeats)}
                onMoveDown={() => onMoveDown(beat, actBeats)}
                onEdit={() => onEditBeat(beat)}
                onDelete={() => onDeleteBeat(beat.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add button */}
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${ACT_BORDER_COLORS[act]}` }}>
        <Button
          variant="ghost"
          size="sm"
          style={{ width: '100%', color: ACT_COLORS[act], justifyContent: 'center', gap: 4, fontSize: 12 }}
          onClick={() => onAddBeat(act)}
        >
          <Add2LineIcon size="sm" />
          Adicionar beat
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatusProgressBar
// ---------------------------------------------------------------------------

function StatusProgressBar({ beats }: { beats: Beat[] }) {
  const total = beats.length
  if (total === 0) return null

  const counts: Record<BeatStatus, number> = { idea: 0, outlined: 0, drafted: 0, revised: 0, done: 0 }
  beats.forEach(b => { counts[b.status]++ })

  // Order for display: done, revised, drafted, outlined, idea
  const segments: { status: BeatStatus; color: string }[] = [
    { status: 'done', color: '#16a34a' },
    { status: 'revised', color: '#7c3aed' },
    { status: 'drafted', color: '#d97706' },
    { status: 'outlined', color: '#2563eb' },
    { status: 'idea', color: '#374151' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>PROGRESSO</span>
        <div style={{ flex: 1, height: 8, borderRadius: 99, background: '#1e293b', overflow: 'hidden', display: 'flex' }}>
          {segments.map(({ status, color }) => {
            const pct = (counts[status] / total) * 100
            if (pct === 0) return null
            return (
              <div
                key={status}
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  transition: 'width 0.3s ease',
                }}
                title={`${STATUS_LABELS[status]}: ${counts[status]}`}
              />
            )
          })}
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {segments.map(({ status, color }) => counts[status] > 0 && (
          <span key={status} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94a3b8' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color }} />
            {STATUS_LABELS[status]} ({counts[status]})
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StoryboardPage
// ---------------------------------------------------------------------------

export default function StoryboardPage() {
  const navigate = useNavigate()
  const activeProject = useStore(s => s.activeProject())
  const activeProjectId = useStore(s => s.activeProjectId)
  const addBeat = useStore(s => s.addBeat)
  const updateBeat = useStore(s => s.updateBeat)
  const deleteBeat = useStore(s => s.deleteBeat)
  const reorderBeats = useStore(s => s.reorderBeats)

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addDefaultAct, setAddDefaultAct] = useState<1 | 2 | 3>(1)
  const [_addFormData, setAddFormData] = useState<BeatFormData>(emptyForm(1))

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null)
  const [editFormData, setEditFormData] = useState<BeatFormData>(emptyForm())

  // Global "Novo Beat" opens dialog pre-set to act 1
  const handleOpenAddGlobal = () => {
    setAddDefaultAct(1)
    setAddFormData(emptyForm(1))
    setAddDialogOpen(true)
  }

  // Column-level add opens dialog pre-set to that act
  const handleOpenAddForAct = (act: 1 | 2 | 3) => {
    setAddDefaultAct(act)
    setAddFormData(emptyForm(act))
    setAddDialogOpen(true)
  }

  const handleConfirmAdd = (data: BeatFormData) => {
    if (!activeProjectId) return
    const beats = activeProject?.beats ?? []
    const actBeats = beats.filter(b => b.act === data.act)
    const maxOrder = actBeats.length > 0 ? Math.max(...actBeats.map(b => b.order)) : 0
    addBeat(activeProjectId, {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      act: data.act,
      order: maxOrder + 1,
      notes: data.notes || undefined,
    })
    setAddDialogOpen(false)
  }

  const handleOpenEdit = (beat: Beat) => {
    setEditingBeat(beat)
    setEditFormData({
      title: beat.title,
      description: beat.description,
      type: beat.type,
      status: beat.status,
      act: beat.act,
      notes: beat.notes ?? '',
    })
    setEditDialogOpen(true)
  }

  const handleConfirmEdit = (data: BeatFormData) => {
    if (!activeProjectId || !editingBeat) return
    updateBeat(activeProjectId, editingBeat.id, {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      act: data.act,
      notes: data.notes || undefined,
    })
    setEditDialogOpen(false)
    setEditingBeat(null)
  }

  const handleDelete = (beatId: string) => {
    if (!activeProjectId) return
    deleteBeat(activeProjectId, beatId)
  }

  const handleMoveUp = (beat: Beat, actBeats: Beat[]) => {
    if (!activeProjectId) return
    const idx = actBeats.findIndex(b => b.id === beat.id)
    if (idx <= 0) return
    const newActBeats = [...actBeats]
    // Swap orders
    const prevOrder = newActBeats[idx - 1].order
    const currOrder = newActBeats[idx].order
    newActBeats[idx - 1] = { ...newActBeats[idx - 1], order: currOrder }
    newActBeats[idx] = { ...newActBeats[idx], order: prevOrder }
    // Merge back with other act beats
    const otherBeats = (activeProject?.beats ?? []).filter(b => b.act !== beat.act)
    reorderBeats(activeProjectId, [...otherBeats, ...newActBeats])
  }

  const handleMoveDown = (beat: Beat, actBeats: Beat[]) => {
    if (!activeProjectId) return
    const idx = actBeats.findIndex(b => b.id === beat.id)
    if (idx < 0 || idx >= actBeats.length - 1) return
    const newActBeats = [...actBeats]
    const nextOrder = newActBeats[idx + 1].order
    const currOrder = newActBeats[idx].order
    newActBeats[idx + 1] = { ...newActBeats[idx + 1], order: currOrder }
    newActBeats[idx] = { ...newActBeats[idx], order: nextOrder }
    const otherBeats = (activeProject?.beats ?? []).filter(b => b.act !== beat.act)
    reorderBeats(activeProjectId, [...otherBeats, ...newActBeats])
  }

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------

  if (!activeProject || !activeProjectId) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0f1e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: '#94a3b8',
        }}
      >
        <DocLineIcon size="md" style={{ opacity: 0.25 }} />
        <p style={{ fontSize: 16, margin: 0 }}>Nenhum projeto selecionado.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowBackLineIcon size="sm" style={{ marginRight: 6 }} />
          Voltar
        </Button>
      </div>
    )
  }

  const beats = activeProject.beats ?? []
  const totalBeats = beats.length
  const doneBeats = beats.filter(b => b.status === 'done').length
  const completionPct = totalBeats > 0 ? Math.round((doneBeats / totalBeats) * 100) : 0

  // Word count (sum length of all docs as approximate, if available)
  const totalWords = activeProject.documents.reduce((sum, doc) => {
    const wordCount = doc.content.trim() ? doc.content.trim().split(/\s+/).length : 0
    return sum + wordCount
  }, 0)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0f1e',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit',
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* TopBar                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,15,30,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowBackLineIcon size="sm" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voltar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Separator orientation="vertical" style={{ height: 24, background: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Storyboard</span>
          <span style={{ fontSize: 11, color: '#64748b' }}>{activeProject.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <Badge variant="secondary" style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            {totalBeats} beat{totalBeats !== 1 ? 's' : ''}
          </Badge>
          {totalBeats > 0 && (
            <Badge
              variant={completionPct === 100 ? 'success' : completionPct >= 50 ? 'info' : 'secondary'}
              style={{ fontSize: 11 }}
            >
              {completionPct}% concluído
            </Badge>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Global Add Beat button — opens dialog */}
        <Button size="sm" onClick={handleOpenAddGlobal}>
          <Add2LineIcon size="sm" style={{ marginRight: 6 }} />
          Novo Beat
        </Button>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main: 3 Act Columns                                                  */}
      {/* ------------------------------------------------------------------ */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          gap: 14,
          padding: '18px 20px',
          minHeight: 0,
          overflowX: 'auto',
        }}
      >
        {([1, 2, 3] as const).map(act => (
          <ActColumn
            key={act}
            act={act}
            beats={beats}
            projectId={activeProjectId}
            onAddBeat={handleOpenAddForAct}
            onEditBeat={handleOpenEdit}
            onDeleteBeat={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom summary bar                                                   */}
      {/* ------------------------------------------------------------------ */}
      {totalBeats > 0 && (
        <footer
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(10,15,30,0.95)',
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 240 }}>
            <StatusProgressBar beats={beats} />
          </div>

          {activeProject.wordCountGoal && (
            <>
              <Separator orientation="vertical" style={{ height: 32, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Palavras</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                    {totalWords.toLocaleString('pt-BR')}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    / {activeProject.wordCountGoal.toLocaleString('pt-BR')}
                  </span>
                </div>
                {/* Mini progress bar for words */}
                <div style={{ width: 140, height: 4, background: '#1e293b', borderRadius: 99, overflow: 'hidden', marginTop: 2 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.round((totalWords / activeProject.wordCountGoal) * 100))}%`,
                      background: '#3b82f6',
                      borderRadius: 99,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: 10, color: '#475569' }}>
                  {Math.min(100, Math.round((totalWords / activeProject.wordCountGoal!) * 100))}% da meta
                </span>
              </div>
            </>
          )}
        </footer>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Add Beat Dialog (controlled, no trigger child)                       */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent style={{ maxWidth: 480, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#f1f5f9' }}>Novo Beat</DialogTitle>
          </DialogHeader>
          <AddBeatForm
            key={`add-${addDefaultAct}-${addDialogOpen}`}
            defaultAct={addDefaultAct}
            onConfirm={handleConfirmAdd}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Edit Beat Dialog (controlled)                                         */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent style={{ maxWidth: 480, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#f1f5f9' }}>Editar Beat</DialogTitle>
          </DialogHeader>
          {editingBeat && (
            <AddBeatForm
              key={editingBeat.id}
              defaultAct={editingBeat.act}
              initialData={editFormData}
              onConfirm={handleConfirmEdit}
              onCancel={() => { setEditDialogOpen(false); setEditingBeat(null) }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AddBeatForm — internal form component used by both dialogs
// ---------------------------------------------------------------------------

interface AddBeatFormProps {
  defaultAct: 1 | 2 | 3
  initialData?: BeatFormData
  onConfirm: (data: BeatFormData) => void
  onCancel: () => void
}

function AddBeatForm({ defaultAct, initialData, onConfirm, onCancel }: AddBeatFormProps) {
  const [form, setForm] = useState<BeatFormData>(initialData ?? emptyForm(defaultAct))

  const patch = <K extends keyof BeatFormData>(key: K, value: BeatFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    onConfirm(form)
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
        {/* Title */}
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Título *
          </label>
          <Input
            value={form.title}
            onChange={e => patch('title', e.target.value)}
            placeholder="Nome do beat..."
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
            autoFocus
          />
        </div>

        {/* Type + Act */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo</label>
            <Select value={form.type} onValueChange={v => patch('type', v as BeatType)}>
              <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                {BEAT_TYPE_OPTIONS.map(t => (
                  <SelectItem key={t} value={t} style={{ color: '#f1f5f9' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BeatTypeDot type={t} />
                      {BEAT_TYPE_LABELS[t]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Ato</label>
            <Select value={String(form.act)} onValueChange={v => patch('act', Number(v) as 1 | 2 | 3)}>
              <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                {([1, 2, 3] as const).map(a => (
                  <SelectItem key={a} value={String(a)} style={{ color: '#f1f5f9' }}>
                    {ACT_LABELS[a]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Status</label>
          <Select value={form.status} onValueChange={v => patch('status', v as BeatStatus)}>
            <SelectTrigger style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
              {BEAT_STATUS_OPTIONS.map(s => (
                <SelectItem key={s} value={s} style={{ color: '#f1f5f9' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], flexShrink: 0 }} />
                    {STATUS_LABELS[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>Descrição</label>
          <Textarea
            value={form.description}
            onChange={e => patch('description', e.target.value)}
            placeholder="O que acontece neste beat..."
            rows={3}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', resize: 'vertical' }}
          />
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Notas <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional)</span>
          </label>
          <Textarea
            value={form.notes}
            onChange={e => patch('notes', e.target.value)}
            placeholder="Ideias, referências, lembretes..."
            rows={2}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', resize: 'vertical' }}
          />
        </div>
      </div>

      <DialogFooter style={{ marginTop: 8 }}>
        <Button variant="ghost" style={{ color: '#94a3b8' }} onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!form.title.trim()}>
          <CheckSolidIcon size="sm" style={{ marginRight: 6 }} />
          Salvar
        </Button>
      </DialogFooter>
    </>
  )
}
