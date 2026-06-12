'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Task } from '@/lib/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'A fazer' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'done', label: 'Concluído' },
]

const CATEGORY_COLORS: Record<Task['category'], string> = {
  conto: 'hsl(var(--primary))',
  capitulo: 'var(--color-mel)',
  biblia: 'var(--color-jala)',
  site: 'oklch(0.65 0.09 150)',
  outro: 'var(--muted-foreground)',
}

const CATEGORY_LABELS: Record<Task['category'], string> = {
  conto: 'conto',
  capitulo: 'capítulo',
  biblia: 'bíblia',
  site: 'site',
  outro: 'outro',
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'baixa',
  normal: 'normal',
  high: 'alta',
}

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'oklch(0.55 0.01 280)',
  normal: 'oklch(0.72 0.10 75)',
  high: 'oklch(0.62 0.09 15)',
}

type NewTaskState = {
  title: string
  description: string
  category: Task['category']
  priority: Task['priority']
}

const emptyNewTask: NewTaskState = {
  title: '',
  description: '',
  category: 'outro',
  priority: 'normal',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToColumn, setAddingToColumn] = useState<Task['status'] | null>(null)
  const [newTask, setNewTask] = useState<NewTaskState>(emptyNewTask)
  const [saving, setSaving] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<Task['status'] | null>(null)
  // Tarefa 3 — filtros
  const [filterCategory, setFilterCategory] = useState<Task['category'] | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all')
  // Tarefa 4 — feedback de erro
  const [moveError, setMoveError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks', { cache: 'no-store' })
    const json = await res.json()
    setTasks(json.tasks ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setMoveError('O servidor demorou mais de 10s para responder.')
      }
    }, 10000)
    fetchTasks().then(() => clearTimeout(timeout))
    const interval = setInterval(fetchTasks, 5000)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [fetchTasks])

  // Tarefa 4 — limpar erro após 3s
  useEffect(() => {
    if (!moveError) return
    const timer = setTimeout(() => setMoveError(null), 3000)
    return () => clearTimeout(timer)
  }, [moveError])

  // Tarefa 1 — reindexar coluna quando gaps ficam muito pequenos
  async function reindexIfNeeded(currentTasks: Task[], status: Task['status']) {
    const colTasks = currentTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order_index - b.order_index)

    if (colTasks.length < 2) return

    const hasSmallGap = colTasks.some((t, i) => {
      if (i === 0) return false
      return t.order_index - colTasks[i - 1].order_index < 0.001
    })

    if (!hasSmallGap) return

    const updates = colTasks.map((t, i) => ({ id: t.id, order_index: i + 1 }))
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      setMoveError('Erro ao reindexar tarefas: ' + (json.error ?? res.statusText))
    }
  }

  async function patchTask(id: string, fields: Partial<Task>) {
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...fields }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error ?? res.statusText)
    }
  }

  async function moveTask(id: string, newStatus: Task['status']) {
    const colTasks = tasks.filter((t) => t.status === newStatus && t.id !== id)
    const maxIndex = colTasks.reduce((m, t) => Math.max(m, t.order_index), 0)
    try {
      await patchTask(id, { status: newStatus, order_index: maxIndex + 1 })
    } catch (e) {
      setMoveError('Erro ao mover tarefa: ' + (e as Error).message)
      return
    }
    fetchTasks()
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, status: newStatus, order_index: maxIndex + 1 } : t
    )
    await reindexIfNeeded(updated, newStatus)
  }

  async function moveTaskBefore(draggedId: string, targetId: string, targetStatus: Task['status']) {
    const colTasks = tasks
      .filter((t) => t.status === targetStatus && t.id !== draggedId)
      .sort((a, b) => a.order_index - b.order_index)

    const targetIdx = colTasks.findIndex((t) => t.id === targetId)
    const prev = colTasks[targetIdx - 1]
    const target = colTasks[targetIdx]

    const newIndex = prev
      ? (prev.order_index + target.order_index) / 2
      : target.order_index - 1

    try {
      await patchTask(draggedId, { status: targetStatus, order_index: newIndex })
    } catch (e) {
      setMoveError('Erro ao reordenar tarefa: ' + (e as Error).message)
      return
    }
    fetchTasks()
    const updated = tasks.map((t) =>
      t.id === draggedId ? { ...t, status: targetStatus, order_index: newIndex } : t
    )
    await reindexIfNeeded(updated, targetStatus)
  }

  async function updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'category' | 'priority'>>) {
    await patchTask(id, updates)
    fetchTasks()
  }

  async function deleteTask(id: string) {
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchTasks()
  }

  async function handleAddTask(status: Task['status']) {
    if (!newTask.title.trim()) return
    setSaving(true)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTask.title.trim(),
        description: newTask.description.trim() || null,
        status,
        category: newTask.category,
        priority: newTask.priority,
      }),
    })
    setNewTask(emptyNewTask)
    setAddingToColumn(null)
    setSaving(false)
    fetchTasks()
  }

  function handleDrop(e: React.DragEvent, targetStatus: Task['status'], targetTaskId?: string) {
    e.preventDefault()
    e.stopPropagation()
    const taskId = e.dataTransfer.getData('taskId') || draggingId
    if (!taskId) return

    if (targetTaskId && targetTaskId !== taskId) {
      moveTaskBefore(taskId, targetTaskId, targetStatus)
    } else {
      moveTask(taskId, targetStatus)
    }

    setDraggingId(null)
    setDragOverTaskId(null)
    setDragOverCol(null)
  }

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-48 opacity-60" />
        </div>
        {/* Kanban columns skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {COLUMNS.map((col) => (
            <Card key={col.key} className="overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: "hsl(var(--card))" }}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-5 rounded-full opacity-60" />
              </div>
              <CardContent className="p-3 flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Card key={i} size="sm" className="px-3 py-2.5">
                    <Skeleton className="h-3 w-3/4 mb-1.5 opacity-8" />
                    <Skeleton className="h-2.5 w-1/2 opacity-5" />
                    <div className="mt-2 flex gap-1.5">
                      <Skeleton className="h-4 w-12 rounded-full opacity-6" />
                      <Skeleton className="h-4 w-10 rounded-full opacity-6" />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-serif text-3xl text-foreground">Tarefas</h1>
        <p className="mt-1 font-sans text-xs text-muted-foreground">
          {tasks.filter((t) => t.status !== 'done').length} pendentes · {tasks.filter((t) => t.status === 'done').length} concluídas
        </p>
      </div>

      {/* Tarefa 3 — linha de filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Filtro por categoria */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            role="button"
            tabIndex={0}
            onClick={() => setFilterCategory('all')}
            variant={filterCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
          >
            todos
          </Badge>
          {(Object.keys(CATEGORY_COLORS) as Task['category'][]).map((cat) => {
            const active = filterCategory === cat
            return (
              <Badge
                key={cat}
                role="button"
                tabIndex={0}
                onClick={() => setFilterCategory(active ? 'all' : cat)}
                variant="outline"
                className="cursor-pointer text-xs transition-colors"
                style={active ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] } : undefined}
              >
                {CATEGORY_LABELS[cat]}
              </Badge>
            )
          })}
        </div>

        {/* Separador */}
        <Separator orientation="vertical" className="h-6 self-center" />

        {/* Filtro por prioridade */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            role="button"
            tabIndex={0}
            onClick={() => setFilterPriority('all')}
            variant={filterPriority === 'all' ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
          >
            todas
          </Badge>
          {(Object.keys(PRIORITY_COLORS) as Task['priority'][]).map((pri) => {
            const active = filterPriority === pri
            return (
              <Badge
                key={pri}
                role="button"
                tabIndex={0}
                onClick={() => setFilterPriority(active ? 'all' : pri)}
                variant="outline"
                className="cursor-pointer text-xs transition-colors"
                style={active ? { borderColor: PRIORITY_COLORS[pri], color: PRIORITY_COLORS[pri] } : undefined}
              >
                {PRIORITY_LABELS[pri]}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map((col, colIdx) => {
          // Tarefa 3 — aplicar filtros ao colTasks
          const colTasks = tasks
            .filter((t) => t.status === col.key)
            .filter(
              (t) =>
                (filterCategory === 'all' || t.category === filterCategory) &&
                (filterPriority === 'all' || t.priority === filterPriority)
            )
          const isAdding = addingToColumn === col.key
          const isOverEmpty = dragOverCol === col.key && !dragOverTaskId

          return (
            <div key={col.key} className="flex flex-col gap-2">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  {col.label}
                  <span className="ml-2 font-mono text-[10px] opacity-60">{colTasks.length}</span>
                </h2>
              </div>

              {/* Add task — only at top for "todo" column */}
              {col.key === 'todo' && (
                isAdding ? (
                  <AddTaskForm
                    newTask={newTask}
                    onChange={setNewTask}
                    onSave={() => handleAddTask(col.key)}
                    onCancel={() => { setAddingToColumn(null); setNewTask(emptyNewTask) }}
                    saving={saving}
                  />
                ) : (
                  <Button
                    onClick={() => { setAddingToColumn(col.key); setNewTask(emptyNewTask) }}
                    variant="outline"
                    size="xs"
                    className="w-full rounded-md border-dashed"
                  >
                    + tarefa
                  </Button>
                )
              )}

              {/* Drop zone */}
              <div
                className="flex flex-col gap-1.5 min-h-[60px] rounded-lg transition-colors"
                style={isOverEmpty ? {
                  outline: '1px dashed hsl(var(--border-shadcn))',
                  background: 'color-mix(in oklch, var(--foreground) 3%, transparent)',
                } : {}}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverCol(col.key)
                  if (dragOverTaskId) setDragOverTaskId(null)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null)
                  }
                }}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    colIndex={colIdx}
                    isDragOver={dragOverTaskId === task.id}
                    isDragging={draggingId === task.id}
                    onMove={moveTask}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverTaskId(null); setDragOverCol(null) }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragOverTaskId(task.id)
                      setDragOverCol(col.key)
                    }}
                    onDrop={(e) => handleDrop(e, col.key, task.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tarefa 4 — toast de erro */}
      {moveError && (
        <GlassCard
          variant="dark"
          className="fixed bottom-4 right-4 px-4 py-3 font-sans text-xs"
          style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', maxWidth: '320px' }}
        >
          {moveError}
        </GlassCard>
      )}
    </div>
  )
}

function TaskCard({
  task,
  colIndex,
  isDragOver,
  isDragging,
  onMove,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  task: Task
  colIndex: number
  isDragOver: boolean
  isDragging: boolean
  onMove: (id: string, status: Task['status']) => void
  onUpdate: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'category' | 'priority'>>) => void
  onDelete: (id: string) => void
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description ?? '',
    category: task.category,
    priority: task.priority,
  })

  // Sync editData when task changes from outside
  useEffect(() => {
    if (!editing) {
      setEditData({
        title: task.title,
        description: task.description ?? '',
        category: task.category,
        priority: task.priority,
      })
    }
  }, [task, editing])

  async function handleSave() {
    if (!editData.title.trim()) return
    await onUpdate(task.id, {
      title: editData.title.trim(),
      description: editData.description.trim() || null,
      category: editData.category,
      priority: editData.priority,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <GlassCard variant="frosted" className="rounded-lg p-3">
        <Input
          autoFocus
          type="text"
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="font-sans text-sm h-8"
        />
        <Textarea
          value={editData.description}
          onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
          rows={2}
          placeholder="Descrição (opcional)"
          className="mt-2 min-h-0 text-xs py-1.5"
        />
        <div className="mt-2 flex gap-2">
          <select
            value={editData.category}
            onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value as Task['category'] }))}
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)] cursor-pointer"
          >
            <option value="outro">outro</option>
            <option value="conto">conto</option>
            <option value="capitulo">capítulo</option>
            <option value="biblia">bíblia</option>
            <option value="site">site</option>
          </select>
          <select
            value={editData.priority}
            onChange={(e) => setEditData((d) => ({ ...d, priority: e.target.value as Task['priority'] }))}
            className="flex-1 rounded-lg border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)] cursor-pointer"
          >
            <option value="low">↓ baixa</option>
            <option value="normal">– normal</option>
            <option value="high">↑ alta</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!editData.title.trim()}
            size="xs"
            className="flex-1"
          >
            Salvar
          </Button>
          <Button
            onClick={() => setEditing(false)}
            variant="ghost"
            size="xs"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onDelete(task.id)}
            variant="destructive"
            size="xs"
          >
            Excluir
          </Button>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard
      variant="frosted"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-md px-2.5 py-2 transition-all"
      style={{
        borderColor: isDragOver ? 'hsl(var(--primary))' : undefined,
        opacity: isDragging ? 0.4 : 1,
        background: isDragOver
          ? 'color-mix(in oklch, hsl(var(--primary)) 8%, transparent)'
          : undefined,
        cursor: 'grab',
      }}
    >
      {/* Title */}
      <p className="font-sans text-sm leading-snug text-foreground truncate">
        {task.title}
      </p>

      {/* Tarefa 2 — preview de descrição */}
      {task.description && (
        <p className="mt-0.5 font-sans text-[11px] text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Badges + actions */}
      <div className="mt-1.5 flex items-center gap-1">
        <Badge
          variant="outline"
          className="rounded px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide h-auto"
          style={{
            color: CATEGORY_COLORS[task.category],
            background: `color-mix(in oklch, ${CATEGORY_COLORS[task.category]} 12%, transparent)`,
            borderColor: `color-mix(in oklch, ${CATEGORY_COLORS[task.category]} 30%, transparent)`,
          }}
        >
          {task.category}
        </Badge>
        <Badge
          variant="outline"
          className="rounded px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide h-auto"
          style={{
            color: PRIORITY_COLORS[task.priority],
            background: `color-mix(in oklch, ${PRIORITY_COLORS[task.priority]} 12%, transparent)`,
            borderColor: `color-mix(in oklch, ${PRIORITY_COLORS[task.priority]} 30%, transparent)`,
          }}
        >
          {PRIORITY_LABELS[task.priority]}
        </Badge>

        <div className="ml-auto flex items-center gap-0.5">
          {colIndex > 0 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMove(task.id, COLUMNS[colIndex - 1].key)}
              title={`Mover para ${COLUMNS[colIndex - 1].label}`}
            >
              <ChevronLeft size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
            title="Editar"
          >
            <Pencil size={11} />
          </Button>
          {colIndex < COLUMNS.length - 1 && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onMove(task.id, COLUMNS[colIndex + 1].key)}
              title={`Mover para ${COLUMNS[colIndex + 1].label}`}
            >
              <ChevronRight size={12} />
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

function AddTaskForm({
  newTask,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  newTask: NewTaskState
  onChange: (t: NewTaskState) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <GlassCard variant="frosted" className="rounded-lg p-3">
      <Input
        autoFocus
        type="text"
        placeholder="Título da tarefa"
        value={newTask.title}
        onChange={(e) => onChange({ ...newTask, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
        className="font-sans text-sm h-8"
      />
      <Textarea
        placeholder="Descrição (opcional)"
        value={newTask.description}
        onChange={(e) => onChange({ ...newTask, description: e.target.value })}
        rows={2}
        className="mt-2 min-h-0 text-xs py-1.5"
      />
      <div className="mt-2 flex gap-2">
        <select
          value={newTask.category}
          onChange={(e) => onChange({ ...newTask, category: e.target.value as Task['category'] })}
          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)] cursor-pointer"
        >
          <option value="outro">outro</option>
          <option value="conto">conto</option>
          <option value="capitulo">capítulo</option>
          <option value="biblia">bíblia</option>
          <option value="site">site</option>
        </select>
        <select
          value={newTask.priority}
          onChange={(e) => onChange({ ...newTask, priority: e.target.value as Task['priority'] })}
          className="flex-1 rounded-lg border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)] cursor-pointer"
        >
          <option value="low">↓ baixa</option>
          <option value="normal">– normal</option>
          <option value="high">↑ alta</option>
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={onSave}
          disabled={saving || !newTask.title.trim()}
          size="xs"
          className="flex-1"
        >
          {saving ? 'Salvando...' : 'Adicionar'}
        </Button>
        <Button
          onClick={onCancel}
          variant="ghost"
          size="xs"
        >
          Cancelar
        </Button>
      </div>
    </GlassCard>
  )
}
