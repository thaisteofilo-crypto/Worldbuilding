import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
} from '@overlens/legacy-components'
import {
  CheckLineIcon,
  CloseLineIcon,
  CognitionLineIcon,
  DeleteLineIcon,
  EditSolidIcon,
  GraphicEqLineIcon,
  HistoryLineIcon,
  ImageLineIcon,
} from '@overlens/legacy-icons'
import { useStore } from '@/store/useStore'
import type { AICard as AICardType } from '@/types'

const FEATURE_META = {
  write:     { label: 'Escrever',    icon: EditSolidIcon,     color: 'text-info' },
  describe:  { label: 'Descrever',   icon: ImageLineIcon,     color: 'text-success' },
  brainstorm:{ label: 'Brainstorm',  icon: CognitionLineIcon, color: 'text-warning' },
  rewrite:   { label: 'Reescrever',  icon: GraphicEqLineIcon, color: 'text-brand-kobold' },
  feedback:  { label: 'Feedback',    icon: HistoryLineIcon,   color: 'text-brand-boreal' },
}

interface Props {
  card: AICardType
}

export function AICard({ card }: Props) {
  const { insertCardText, removeCard } = useStore()
  const [expanded, setExpanded] = useState(true)
  const meta = FEATURE_META[card.feature]
  const Icon = meta.icon

  const timeAgo = (() => {
    const diff = Date.now() - card.timestamp
    if (diff < 60000) return 'agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    return `${Math.floor(diff / 3600000)}h`
  })()

  return (
    <Card className="border-border/60 overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/20 transition-colors"
      >
        <Icon size="sm" className={meta.color} />
        <span className="text-xs font-medium text-foreground flex-1 text-left">{meta.label}</span>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <span className="text-muted-foreground text-xs">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <CardContent className="p-0">
          {/* Context snippet */}
          {card.prompt && (
            <div className="px-3 py-2 border-t border-border/40 bg-muted/20">
              <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                "{card.prompt.slice(0, 120)}{card.prompt.length > 120 ? '…' : ''}"
              </p>
            </div>
          )}

          {/* Response */}
          <div className="px-3 py-3 border-t border-border/40">
            {card.streaming && !card.response ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="animate-pulse">●</span>
                <span>Gerando...</span>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {card.response}
                {card.streaming && <span className="animate-pulse ml-0.5">▌</span>}
              </p>
            )}
          </div>

          {/* Actions */}
          {!card.streaming && card.response && (
            <div className="px-3 pb-3 flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => insertCardText(card.id)}
              >
                <CheckLineIcon size="sm" />
                Inserir no texto
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  navigator.clipboard.writeText(card.response)
                }}
              >
                <CloseLineIcon size="sm" className="rotate-45" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => removeCard(card.id)}
              >
                <DeleteLineIcon size="sm" />
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
