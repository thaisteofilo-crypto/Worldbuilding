# PRD — Korú Brand System Web App

**Versão:** 1.0  
**Data:** 2026-05-21  
**Autora/Product Owner:** Thais Teofilo  
**Status:** Em desenvolvimento (Fase 1)

---

## 1. Resumo Executivo

### Problema

O universo criativo de Korú possui uma bíblia de mundo extensa, contos literários, capítulos de livro e um design system consolidado. Todo esse material existe distribuído em arquivos `.md` no repositório, sem uma interface de consulta. Acessar a bíblia, verificar regras de consistência ou consultar a paleta de cores exige abrir múltiplos arquivos num editor de texto — fluxo inadequado para colaboradores externos (artistas, editores, co-autores) e para a própria autora durante o processo criativo.

### Solução

Um **Brand System Web App** — interface web navegável que consolida toda a documentação do universo Korú em um único viewer com design fiel ao mundo. A aplicação lê os arquivos Markdown existentes no repositório e os renderiza com tipografia editorial e navegação estruturada por seção.

### Proposta de Valor

| Para quem | O que entrega |
|---|---|
| Autora (Thais) | Consulta rápida da bíblia durante o processo criativo sem sair do fluxo |
| Colaboradores futuros | Onboarding visual do universo Korú sem acesso ao repositório bruto |
| Designers / Artistas | Referência consolidada de identidade visual, paleta, tipografia e voz |
| Editores | Acesso controlado aos contos e capítulos com contexto de mundo |

---

## 2. Usuários-Alvo

### Usuário Primário — Autora

- **Perfil:** Thais Teofilo, autora e criadora do universo Korú
- **Contexto de uso:** Local, durante sessões de escrita e worldbuilding
- **Necessidade:** Consultar regras de consistência, relações entre personagens, estados do Bomi Veh, paleta de cores — sem interromper o fluxo criativo
- **Nível técnico:** Alto (usa Claude Code, Git, editores de texto)

### Usuário Secundário — Colaboradores Criativos

- **Perfil:** Artistas de personagem, designers gráficos, editores literários
- **Contexto de uso:** Remoto, via link compartilhado (Fase 2+)
- **Necessidade:** Entender o universo sem precisar ler o repositório inteiro; referência de identidade visual para criar assets
- **Nível técnico:** Variável (do técnico ao não-técnico)

### Usuário Terciário — Co-autores / Escritores Convidados

- **Perfil:** Escritores que possam colaborar em contos futuros
- **Contexto de uso:** Remoto, com acesso controlado
- **Necessidade:** Leitura da bíblia e dos contos publicados; referência de voz da autora
- **Nível técnico:** Baixo a médio

---

## 3. Objetivos e Métricas de Sucesso

### Fase 1 — Interface Local

| Objetivo | Métrica de Sucesso |
|---|---|
| Aplicação roda localmente sem erros | `npm run dev` inicia sem erros de console |
| Sidebar lista todas as seções | 100% dos arquivos de conteúdo representados na navegação |
| MDX renderiza corretamente | Tabelas, callouts, headings e blockquotes com estilo Korú |
| Navegação entre seções funciona | Clique em item da sidebar carrega conteúdo correto em < 500ms |
| Design alinhado ao universo | Paleta OKLCH, tipografia Instrument Serif + Inter, dark mode fixo |
| Responsivo desktop-first | Layout funcional em 1280px, 1024px e 768px |
| Build sem erros de TypeScript | `npm run typecheck` retorna 0 erros |

### Fase 2 — Plataforma com Auth e Dados

| Objetivo | Métrica de Sucesso |
|---|---|
| Autenticação funcional | Login / logout via Supabase Auth sem erro |
| Controle de acesso | Usuário `viewer` não acessa rotas de admin |
| Deploy disponível | URL Vercel acessível com uptime > 99% |
| Storage de assets | Upload e exibição de imagens de personagem via Supabase Storage |

---

## 4. Funcionalidades — Fase 1 (Must Have)

### 4.1 Layout com Sidebar de Navegação

- Sidebar fixa (desktop) com grupos colapsáveis por seção
- Grupos: Bíblia, Livro, Contos, Briefings
- Item ativo destacado com cor de acento (`--accent`, lilás)
- Sidebar collapsível em tablet (hamburger menu)
- Sidebar oculta por padrão em mobile com botão de abertura
- Nomes proprietários do universo nos labels (ex: "Regras · Os 13 Acordos")

