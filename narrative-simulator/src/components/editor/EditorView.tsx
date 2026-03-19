import { useState } from "react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@overlens/legacy-components"
import {
  BookmarkLineIcon,
  CognitionLineIcon,
  DocLineIcon,
  EditSolidIcon,
  HistoryLineIcon,
  MicLineIcon,
} from "@overlens/legacy-icons"

const chapters = [
  { id: 1, title: "Prólogo: O Silêncio Antes", words: 1240, status: "done" },
  { id: 2, title: "Cap. 1 — A Fissura", words: 3420, status: "done" },
  { id: 3, title: "Cap. 2 — Nomes Sem Forma", words: 2180, status: "in_progress" },
  { id: 4, title: "Cap. 3 — O Tribunal do Nada", words: 0, status: "draft" },
]

const INITIAL_TEXT = `O Entre não era um lugar.

Era o espaço entre a decisão de existir e a existência em si — aquele intervalo imperceptível onde algo ainda não sabe que vai ser.

Mara descobriu o Entre da única maneira possível: sem querer.

Ela estava olhando para a fresta de luz embaixo da porta do quarto quando percebeu que a fresta olhava de volta.`

export function EditorView() {
  const [text, setText] = useState(INITIAL_TEXT)
  const [activeChapter, setActiveChapter] = useState(3)
  const [showShadow, setShowShadow] = useState(false)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex h-full">
      {/* Chapter list */}
      <div className="w-56 border-r border-border flex flex-col shrink-0">
        <div className="p-3 flex items-center justify-between border-b border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Capítulos</span>
          <Button variant="ghost" size="icon-xs">
            <EditSolidIcon size="sm" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 flex flex-col gap-1">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapter(ch.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  activeChapter === ch.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{ch.title}</span>
                  <Badge
                    variant={
                      ch.status === "done"
                        ? "success"
                        : ch.status === "in_progress"
                        ? "info"
                        : "secondary"
                    }
                    className="text-xs shrink-0"
                  >
                    {ch.status === "done" ? "✓" : ch.status === "in_progress" ? "~" : "—"}
                  </Badge>
                </div>
                {ch.words > 0 && (
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {ch.words.toLocaleString("pt-BR")} palavras
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Tabs defaultValue="write" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <TabsList>
              <TabsTrigger value="write">
                <EditSolidIcon size="sm" />
                Escrever
              </TabsTrigger>
              <TabsTrigger value="read">
                <DocLineIcon size="sm" />
                Leitura
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showShadow ? "default" : "ghost"}
                    size="icon-xs"
                    onClick={() => setShowShadow(!showShadow)}
                  >
                    <CognitionLineIcon size="sm" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Shadow Draft (Tab)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <HistoryLineIcon size="sm" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Histórico de versões</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <MicLineIcon size="sm" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ditado por voz</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-4" />

              <span className="text-xs text-muted-foreground">
                {wordCount.toLocaleString("pt-BR")} palavras
              </span>
            </div>
          </div>

          <TabsContent value="write" className="flex-1 m-0 flex flex-col">
            <div className="flex-1 relative">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="absolute inset-0 resize-none border-0 rounded-none p-6 text-base leading-relaxed focus-visible:ring-0 font-body bg-background"
                placeholder="Comece a escrever..."
              />
              {showShadow && (
                <ShadowDraftOverlay />
              )}
            </div>
          </TabsContent>

          <TabsContent value="read" className="flex-1 m-0 overflow-auto">
            <ScrollArea className="h-full">
              <div className="max-w-2xl mx-auto px-8 py-12">
                <div className="prose prose-neutral dark:prose-invert text-foreground leading-relaxed whitespace-pre-wrap font-body text-base">
                  {text}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ShadowDraftOverlay() {
  const variants = [
    {
      type: "trágico",
      color: "text-brand-boreal",
      text: "A fresta fechou. A luz desapareceu. E Mara compreendeu, tarde demais, que algumas portas não foram feitas para serem abertas de dentro.",
    },
    {
      type: "cômico",
      color: "text-brand-sahara",
      text: "— Oi — disse a fresta. Mara olhou para os lados. Não havia ninguém. — Estou aqui embaixo — disse a fresta, impaciente.",
    },
    {
      type: "ação",
      color: "text-brand-atmos",
      text: "Ela se jogou para trás instintivamente. A fresta se expandiu — um centímetro, dois — e do outro lado havia algo que respirava.",
    },
  ]

  return (
    <Card className="absolute bottom-4 left-4 right-4 z-10 shadow-center-lg border-border/50 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CognitionLineIcon size="sm" className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Shadow Draft — escolha um caminho
          </span>
          <Badge variant="secondary" className="ml-auto text-xs">Tab para aceitar</Badge>
        </div>
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <button
              key={v.type}
              className="text-left px-3 py-2 rounded-md border border-border hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs capitalize">{v.type}</Badge>
              </div>
              <p className={`text-xs leading-relaxed ${v.color} italic`}>{v.text}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <BookmarkLineIcon size="sm" className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Gerado com base em: Mara, O Entre, Cap. 2 — contexto do grafo de conhecimento
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
