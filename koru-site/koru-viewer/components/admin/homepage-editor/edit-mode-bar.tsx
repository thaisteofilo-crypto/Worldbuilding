"use client"

import { useEditMode } from "./use-edit-mode"

export function EditModeBar() {
  const { isEditing, toggle } = useEditMode()

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
      style={{
        height: 44,
        background: isEditing
          ? "oklch(0.45 0.18 290)"
          : "oklch(0.12 0.01 260)",
        borderBottom: "1px solid oklch(1 0 0 / 0.1)",
      }}
    >
      <span
        className="font-sans text-xs uppercase tracking-widest"
        style={{ color: "oklch(1 0 0 / 0.55)" }}
      >
        {isEditing ? "Modo edição ativo" : "Admin · Homepage"}
      </span>

      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-2 rounded px-3 py-1 text-xs font-sans font-medium transition-colors"
        style={{
          background: isEditing
            ? "oklch(1 0 0 / 0.15)"
            : "oklch(1 0 0 / 0.08)",
          color: isEditing ? "white" : "oklch(1 0 0 / 0.7)",
          border: "1px solid oklch(1 0 0 / 0.2)",
        }}
      >
        {isEditing ? "Sair da edição" : "Editar"}
      </button>
    </div>
  )
}