### 4.2 Renderização de MDX

- Compilação server-side via `next-mdx-remote`
- Componentes customizados para cada elemento HTML:
  - `h1`: Instrument Serif, dourado (`--gold`)
  - `h2`: Instrument Serif, lilás (`--accent`), separador visual
  - `h3`: Inter semibold, `--foreground`
  - `table`: bordas `--border`, cabeçalho `--surface`, zebra sutil
  - `blockquote`: borda esquerda `--accent`, fundo `--surface`, itálico
  - `code`: fundo `--surface`, fonte mono, `--blue-cold`
  - `strong`: `--gold`
- Callout especial para os 13 Acordos (regras do mundo)
- Suporte a frontmatter via `gray-matter` (título, status, personagem, parte)

### 4.3 Navegação entre Seções

- Roteamento baseado em arquivos (Next.js App Router)
- Breadcrumb com seção atual
- Navegação prev/next entre páginas da mesma seção (ex: Parte 01 → Parte 02)
- Redirect de `/` para a primeira página da bíblia

**Rotas previstas:**

| Rota | Conteúdo |
|---|---|
| `/` | Redirect para `/biblia/parte-00` |
| `/biblia/[parte]` | Partes da bíblia (00–08) |
| `/livro/[capitulo]` | Capítulos do livro (01–12 + epílogo) |
| `/contos/[personagem]` | Contos (amara, oruku, beku, obaru, kemdi, temi, orike, temiku, kairo) |
| `/briefing` | koru-ecosystem-briefing.md |
| `/workflow` | koru-workflow.md |

### 4.4 Design Dark-Only Alinhado ao Universo Korú

Paleta OKLCH (dark mode fixo, sem toggle):

| Token | OKLCH | Significado no mundo |
|---|---|---|
| `--background` | `oklch(0.07 0.008 280)` | Escuridão do Akwu |
| `--surface` | `oklch(0.10 0.006 280)` | Superfícies internas |
| `--border` | `oklch(0.18 0.006 280)` | Bordas sutis |
| `--foreground` | `oklch(0.92 0.012 85)` | Texto principal (branco quente) |
| `--muted-foreground` | `oklch(0.55 0.01 280)` | Labels, navegação inativa |
| `--accent` | `oklch(0.65 0.09 290)` | Lilás — Bomi Veh, hover / ativo |
| `--gold` | `oklch(0.72 0.10 75)` | Dourado — Luz Oru, títulos |
| `--blue-cold` | `oklch(0.62 0.09 220)` | Azul-frio — Azuri / Oruku |
| `--primary` | `oklch(0.65 0.09 290)` | CTA / item selecionado |

Tipografia:
- Títulos (h1–h2): Instrument Serif, weight 400
- UI / labels / sidebar: Inter
- Corpo literário: Instrument Serif, 1.125rem, line-height 1.85
- Corpo técnico (bíblia): Inter, 0.9375rem, line-height 1.7

### 4.5 Responsividade (Desktop-First)

| Breakpoint | Comportamento |
|---|---|
| ≥ 1280px | Sidebar fixa à esquerda, conteúdo com max-w-prose centralizado |
| 1024px – 1279px | Sidebar fixa, conteúdo ajustado |
| 768px – 1023px | Sidebar colapsável via botão |
| < 768px | Sidebar como drawer (overlay), hamburger menu no header |

---

## 5. Funcionalidades — Fase 2 (Planned)

### 5.1 Autenticação (Supabase Auth)

- Login com email + senha (sem OAuth por padrão)
- Sessão persistente via cookies (Supabase SSR com `@supabase/ssr`)
- Middleware Next.js para proteger rotas autenticadas
- Página de login com identidade visual Korú
- Logout com limpeza de sessão

### 5.2 Banco de Dados (Supabase Postgres)

- Tabela `users` com campos: `id`, `email`, `role` (`viewer` | `editor` | `admin`), `created_at`
- Tabela `content_labels` para títulos customizados de documentos (override de frontmatter)
- Tabela `characters` para metadados dos personagens (evitar hardcode)
- Tabela `glossary` para os termos do glossário (evitar rebuild de regex por página)

### 5.3 Storage de Assets (Supabase Storage)

