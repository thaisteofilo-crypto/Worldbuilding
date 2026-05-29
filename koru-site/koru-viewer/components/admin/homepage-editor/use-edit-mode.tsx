"use client"

import React, { createContext, useContext, useState } from "react"

interface EditModeContextValue {
  isEditing: boolean
  toggle: () => void
}

const EditModeContext = createContext<EditModeContextValue>({
  isEditing: false,
  toggle: () => {},
})

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  function toggle() {
    setIsEditing((v) => !v)
  }
  return (
    <EditModeContext.Provider value={{ isEditing, toggle }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode(): EditModeContextValue {
  return useContext(EditModeContext)
}
