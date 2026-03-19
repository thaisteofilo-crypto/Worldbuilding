import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  ScrollArea,
} from "@overlens/legacy-components"
import {
  Add2LineIcon,
  ChartLineIcon,
  DocLineIcon,
  EditSolidIcon,
  FolderLineIcon,
  HistoryLineIcon,
  ProfileLineIcon,
} from "@overlens/legacy-icons"

const projects = [
  {
    id: 1,
    name: "O Entre",
    description: "Uma jovem descobre um espaço entre a decisão de existir e a existência.",
    progress: 45,
    chapters: 12,
    words: 32400,
    lastEdit: "há 2 horas",
    status: "active",
  },
  {
    id: 2,
    name: "A Corte de Névoa",
    description: "Política e traição num reino onde a névoa tem memória.",
    progress: 18,
    chapters: 4,
    words: 11200,
    lastEdit: "há 3 dias",
    status: "active",
  },
]

const recentActivity = [
  { icon: EditSolidIcon, text: "Cap. 2 — Nomes Sem Forma editado", time: "há 2h", project: "O Entre" },
  { icon: ProfileLineIcon, text: "Personagem 'Guardião' atualizado", time: "há 5h", project: "O Entre" },
  { icon: DocLineIcon, text: "Cap. 4 criado", time: "ontem", project: "A Corte de Névoa" },
  { icon: HistoryLineIcon, text: "Versão 3 de Cap. 1 restaurada", time: "há 3 dias", project: "O Entre" },
]

export function Dashboard() {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">Bem-vinda, Thais</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Você tem 2 projetos ativos e 3 inconsistências pendentes.
            </p>
          </div>
          <Button>
            <Add2LineIcon size="sm" />
            Novo projeto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total de palavras", value: "43.600", icon: ChartLineIcon, color: "text-info" },
            { label: "Capítulos escritos", value: "16", icon: DocLineIcon, color: "text-success" },
            { label: "Personagens", value: "11", icon: ProfileLineIcon, color: "text-warning" },
            { label: "Projetos ativos", value: "2", icon: FolderLineIcon, color: "text-brand-kobold" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${stat.color}`}>
                    <stat.icon size="md" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold font-heading text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Projects */}
          <div className="col-span-2 space-y-3">
            <h2 className="text-sm font-medium text-foreground">Projetos</h2>
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:bg-accent/10 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold">{project.name}</CardTitle>
                      <CardDescription className="mt-0.5 line-clamp-1">{project.description}</CardDescription>
                    </div>
                    <Badge variant={project.status === "active" ? "success" : "secondary"}>
                      {project.status === "active" ? "Ativo" : "Pausado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span>{project.chapters} capítulos</span>
                    <span>·</span>
                    <span>{project.words.toLocaleString("pt-BR")} palavras</span>
                    <span>·</span>
                    <span>Editado {project.lastEdit}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={project.progress} className="flex-1 h-1.5" />
                    <span className="text-xs text-muted-foreground w-8 text-right">{project.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-foreground">Atividade recente</h2>
            <div className="flex flex-col gap-1">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/10 transition-colors">
                  <div className="text-muted-foreground mt-0.5 shrink-0">
                    <activity.icon size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{activity.text}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">{activity.project}</Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