- Bucket `character-assets`: imagens de design de personagem por personagem
- Bucket `world-assets`: mapas, diagramas, referências visuais
- Exibição de imagens inline nos documentos via URL pública do bucket
- Upload via interface admin (Fase 2+)

### 5.4 Deploy Automático (Vercel)

- Deploy conectado ao repositório GitHub (branch `main`)
- Preview deployments para branches de desenvolvimento
- Variáveis de ambiente via Vercel dashboard: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Build sem erros TypeScript obrigatório para deploy

### 5.5 Sistema de Permissões

| Role | Acesso |
|---|---|
| `viewer` | Leitura de bíblia, contos e livro publicados |
| `editor` | Leitura completa + acesso a briefings e documentos de planejamento |
| `admin` | Acesso total + painel de gestão de conteúdo e usuários |

---

## 6. Funcionalidades — Out of Scope

As funcionalidades abaixo estão fora do escopo atual (Fases 1 e 2) e não devem ser incluídas sem revisão explícita do product owner:

| Funcionalidade | Motivo de exclusão |
|---|---|
| CMS visual (editor WYSIWYG inline) | Edição ocorre via Claude Code / VS Code; duplicaria ferramentas |
| Colaboração em tempo real (co-edição) | Fora do modelo de trabalho atual; dependeria de CRDT ou Operational Transform |
| Exportação para PDF | Complexidade de layout elevada; substituível por print CSS no futuro |
| Modo de apresentação / slideshow | Nicho e baixa prioridade em relação à consulta diária |
| Mapa interativo de Ikwe | Alto esforço; candidato a Fase 3+ |
| Timeline visual das Cinco Eras | Alto esforço; candidato a Fase 3+ |
| Grafo de relações entre personagens | Requer biblioteca de visualização (D3, Cytoscape); Fase 3+ |
| Diff viewer de versões da bíblia | Git já provê esse histórico |
| Suporte multi-idioma | Mundo e autora são lusófonos; sem necessidade imediata |
| App mobile nativo | Web responsiva suficiente para o caso de uso |

---

## 7. Estrutura de Conteúdo Esperada

O viewer organiza o conteúdo em seções fixas. Cada seção corresponde a uma pasta ou conjunto de arquivos no repositório.

### 7.1 Bíblia do Mundo

| Arquivo | Título na Sidebar |
|---|---|
| `parte-00-manifesto.md` | Manifesto |
| `parte-01-fisica-cosmologia.md` | Física e Cosmologia |
| `parte-02-geografia.md` | Geografia |
| `parte-03-ecossistema.md` | Ecossistema · O Ciclo da Memória |
| `parte-04-criaturas.md` | Criaturas |
| `parte-05-personagens.md` | Personagens |
| `parte-06-regras.md` | Regras · Os 13 Acordos |
| `parte-07-cultura.md` | Cultura e Rituais |
| `parte-08-linha-do-tempo.md` | Linha do Tempo |
| `glossario-de-koru.md` | Glossário de Korú |
| `glossario-de-lugares.md` | Glossário de Lugares |

### 7.2 Livro — História de Temiku

12 capítulos + epílogo. Estrutura expandida aprovada em 2026-04-24.

| Capítulos | Nota |
|---|---|
| capitulo-01 a capitulo-12 | Conteúdo literário; tom narrativo |
| epilogo | Conteúdo original externo ao repositório; não modificar |

### 7.3 Contos por Personagem

| Arquivo | Personagem |
|---|---|
| `conto-amara.md` | Amara |
| `conto-oruku.md` | Oruku |
| `conto-beku.md` | Beku |
| `conto-obaru.md` | Obaru |
| `conto-kemdi.md` | Kemdi |
| `conto-temi.md` | Temi |
| `conto-orike.md` | Orike |
| `conto-temiku.md` | Temiku |
| `conto-kairo.md` | Kairo |

### 7.4 Briefings e Referências

| Documento | Descrição |
|---|---|
| `koru-ecosystem-briefing.md` | Bíblia compacta / fonte autoritativa |
| `koru-workflow.md` | Mapa do projeto e ordem de criação |
| `design-system/` | Design system Korú (tokens, componentes) |

### 7.5 Frontmatter Suportado

```yaml
---
title: "Nome legível para a sidebar"
status: "completo" | "draft" | "placeholder"
personagem: "amara"      # apenas contos
parte: 0                 # apenas bíblia
tom: "literario" | "tecnico"   # define tipografia aplicada
---
```

