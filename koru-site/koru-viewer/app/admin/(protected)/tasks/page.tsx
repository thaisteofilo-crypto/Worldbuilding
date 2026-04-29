'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Task } from '@/lib/database.types'

const COLUMNS: { key: Task['status']; label: string }[] = [
  { key: 'todo', label: 'A fazer' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'done', label: 'Concluído' },
]

const CATEGORY_COLORS: Record<Task['category'], string> = {
  conto: 'var(--accent)',
  capitulo: 'var(--gold)',
  biblia: 'var(--blue-cold)',
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
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
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
      <div className="flex h-64 items-center justify-center">
        <p className="font-sans text-sm text-muted-foreground">Carregando...</p>
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
          <button
            onClick={() => setFilterCategory('all')}
            className="rounded-full border px-3 py-1 font-sans text-xs transition-colors"
            style={
              filterCategory === 'all'
                ? { borderColor: 'var(--foreground)', color: 'var(--foreground)' }
                : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            todos
          </button>
          {(Object.keys(CATEGORY_COLORS) as Task['category'][]).map((cat) => {
            const active = filterCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(active ? 'all' : cat)}
                className="rounded-full border px-3 py-1 font-sans text-xs transition-colors"
                style={
                  active
                    ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] }
                    : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                }
              >
                {CATEGORY_LABELS[cat]}
              </button>
            )
          })}
        </div>

        {/* Separador */}
        <div className="h-6 w-px self-center" style={{ background: 'var(--border)' }} />

        {/* Filtro por prioridade */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterPriority('all')}
            className="rounded-full border px-3 py-1 font-sans text-xs transition-colors"
            style={
              filterPriority === 'all'
                ? { borderColor: 'var(--foreground)', color: 'var(--foreground)' }
                : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
            }
          >
            todas
          </button>
          {(Object.keys(PRIORITY_COLORS) as Task['priority'][]).map((pri) => {
            const active = filterPriority === pri
            return (
              <button
                key={pri}
                onClick={() => setFilterPriority(active ? 'all' : pri)}
                className="rounded-full border px-3 py-1 font-sans text-xs transition-colors"
                style={
                  active
                    ? { borderColor: PRIORITY_COLORS[pri], color: PRIORITY_COLORS[pri] }
                    : { borderColor: 'var(--border)', color: 'var(--muted-foreground)' }
                }
              >
                {PRIORITY_LABELS[pri]}
              </button>
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
                  <button
                    onClick={() => { setAddingToColumn(col.key); setNewTask(emptyNewTask) }}
                    className="w-full rounded-md border border-dashed border-border py-1.5 font-sans text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    + tarefa
                  </button>
                )
              )}

              {/* Drop zone */}
              <div
                className="flex flex-col gap-1.5 min-h-[60px] rounded-lg transition-colors"
                style={isOverEmpty ? {
                  outline: '1px dashed var(--border)',
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
        <div
          className="fixed bottom-4 right-4 glass-card rounded-lg border px-4 py-3 font-sans text-xs"
          style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', maxWidth: '320px' }}
        >
          {moveError}
        </div>
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
      <div className="rounded-lg border p-3 glass-card" style={{ borderColor: 'var(--border)' }}>
        <input
          autoFocus
          type="text"
          value={editData.title}
          onChange={(e) => setEditData((d) => ({ ...d, title: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="w-full rounded border border-border bg-background px-2 py-1.5 font-sans text-sm text-foreground outline-none focus:border-[var(--foreground)]"
        />
        <textarea
          value={editData.description}
          onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
          rows={2}
          placeholder="Descrição (opcional)"
          className="mt-2 w-full resize-none rounded border border-border bg-background px-2 py-1.5 font-sans text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--foreground)]"
        />
        <div className="mt-2 flex gap-2">
          <select
            value={editData.category}
            onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value as Task['category'] }))}
            className="flex-1 rounded border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)]"
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
            className="flex-1 rounded border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)]"
          >
            <option value="low">↓ baixa</option>
            <option value="normal">– normal</option>
            <option value="high">↑ alta</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!editData.title.trim()}
            className="flex-1 rounded py-1.5 font-sans text-xs disabled:opacity-50"
            style={{ background: 'var(--foreground)', color: 'var(--background)' }}
          >
            Salvar
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded px-3 py-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded border border-border px-2 py-1.5 font-sans text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            Excluir
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-md border px-2.5 py-2 glass-card transition-all"
      style={{
        borderColor: isDragOver ? 'var(--accent)' : 'var(--border)',
        opacity: isDragging ? 0.4 : 1,
        background: isDragOver
          ? 'color-mix(in oklch, var(--accent) 8%, transparent)'
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
        <span
          className="rounded px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide"
          style={{
            color: CATEGORY_COLORS[task.category],
            background: `color-mix(in oklch, ${CATEGORY_COLORS[task.category]} 12%, transparent)`,
            border: `1px solid color-mix(in oklch, ${CATEGORY_COLORS[task.category]} 30%, transparent)`,
          }}
        >
          {task.category}
        </span>
        <span
          className="rounded px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wide"
          style={{
            color: PRIORITY_COLORS[task.priority],
            background: `color-mix(in oklch, ${PRIORITY_COLORS[task.priority]} 12%, transparent)`,
            border: `1px solid color-mix(in oklch, ${PRIORITY_COLORS[task.priority]} 30%, transparent)`,
          }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div className="ml-auto flex items-center gap-0.5">
          {colIndex > 0 && (
            <button
              onClick={() => onMove(task.id, COLUMNS[colIndex - 1].key)}
              title={`Mover para ${COLUMNS[colIndex - 1].label}`}
              className="rounded px-1 py-0.5 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
            >
              ←
            </button>
          )}
          <button
            onClick={() => setEditing(true)}
            title="Editar"
            className="rounded px-1 py-0.5 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
          >
            ✎
          </button>
          {colIndex < COLUMNS.length - 1 && (
            <button
              onClick={() => onMove(task.id, COLUMNS[colIndex + 1].key)}
              title={`Mover para ${COLUMNS[colIndex + 1].label}`}
              className="rounded px-1 py-0.5 font-sans text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-[color-mix(in_oklch,var(--foreground)_8%,transparent)]"
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
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
    <div className="rounded-lg border border-border p-3 glass-card">
      <input
        autoFocus
        type="text"
        placeholder="Título da tarefa"
        value={newTask.title}
        onChange={(e) => onChange({ ...newTask, title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onCancel()
        }}
        className="w-full rounded border border-border bg-background px-2 py-1.5 font-sans text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--foreground)]"
      />
      <textarea
        placeholder="Descrição (opcional)"
        value={newTask.description}
        onChange={(e) => onChange({ ...newTask, description: e.target.value })}
        rows={2}
        className="mt-2 w-full resize-none rounded border border-border bg-background px-2 py-1.5 font-sans text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[var(--foreground)]"
      />
      <div className="mt-2 flex gap-2">
        <select
          value={newTask.category}
          onChange={(e) => onChange({ ...newTask, category: e.target.value as Task['category'] })}
          className="flex-1 rounded border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)]"
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
          className="flex-1 rounded border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)]"
        >
          <option value="low">↓ baixa</option>
          <option value="normal">– normal</option>
          <option value="high">↑ alta</option>
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSave}
          disabled={saving || !newTask.title.trim()}
          className="flex-1 rounded py-1.5 font-sans text-xs disabled:opacity-50"
          style={{ background: 'var(--foreground)', color: 'var(--background)' }}
        >
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
        <button
          onClick={onCancel}
          className="rounded px-3 py-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
