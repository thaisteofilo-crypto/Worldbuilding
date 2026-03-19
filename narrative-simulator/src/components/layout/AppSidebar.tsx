import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@overlens/legacy-components"
import {
  BookmarkLineIcon,
  DocLineIcon,
  FolderLineIcon,
  HomeSolidIcon,
  ImageLineIcon,
  LanguageLineIcon,
  ProfileLineIcon,
  SettingsLineIcon,
} from "@overlens/legacy-icons"

const projects = [
  { id: 1, name: "O Entre", chapters: 12 },
  { id: 2, name: "A Corte de Névoa", chapters: 4 },
]

const navMain = [
  { label: "Dashboard", icon: HomeSolidIcon, href: "#dashboard", active: true },
  { label: "Capítulos", icon: DocLineIcon, href: "#chapters", badge: "12" },
  { label: "Personagens", icon: ProfileLineIcon, href: "#characters", badge: "8" },
  { label: "Locais", icon: ImageLineIcon, href: "#locations" },
  { label: "Lore & Regras", icon: LanguageLineIcon, href: "#lore" },
  { label: "Referências", icon: BookmarkLineIcon, href: "#references" },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground">Narrative</span>
            <span className="text-xs text-muted-foreground">Simulator</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton isActive={item.active} asChild>
                    <a href={item.href}>
                      <item.icon size="sm" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Projetos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <a href={`#project-${project.id}`}>
                      <FolderLineIcon size="sm" />
                      <span>{project.name}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>{project.chapters}</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="#settings">
                <SettingsLineIcon size="sm" />
                <span>Configurações</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