---

## 8. Requisitos Não-Funcionais

### 8.1 Performance

| Requisito | Meta |
|---|---|
| Server start (Turbopack) | < 1000ms |
| First Contentful Paint (FCP) | < 1.5s em conexão local |
| Navegação entre páginas (client-side) | < 300ms |
| Build sem warnings críticos | 0 erros TypeScript, 0 erros de lint |
| Imagens com `sizes` prop | Obrigatório em todos os `<Image fill>` |

Recomendações de otimização (a implementar progressivamente):
- ISR (Incremental Static Regeneration) para páginas da bíblia que mudam raramente
- Memoização do regex de glossário (evitar rebuild por página)
- Code splitting por seção (sidebar carrega sob demanda)

### 8.2 Acessibilidade (WCAG AA)

| Requisito | Meta |
|---|---|
| Contrast ratio — texto principal | ≥ 7:1 (AA+) |
| Contrast ratio — texto secundário | ≥ 4.5:1 (AA) |
| Navegação por teclado | 100% das páginas navegáveis via Tab |
| `aria-label` em elementos de navegação | Obrigatório em sidebar e botões de ícone |
| Skip-to-content link | Visível em focus |
| Tooltips do glossário | Acessíveis via `tabIndex={0}` + `focus-within` (Fase 2) |
| `autocomplete` em formulários de login | `email`, `current-password` obrigatórios |

### 8.3 Manutenibilidade

| Requisito | Especificação |
|---|---|
| Linguagem | TypeScript estrito (`strict: true`) |
| Linting | ESLint com configuração Next.js |
| Formatação | Prettier com `prettier-plugin-tailwindcss` |
| Estrutura de arquivos | App Router Next.js; separação clara entre `app/`, `components/`, `lib/`, `content/` |
| Adição de conteúdo | Novo arquivo `.md` na pasta correta = aparece automaticamente na sidebar |
| Tokens de design | Definidos em `globals.css` como custom properties CSS; nenhum valor hardcoded no JSX |
| Componentes | shadcn/ui como base; customizações via `className` Tailwind, não override de CSS global |

### 8.4 Segurança (Fase 2+)

- Variáveis de ambiente nunca expostas ao client (`SUPABASE_SERVICE_ROLE_KEY` apenas server-side)
- Middleware de autenticação protege todas as rotas exceto `/entrar`
- RLS (Row Level Security) habilitado no Supabase para todas as tabelas
- Sem dados sensíveis armazenados em localStorage

---

## 9. Dependências e Riscos

### 9.1 Dependências Técnicas

| Dependência | Versão | Criticidade | Alternativa |
|---|---|---|---|
| Next.js | ^16.x | Alta — estrutura do app | — |
| React | ^19.x | Alta | — |
| Tailwind CSS | ^4.x | Alta — design system | — |
| next-mdx-remote | ^6.x | Alta — renderização de conteúdo | `@next/mdx` (menos flexível) |
| gray-matter | ^4.x | Média — parse de frontmatter | `js-yaml` manual |
| shadcn/ui | ^4.x | Média — componentes de UI | Componentes custom |
| Supabase (Fase 2) | ^2.x | Alta (Fase 2) | PlanetScale + Clerk |
| Vercel (Fase 2) | — | Média (Fase 2) | Netlify, Railway |

### 9.2 Dependências de Conteúdo

- Os arquivos `.md` são a fonte de dados. Qualquer mudança na estrutura de pastas (ex: renomear `biblia/` para `bible/`) quebra as rotas — requer atualização coordenada entre repositório e app.
- O epílogo do livro tem conteúdo externo ao repositório; o arquivo atual é placeholder e não deve ser modificado pelo app.
- Novos capítulos (expansão para 12 capítulos aprovada) devem seguir convenção de nomenclatura `capitulo-XX.md`.

