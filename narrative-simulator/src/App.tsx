import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@overlens/legacy-components'
import { useStore } from '@/store/useStore'
import LoginPage from '@/pages/LoginPage'
import ProjectsPage from '@/pages/ProjectsPage'
import WritingPage from '@/pages/WritingPage'
import WorldBuildingPage from '@/pages/WorldBuildingPage'
import StoryboardPage from '@/pages/StoryboardPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(s => s.user)
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/write"
            element={
              <ProtectedRoute>
                <WritingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/world"
            element={
              <ProtectedRoute>
                <WorldBuildingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/storyboard"
            element={
              <ProtectedRoute>
                <StoryboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}
