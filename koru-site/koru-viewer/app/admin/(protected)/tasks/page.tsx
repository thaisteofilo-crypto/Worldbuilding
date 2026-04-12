'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: '↓',
  normal: '–',
  high: '↑',
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

  const supabase = createClient()

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('order_index', { ascending: true })
    setTasks(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTasks()

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, supabase])

  async function moveTask(id: string, newStatus: Task['status']) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
  }

  async function handleAddTask(status: Task['status']) {
    if (!newTask.title.trim()) return
    setSaving(true)

    const maxIndex = tasks
      .filter((t) => t.status === status)
      .reduce((m, t) => Math.max(m, t.order_index), 0)

    await supabase.from('tasks').insert({
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
      status,
      category: newTask.category,
      priority: newTask.priority,
      order_index: maxIndex + 1,
    })

    setNewTask(emptyNewTask)
    setAddingToColumn(null)
    setSaving(false)
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
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Tarefas</h1>
        <p className="mt-1 font-sans text-xs text-muted-foreground">
          {tasks.filter((t) => t.status !== 'done').length} pendentes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          const isAdding = addingToColumn === col.key

          return (
            <div key={col.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground">
                  {col.label}
                  <span className="ml-2 font-mono text-[10px]">
                    {colTasks.length}
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setAddingToColumn(isAdding ? null : col.key)
                    setNewTask(emptyNewTask)
                  }}
                  className="font-sans text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {isAdding ? '✕' : '+'}
                </button>
              </div>

              {isAdding && (
                <AddTaskForm
                  newTask={newTask}
                  onChange={setNewTask}
                  onSave={() => handleAddTask(col.key)}
                  onCancel={() => {
                    setAddingToColumn(null)
                    setNewTask(emptyNewTask)
                  }}
                  saving={saving}
                />
              )}

              <div className="flex flex-col gap-2">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    columns={COLUMNS}
                    onMove={moveTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  columns,
  onMove,
  onDelete,
}: {
  task: Task
  columns: typeof COLUMNS
  onMove: (id: string, status: Task['status']) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const otherCols = columns.filter((c) => c.key !== task.status)

  return (
    <div
      className="rounded-lg border border-border p-3 transition-colors hover:border-[var(--border)] glass-card"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <p className="font-sans text-sm leading-snug text-foreground">
            {task.title}
          </p>
        </button>
        <span
          className="mt-0.5 shrink-0 font-mono text-sm font-bold"
          style={{ color: PRIORITY_COLORS[task.priority] }}
          title={task.priority}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
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
      </div>

      {expanded && (
        <div className="mt-3 border-t border-border pt-3">
          {task.description && (
            <p className="mb-3 font-sans text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {otherCols.map((col) => (
              <button
                key={col.key}
                onClick={() => onMove(task.id, col.key)}
                className="rounded border border-border px-2 py-1 font-sans text-[10px] text-muted-foreground transition-colors hover:border-[var(--foreground)] hover:text-foreground"
              >
                → {col.label}
              </button>
            ))}
            <button
              onClick={() => onDelete(task.id)}
              className="ml-auto rounded border border-border px-2 py-1 font-sans text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
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
    <div
      className="rounded-lg border border-border p-3 glass-card"
    >
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
          onChange={(e) =>
            onChange({ ...newTask, category: e.target.value as Task['category'] })
          }
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
          onChange={(e) =>
            onChange({ ...newTask, priority: e.target.value as Task['priority'] })
          }
          className="flex-1 rounded border border-border bg-background px-2 py-1 font-sans text-xs text-foreground outline-none focus:border-[var(--foreground)]"
        >
          <option value="low">baixa</option>
          <option value="normal">normal</option>
          <option value="high">alta</option>
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onSave}
          disabled={saving || !newTask.title.trim()}
          className="flex-1 rounded py-1.5 font-sans text-xs disabled:opacity-50"
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
          }}
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
