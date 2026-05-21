# SPEC.md — Especificação Técnica
## Korú Brand System Viewer

**Versão:** 1.0  
**Data:** 2026-05-21  
**Status:** Fase 1 — Scaffold + Interface local  

---

## 1. Arquitetura Geral

### Fluxo da Aplicação

```
Usuário acessa URL
        │
        ▼
┌─────────────────────────────────────────────┐
│              Next.js App Router              │
│                                             │
│  app/layout.tsx  ←── layout global          │
│       │                                     │
│       ├── Sidebar.tsx  ←── nav dinâmica      │
│       │       │                             │
│       │       └── lê content/ via mdx.ts    │
│       │                                     │
│       └── ContentArea.tsx                   │
│               │                             │
│               └── MDXRenderer.tsx           │
│                       │                     │
│                       └── renderiza .mdx    │
└─────────────────────────────────────────────┘
        │
        ▼
Arquivo MDX em content/[section]/[page].mdx
        │
        ▼
gray-matter extrai frontmatter
        │
        ▼
next-mdx-remote serializa e hidrata no cliente
```

### Princípios de Arquitetura

- **Server Components por padrão** — leitura de arquivos MDX acontece no servidor (sem `use client` desnecessário)
- **Client Components pontuais** — apenas onde há interatividade (ex: sidebar colapsável, estado de nav ativa)
- **Sem banco de dados na Fase 1** — toda a navegação é gerada a partir do sistema de arquivos em `content/`
- **Static Generation** — páginas MDX são renderizadas estaticamente via `generateStaticParams`

---

## 2. Estrutura de Pastas

```
koru-brand-system/
├── app/
│   ├── layout.tsx              ← layout global: fonte, tema, sidebar + content
│   ├── page.tsx                ← redirect para primeira seção (ex: /identidade/introducao)
│   ├── globals.css             ← variáveis CSS, reset, dark theme
│   └── [section]/
│       └── [page]/
│           └── page.tsx        ← Server Component que lê e renderiza MDX
│
├── components/
│   ├── Sidebar.tsx             ← navegação lateral (Client Component)
│   ├── ContentArea.tsx         ← wrapper da área de conteúdo
│   ├── MDXRenderer.tsx         ← renderiza MDX com componentes customizados
│   └── ui/                     ← componentes shadcn/ui gerados automaticamente
│
├── content/                    ← arquivos .mdx do brand system (fonte de verdade)
│   ├── identidade/
│   │   ├── introducao.mdx
│   │   └── posicionamento.mdx
│   ├── cores/
│   │   ├── paleta.mdx
│   │   └── uso.mdx
│   ├── tipografia/
│   │   └── fontes.mdx
│   ├── voz/
│   │   └── tom.mdx
│   ├── iconografia/
│   │   └── icones.mdx
│   └── componentes/
│       └── botoes.mdx
│
├── lib/
│   └── mdx.ts                  ← helpers: leitura de arquivos, geração de nav tree
│
├── public/
│   └── fonts/                  ← fontes locais (se houver)
│
├── docs/                       ← documentação do projeto
│   ├── BRIEFING.md
│   ├── PRD.md
│   └── SPEC.md                 ← este arquivo
│
├── next.config.ts
├── tailwind.config.ts
├── components.json             ← config shadcn/ui
├── tsconfig.json
└── package.json
```

### Convenções de nomenclatura

| Item | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase | `Sidebar.tsx` |
| Arquivos de lib | camelCase | `mdx.ts` |
| Pastas de seção | kebab-case | `identidade/` |
| Arquivos MDX | kebab-case | `paleta-primaria.mdx` |

---

## 3. Componentes Principais

### 3.1 `Layout` — `app/layout.tsx`

Layout global. Define a estrutura visual de todas as páginas: sidebar fixa à esquerda + área de conteúdo à direita.

```tsx
// app/layout.tsx
import { Sidebar } from '@/components/Sidebar'
import { getAllSections } from '@/lib/mdx'
import type { ReactNode } from 'react'
import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const sections = await getAllSections()

  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-foreground flex min-h-screen">
        <Sidebar sections={sections} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
```

**Responsabilidades:**
- Definir `lang`, `className="dark"` fixo (dark-only)
- Buscar a lista de seções para popular a Sidebar (server-side)
- Compor Sidebar + `<main>` sem lógica de negócio

---

### 3.2 `Sidebar` — `components/Sidebar.tsx`

Navegação lateral. Lista todas as seções e páginas do brand system. Destaca a página ativa. Suporta colapso por seção.

**Interface:**