### 9.3 Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Migração de design system (OKLCH antigo → novo) ainda pendente | Alta | Médio | Fixar tokens no `globals.css` do viewer independentemente do design-system/ |
| Conflito de versões Next.js/React 19 com dependências legadas | Média | Alto | Testar `npm install` em ambiente limpo antes de cada nova dependência |
| Supabase free tier tem limite de storage (500MB) | Baixa | Baixo (Fase 1) | Monitorar uso; plano Pro se necessário |
| Epílogo com conteúdo sensível / privado sem autenticação (Fase 1) | Alta | Médio | Epílogo é placeholder em Fase 1; autenticação resolve em Fase 2 |
| Glossário com 44+ termos causa lentidão em páginas longas | Baixa | Baixo | Memoização do regex (listada em dívida técnica) |
| Colaboradores sem acesso ao repositório não podem contribuir (Fase 1) | Alta | Baixo | Aceito em Fase 1; Fase 2 resolve com deploy + auth |

---

## 10. Cronograma de Fases

### Fase 1 — Scaffold e Interface Local

**Objetivo:** Aplicação rodando localmente com sidebar funcional e MDX renderizando.

| Etapa | Entregável | Status |
|---|---|---|
| 1.1 | Scaffold Next.js + shadcn/ui + Tailwind 4 | Concluído |
| 1.2 | Tokens OKLCH no `globals.css` | Concluído |
| 1.3 | Layout root com `SidebarProvider` | Concluído |
| 1.4 | Server function para listar MDs por seção | Concluído |
| 1.5 | Renderização MDX com componentes Korú | Concluído |
| 1.6 | Navegação prev/next entre páginas | Concluído |
| 1.7 | Glossário com 44 termos (tooltip no texto) | Concluído |
| 1.8 | Busca full-text (Cmd+K) | Concluído |
| 1.9 | Responsividade mobile (drawer sidebar) | Concluído |
| 1.10 | QA report — zero erros de console e server | Concluído (2026-04-16) |

**Melhorias de alta prioridade identificadas no QA:**
- Breadcrumb com nomes proprietários (consistência com sidebar)
- Glossary keyboard accessibility (`tabIndex` + `focus-within`)
- `sizes` prop em todas as `<Image fill>`
- Títulos longos no hero mobile

### Fase 2 — Autenticação, Banco e Deploy

**Objetivo:** Plataforma acessível remotamente com controle de acesso.

| Etapa | Entregável | Estimativa |
|---|---|---|
| 2.1 | Configurar projeto Supabase (Auth, DB, Storage) | A definir |
| 2.2 | Middleware de autenticação Next.js | A definir |
| 2.3 | Página de login com design Korú | A definir |
| 2.4 | Tabelas: `users`, `characters`, `glossary`, `content_labels` | A definir |
| 2.5 | Migração de dados hardcoded para Supabase | A definir |
| 2.6 | Bucket de assets de personagem | A definir |
| 2.7 | Deploy no Vercel com variáveis de ambiente | A definir |
| 2.8 | Sistema de roles (`viewer` / `editor` / `admin`) | A definir |
| 2.9 | QA report de autenticação e permissões | A definir |

### Fase 3 — Visualizações e Features Avançadas (Backlog)

Candidatos a Fase 3+ (não priorizados):
- Mapa interativo de Ikwe (geografia clicável)
- Timeline visual das Cinco Eras
- Grafo de relações entre personagens
- Modo apresentação / slideshow
- Exportação para PDF
- Diff viewer de versões da bíblia

---

## Apêndice — Estrutura de Pastas do Projeto

```
koru-site/
└── koru-viewer/
    ├── app/
    │   ├── (viewer)/          ← rotas protegidas / viewer
    │   │   ├── biblia/[parte]/
    │   │   ├── livro/[capitulo]/
    │   │   ├── contos/[personagem]/
    │   │   ├── briefing/
    │   │   └── workflow/
    │   ├── admin/             ← painel de administração
    │   ├── auth/              ← callbacks de autenticação
    │   ├── entrar/            ← página de login
    │   ├── globals.css        ← tokens OKLCH
    │   └── layout.tsx         ← layout root com SidebarProvider
    ├── components/            ← componentes customizados
    ├── content/               ← arquivos .md (fonte de dados)
    │   ├── biblia/
    │   ├── contos/
    │   ├── livro/
    │   ├── koru-ecosystem-briefing.md
    │   └── koru-workflow.md
    ├── hooks/
    ├── lib/
    │   ├── glossary.ts        ← termos do glossário
    │   └── content.ts         ← funções de leitura de MD
    ├── middleware.ts           ← proteção de rotas (Fase 2)
    └── package.json
```

---

*PRD Korú Brand System Web App — v1.0 — 2026-05-21*
