import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Separator,
  Badge,
} from '@overlens/legacy-components'
import {
  CognitionLineIcon,
  EditSolidIcon,
  GraphicEqLineIcon,
  HistoryLineIcon,
  ImageLineIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'
import { useAI } from '@/hooks/useAI'
import type { AIFeature } from '@/types'

const FEATURES: { feature: AIFeature; label: string; icon: React.ElementType; description: string }[] = [
  { feature: 'write', label: 'Escrever', icon: EditSolidIcon, description: 'Continua a história a partir do cursor' },
  { feature: 'describe', label: 'Descrever', icon: ImageLineIcon, description: 'Adiciona descrições sensoriais ricas' },
  { feature: 'brainstorm', label: 'Brainstorm', icon: CognitionLineIcon, description: '3 direções possíveis para a história' },
  { feature: 'rewrite', label: 'Reescrever', icon: GraphicEqLineIcon, description: 'Reescreve o trecho selecionado em 3 versões' },
  { feature: 'feedback', label: 'Feedback', icon: HistoryLineIcon, description: 'Análise criativa do trecho atual' },
]

import React from 'react'

export function Toolbar() {
  const { isGenerating, selectedText, activeDocument, errorMessage, setError } = useStore()
  const { run } = useAI()
  const doc = activeDocument()
  const wordCount = doc?.content.trim().split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-3 gap-1 shrink-0">
      <div className="flex items-center gap-1">
        {FEATURES.map(({ feature, label, icon: Icon, description }) => (
          <Tooltip key={feature}>
            <TooltipTrigger asChild>
              <Button
                variant={feature === 'write' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => run(feature)}
                disabled={isGenerating || !doc}
                className="gap-1.5 h-8"
              >
                <Icon size="sm" />
                {label}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{description}</p>
              {(feature === 'describe' || feature === 'rewrite') && (
                <p className="text-muted-foreground text-xs">Selecione texto primeiro para melhores resultados</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {selectedText && (
        <Badge variant="secondary" className="text-xs h-6">
          {selectedText.split(/\s+/).filter(Boolean).length} palavras selecionadas
        </Badge>
      )}

      <div className="ml-auto flex items-center gap-3">
        {errorMessage && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-destructive truncate max-w-72">{errorMessage}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setError(null)}>✕</Button>
          </div>
        )}
        {isGenerating && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Gerando...
          </div>
        )}
        <span className="text-xs text-muted-foreground">
          {wordCount.toLocaleString('pt-BR')} palavras
        </span>
      </div>
    </div>
  )
}