```tsx
type Page = {
  slug: string       // ex: "introducao"
  title: string      // do frontmatter
  order: number      // do frontmatter
}

type Section = {
  slug: string       // ex: "identidade"
  title: string      // capitalizado ou do frontmatter do index
  order: number
  pages: Page[]
}

// props
interface SidebarProps {
  sections: Section[]
}
```

**Comportamentos:**
- `use client` — usa `usePathname()` para detectar rota ativa
- Seções colapsáveis com estado local (`useState`)
- Link ativo destacado com classe `data-active` ou `aria-current="page"`
- Scroll interno independente se a lista for longa

**Estrutura visual (simplificada):**

```
┌─────────────────────┐
│  ◈ KORÚ             │ ← logotipo / título
│─────────────────────│
│  ▾ IDENTIDADE       │ ← seção colapsável
│    · Introdução     │ ← página ativa (destacada)
│    · Posicionamento │
│  ▸ CORES            │ ← seção colapsada
│  ▸ TIPOGRAFIA       │
│  ▸ VOZ              │
│  ▸ ICONOGRAFIA      │
│  ▸ COMPONENTES      │
└─────────────────────┘
```

---

### 3.3 `ContentArea` — `components/ContentArea.tsx`

Wrapper da área de conteúdo. Define padding, largura máxima, e espaçamento da tipografia.

```tsx
// components/ContentArea.tsx
import type { ReactNode } from 'react'

export function ContentArea({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      {children}
    </div>
  )
}
```

**Responsabilidades:**
- Conter o MDX renderizado
- Aplicar estilos de tipografia (`prose` do Tailwind Typography ou classes customizadas)
- Não ter lógica — apenas composição visual

---

### 3.4 `MDXRenderer` — `components/MDXRenderer.tsx`

Recebe conteúdo MDX serializado e renderiza com componentes customizados do design system Korú.

```tsx
// components/MDXRenderer.tsx
'use client'

import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { components } from './mdx-components'

interface MDXRendererProps {
  source: MDXRemoteSerializeResult
}

export function MDXRenderer({ source }: MDXRendererProps) {
  return <MDXRemote {...source} components={components} />
}
```

**Componentes customizados MDX (`mdx-components`):**

| Tag HTML | Componente customizado | Finalidade |
|---|---|---|
| `h1` | `<H1>` | Heading display com font Korú |
| `h2` | `<H2>` | Heading de seção |
| `p` | `<P>` | Parágrafo com espaçamento correto |
| `code` | `<Code>` | Inline code estilizado |
| `pre` | `<Pre>` | Bloco de código com syntax highlight |
| `table` | `<Table>` | Tabela responsiva |
| `img` | `<Image>` | Next.js `<Image>` otimizado |

---

### 3.5 Page — `app/[section]/[page]/page.tsx`

Server Component. Lê o arquivo MDX do disco, serializa com `next-mdx-remote/rsc` e renderiza.

```tsx
// app/[section]/[page]/page.tsx
import { getPageContent, getAllSections } from '@/lib/mdx'
import { MDXRenderer } from '@/components/MDXRenderer'
import { ContentArea } from '@/components/ContentArea'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { section: string; page: string }
}

export async function generateStaticParams() {
  const sections = await getAllSections()
  return sections.flatMap(s =>
    s.pages.map(p => ({ section: s.slug, page: p.slug }))
  )
}

export default async function Page({ params }: PageProps) {
  const content = await getPageContent(params.section, params.page)
  if (!content) notFound()

  return (
    <ContentArea>
      <MDXRenderer source={content.source} />
    </ContentArea>
  )
}
```

---

## 4. Processamento de MDX

### Abordagem

- **Biblioteca:** `next-mdx-remote` com `serialize` (servidor) + `MDXRemote` (cliente)
- **Leitura de arquivos:** `fs/promises` no servidor, nunca no cliente
- **Parsing de frontmatter:** `gray-matter`

### Frontmatter esperado

Todo arquivo `.mdx` em `content/` deve ter frontmatter com os seguintes campos:

```yaml
---
title: "Paleta Primária"
description: "As cores principais do universo Korú e suas aplicações."
order: 1
section: "cores"
---
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `title` | string | sim | Título exibido na sidebar e no `<h1>` da página |
| `description` | string | não | Meta-descrição da página |
| `order` | number | sim | Ordenação dentro da seção (1 = primeiro) |
| `section` | string | não | Slug da seção pai (redundante mas útil para validação) |

### Helper `lib/mdx.ts`

```typescript
// lib/mdx.ts
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'

const CONTENT_DIR = path.join(process.cwd(), 'content')

