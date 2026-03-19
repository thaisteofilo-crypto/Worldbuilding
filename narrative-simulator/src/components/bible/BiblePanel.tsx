import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@overlens/legacy-components"
import {
  AlertLineIcon,
  ImageLineIcon,
  LanguageLineIcon,
  ProfileLineIcon,
} from "@overlens/legacy-icons"

const characters = [
  {
    id: 1,
    name: "Mara",
    role: "Protagonista",
    status: "active",
    traits: ["curiosa", "introspectiva", "corajosa"],
    note: "Descobriu O Entre no Cap. 1. Perde o braço esquerdo no Cap. 3.",
  },
  {
    id: 2,
    name: "O Guardião Sem Nome",
    role: "Antagonista",
    status: "active",
    traits: ["enigmático", "antigo", "neutro"],
    note: "Não tem forma física definida. Habita as fronteiras do Entre.",
  },
  {
    id: 3,
    name: "Dr. Serafim",
    role: "Mentor",
    status: "secondary",
    traits: ["erudito", "reservado"],
    note: "Conhece a teoria do Entre mas nunca entrou.",
  },
]

const locations = [
  {
    id: 1,
    name: "O Entre",
    type: "Plano de existência",
    desc: "Espaço entre decisão e existência. Sem física convencional.",
  },
  {
    id: 2,
    name: "Apartamento 4B",
    type: "Local físico",
    desc: "Onde Mara vive. A fresta de luz é a porta de entrada.",
  },
  {
    id: 3,
    name: "O Tribunal do Nada",
    type: "Local no Entre",
    desc: "Câmara onde entidades sem nome aguardam julgamento.",
  },
]

const inconsistencies = [
  {
    id: 1,
    severity: "warning",
    message: "Mara usa a mão esquerda no Cap. 2, mas a perde no Cap. 3. Verifique menções anteriores.",
    chapter: "Cap. 2 → Cap. 3",
  },
  {
    id: 2,
    severity: "info",
    message: "Dr. Serafim é mencionado como 'professor' no Cap. 1 e 'pesquisador' no Cap. 2.",
    chapter: "Cap. 1 & Cap. 2",
  },
]

export function BiblePanel() {
  return (
    <div className="h-full flex flex-col border-l border-border">
      <div className="p-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Bíblia do Mundo</span>
      </div>

      <Tabs defaultValue="characters" className="flex-1 flex flex-col">
        <div className="px-2 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="characters" className="flex-1">
              <ProfileLineIcon size="sm" />
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex-1">
              <ImageLineIcon size="sm" />
            </TabsTrigger>
            <TabsTrigger value="lore" className="flex-1">
              <LanguageLineIcon size="sm" />
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">
              <AlertLineIcon size="sm" />
              {inconsistencies.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs px-1 py-0 min-w-[16px] h-4">
                  {inconsistencies.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="characters" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 flex flex-col gap-2">
              {characters.map((char) => (
                <Card key={char.id} className="cursor-pointer hover:bg-accent/20 transition-colors">
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium">{char.name}</CardTitle>
                      <Badge
                        variant={char.status === "active" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {char.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {char.traits.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{char.note}</p>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-1">
                + Novo personagem
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="locations" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 flex flex-col gap-2">
              {locations.map((loc) => (
                <Card key={loc.id} className="cursor-pointer hover:bg-accent/20 transition-colors">
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium">{loc.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">{loc.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">{loc.desc}</p>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-1">
                + Novo local
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="lore" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 flex flex-col gap-2">
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-sm">Regras do Entre</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>O Entre não tem física convencional.</li>
                    <li>Apenas humanos com "fratura perceptiva" conseguem entrar.</li>
                    <li>Tempo no Entre não corresponde ao tempo físico.</li>
                    <li>Entidades no Entre não têm nomes próprios.</li>
                  </ul>
                </CardContent>
              </Card>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                + Nova regra de lore
              </Button>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="alerts" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground px-1">
                Inconsistências detectadas pelo Detetive de Lógica
              </p>
              {inconsistencies.map((inc) => (
                <Card
                  key={inc.id}
                  className={`border-l-2 ${inc.severity === "warning" ? "border-l-warning" : "border-l-info"}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={inc.severity === "warning" ? "warning" : "info"}
                        className="text-xs"
                      >
                        {inc.chapter}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{inc.message}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs px-2">
                      Marcar como resolvido
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