// Retorna todas as seções com seus arquivos, ordenadas por `order`
export async function getAllSections(): Promise<Section[]> {
  const sectionDirs = await fs.readdir(CONTENT_DIR)

  const sections = await Promise.all(
    sectionDirs.map(async (sectionSlug) => {
      const sectionPath = path.join(CONTENT_DIR, sectionSlug)
      const files = await fs.readdir(sectionPath)

      const pages = await Promise.all(
        files
          .filter(f => f.endsWith('.mdx'))
          .map(async (file) => {
            const raw = await fs.readFile(path.join(sectionPath, file), 'utf-8')
            const { data } = matter(raw)
            return {
              slug: file.replace('.mdx', ''),
              title: data.title as string,
              order: (data.order as number) ?? 99,
            }
          })
      )

      return {
        slug: sectionSlug,
        title: capitalize(sectionSlug),
        order: pages[0]?.order ?? 99,
        pages: pages.sort((a, b) => a.order - b.order),
      }
    })
  )

  return sections.sort((a, b) => a.order - b.order)
}

// Lê um arquivo MDX específico e serializa para o cliente
export async function getPageContent(section: string, page: string) {
  const filePath = path.join(CONTENT_DIR, section, `${page}.mdx`)

  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const { content, data } = matter(raw)
    const source = await serialize(content, { scope: data })
    return { source, frontmatter: data }
  } catch {
    return null
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
```

---

## 5. Navegação e Roteamento

### Estrutura de rotas

| URL | Arquivo | Descrição |
|---|---|---|
| `/` | `app/page.tsx` | Redirect para `/identidade/introducao` |
| `/identidade/introducao` | `app/[section]/[page]/page.tsx` | Página MDX renderizada |
| `/cores/paleta` | `app/[section]/[page]/page.tsx` | Página MDX renderizada |

### Redirect inicial

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/identidade/introducao')
}
```

### Geração estática

Todas as rotas são geradas estaticamente via `generateStaticParams`. Não há rotas dinâmicas em tempo de execução na Fase 1 — o conteúdo é fixo em `content/`.

### Ordenação da sidebar

A sidebar é ordenada pelo campo `order` do frontmatter. Convenção sugerida:

```
Seção 1: identidade  (order: 1–9)
Seção 2: cores       (order: 10–19)
Seção 3: tipografia  (order: 20–29)
Seção 4: voz         (order: 30–39)
Seção 5: iconografia (order: 40–49)
Seção 6: componentes (order: 50–59)
```

---

## 6. Design System e Estilização

### Fonte do design system

O design system real já existe em `koru-site/koru-viewer/app/globals.css`. O `globals.css` do novo projeto deve ser copiado diretamente desse arquivo, com ajustes mínimos de path se necessário. Não recriar do zero.

> **Nota sobre modo padrão:** o brand system usa dark mode como padrão — a classe `dark` é aplicada no `<html>` no momento da inicialização. O toggle para light mode é suportado (basta remover a classe `dark`), mas dark é o estado inicial e o modo projetado.

---

### Stack de estilização

```
@import "tailwindcss"          ← Tailwind CSS 4 (não tailwind.config.ts)
tw-animate-css                 ← animações utilitárias
shadcn/tailwind.css            ← base do shadcn/ui
@custom-variant dark (&:is(.dark *))  ← variant dark via classe, não prefers-color-scheme
```

---

### Paleta de cores — CSS custom properties

Definidas em `@theme inline` no `globals.css`. Dois grupos:

**Brand (tons aquáticos):**

| Token | Hex | Descrição |
|---|---|---|
| `--color-iara` | `#0B6377` | Teal médio — cor âncora da marca |
| `--color-una` | `#090E17` | Quase-preto azulado |
| `--color-alva` | `#77C5D5` | Azul-água claro |
| `--color-orvalho` | `#DEF7F9` | Quase-branco aquático |
| `--color-mare` | `#92DCE2` | Água turquesa médio |
| `--color-jala` | `#35BDC8` | Ciano vibrante |
| `--color-mara` | `#2CA0AB` | Teal saturado |
| `--color-omi` | `#1A6872` | Teal escuro |
| `--color-pego` | `#114F56` | Verde-água fundo |
| `--color-ibu` | `#0B363C` | Quase-preto teal |

**Warm (tons quentes e terrosos):**

| Token | Hex | Descrição |
|---|---|---|
| `--color-barro` | `#8B3D17` | Terracota |
| `--color-mel` | `#9B6C22` | Âmbar dourado |
| `--color-mata` | `#707C36` | Verde musgo |
| `--color-jambo` | `#BF505C` | Rosa-vermelho |
| `--color-brasa` | `#DD560D` | Laranja brasa |
| `--color-urucum` | `#C72211` | Vermelho urucum |

**Grays:**

Escala de 12 passos de `--color-gray-0: #000000` até `--color-gray-50: #F2F2F2`.

---

### Tokens semânticos — Dark mode (`.dark`)

Aplicados via classe `.dark` no `<html>`:

| Token | Valor OKLCH | Papel |
|---|---|---|
| `--background` | `oklch(0 0 0)` | Preto puro |
| `--foreground` | `oklch(0.93 0.012 85)` | Creme quente |
| `--primary` | `oklch(0.66 0.08 204)` | Teal principal |
| `--gold` | `oklch(0.72 0.10 75)` | Dourado (accent literário) |
| `--blue-cold` | `oklch(0.62 0.09 220)` | Azul-frio (herança Temiku/Oruku) |
| `--sidebar` | `oklch(0.05 0.004 280)` | Quase-preto para sidebar |

### Tokens semânticos — Light mode (`:root`)

| Token | Valor | Papel |
|---|---|---|
| `--background` | `#F7F2E6` | Creme |
| `--primary` | `oklch(0.47 0.08 204)` | Teal mais escuro |

---

### Tipografia

| Variável | Fonte | Uso |
|---|---|---|
| `--font-heading` | `var(--font-serif)` | `h1`, `h2` — serif display |
| `--font-sans` | sans-serif do sistema/projeto | Corpo, UI |
| `--font-mono` | `'Space Mono', ui-monospace` | Blocos de código |

---

### Utilities customizadas

Definidas diretamente no `globals.css` como classes utilitárias:

| Classe | Descrição |
|---|---|
| `.glass` | Glassmorphism com `backdrop-filter` (light) |
| `.dark .glass` | Versão dark do glassmorphism |
| `.glass-card` | Card sem borda, sombra sutil |
| `.dark .glass-card` | Versão dark do card |
| `.koru-card` | Card com hover scale, `transition: 380ms` |
| `.koru-nav-item` | Nav item com transition suave |
| `.koru-hero-text` | Animação de entrada para títulos hero |
| `.drop-cap` | Capitular em dourado — uso exclusivo em textos literários |

---

### Easing tokens

```css
--ease-smooth: cubic-bezier(0.22, 1, 0.36, 1)
--ease-soft:   cubic-bezier(0.4, 0, 0.2, 1)
--ease-gentle: cubic-bezier(0.33, 1, 0.68, 1)
```

---

### shadcn/ui

Componentes base utilizados na Fase 1:

| Componente | Uso |
|---|---|
| `ScrollArea` | Sidebar scrollável independente |
| `Separator` | Divisória entre seções da sidebar |
| `Button` | Links da sidebar (variante `ghost`) |
| `Badge` | Tags futuras em páginas MDX |
| `Tooltip` | Labels em sidebar colapsada |

---

## 7. Fase 2 — Integrações Planejadas (não implementar agora)

### 7.1 Supabase Auth

Autenticação de usuários para acesso ao brand system (interno).

- Provider: email/password ou magic link
- Middleware Next.js para proteção de rotas
- Tabela `users` com campo `role` (admin, viewer)

### 7.2 Supabase Postgres

Metadados de conteúdo, versionamento e histórico de edições.

```sql
-- Tabela futura: pages
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id),
  UNIQUE(section, slug)
);
```

### 7.3 Supabase Storage

Upload de assets do brand system: logos, ícones, imagens, arquivos de fonte.

- Bucket: `koru-assets`
- Organização: `logos/`, `icones/`, `fontes/`, `imagens/`

### 7.4 Vercel

CI/CD com deploy automático.

- Deploy automático no push para `main`
- Preview deployments em PRs
- Edge Functions para middleware de auth (futuro)

### 7.5 Variáveis de ambiente (preparar agora, usar na Fase 2)

Criar `.env.local` com as seguintes variáveis (deixar em branco até configurar Supabase):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Adicionar `.env.local` ao `.gitignore`. Criar `.env.example` com as chaves (sem valores) para referência.

---

## 8. Setup Inicial — Comandos

### 8.1 Criar o projeto Next.js

```bash
npx create-next-app@latest koru-brand-system \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

**Flags explicadas:**
- `--typescript` — TypeScript obrigatório
- `--tailwind` — Tailwind CSS instalado e configurado
- `--app` — App Router (não Pages Router)
- `--src-dir=false` — pastas `app/`, `components/` na raiz (não em `src/`)
- `--import-alias="@/*"` — alias `@/` para imports absolutos

### 8.2 Instalar dependências principais

```bash
cd koru-brand-system

# Processamento MDX
npm install next-mdx-remote gray-matter

# Tipos
npm install -D @types/mdx

# Tailwind Typography (para prosa MDX)
npm install -D @tailwindcss/typography
```

### 8.3 Configurar shadcn/ui

```bash
npx shadcn@latest init
```

Responder ao prompt:
- Style: **Default**
- Base color: **Neutral** (vamos sobrescrever com cores Korú manualmente)
- CSS variables: **Yes**

Adicionar componentes usados na Fase 1:

```bash
npx shadcn@latest add scroll-area separator button badge tooltip
```

### 8.4 Estrutura de pastas inicial

```bash
# Criar pastas
mkdir -p content/{identidade,cores,tipografia,voz,iconografia,componentes}
mkdir -p components
mkdir -p lib
mkdir -p docs

# Criar arquivo MDX de exemplo
cat > content/identidade/introducao.mdx << 'EOF'
---
title: "Introdução"
description: "Visão geral do universo visual Korú."
order: 1
section: "identidade"
---

# Korú — Brand System

Este é o guia visual do universo Korú.
EOF
```

---

## 9. Decisões Técnicas e Justificativas

### Por que App Router (não Pages Router)?

O App Router do Next.js 15 é a arquitetura recomendada e default. As vantagens para este projeto:

- **Server Components nativos** — leitura de arquivos MDX no servidor sem boilerplate de `getStaticProps`
- **Layouts aninhados** — sidebar definida uma vez em `layout.tsx`, sem duplicação por página
- **`generateStaticParams`** — substitui `getStaticPaths` com API mais limpa
- **Streaming e Suspense** — útil na Fase 2 quando houver dados do Supabase

O Pages Router seria funcional mas exigiria mais código repetitivo (`getStaticProps` em cada página) e não é o caminho de evolução do framework.

### Por que `next-mdx-remote` (não `@next/mdx`)?

| Critério | `next-mdx-remote` | `@next/mdx` |
|---|---|---|
| Arquivos MDX fora de `app/` | Sim (lê de qualquer lugar) | Não (apenas dentro de `app/`) |
| Frontmatter via gray-matter | Sim | Não nativo |
| Componentes customizados por página | Sim | Sim |
| Configuração | Simples | Requer config no `next.config.ts` |

Para um viewer onde o conteúdo vive em `content/` (fora de `app/`), `next-mdx-remote` é a escolha natural. Ele permite ler arquivos de qualquer diretório, serializar no servidor, e hidratar no cliente com componentes customizados.

### Por que Supabase (não Firebase/PlanetScale/outro)?

- **Postgres** — SQL padrão, queries relacionais, extensível (pgvector no futuro para busca semântica de conteúdo)
- **Auth integrado** — sem biblioteca extra, funciona nativamente com Next.js via `@supabase/ssr`
- **Storage** — gerenciamento de assets com o mesmo SDK
- **Self-hostable** — se necessário, pode migrar para instância própria
- **Gratuito no plano free** — suficiente para a Fase 2 inicial

Firebase seria uma alternativa válida mas força NoSQL, o que complica queries relacionais futuras (versões, histórico, permissões por seção).

---

## 10. Checklist de Entrega — Fase 1

- [ ] Projeto Next.js iniciado com `create-next-app` e flags corretas
- [ ] shadcn/ui configurado (`components.json` presente, tema sobrescrito com cores Korú)
- [ ] Tailwind CSS 4 com dark-only configurado em `globals.css`
- [ ] Variáveis de cor Korú definidas em OKLCH (background, primary, accent, muted, border)
- [ ] Fontes configuradas via `next/font` (Inter + Cormorant Garamond + JetBrains Mono)
- [ ] Sidebar renderizando seções geradas dinamicamente de `content/`
- [ ] Sidebar com estado de página ativa via `usePathname`
- [ ] Pelo menos 1 arquivo MDX renderizando corretamente na ContentArea
- [ ] Frontmatter sendo lido e aplicado (`title`, `order`)
- [ ] Navegação entre páginas funcionando (link → nova rota → novo MDX)
- [ ] `generateStaticParams` configurado (build estático funcional)
- [ ] Redirect `/` → primeira página funcionando
- [ ] Sem erros no console do browser
- [ ] Rodando em `localhost:3000`
- [ ] `.env.example` criado com chaves Supabase (vazias)
- [ ] `.env.local` no `.gitignore`

---

## Referências

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)
- [gray-matter](https://github.com/jonschlinkert/gray-matter)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS 4](https://tailwindcss.com/docs/v4-beta)
- [Supabase + Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
