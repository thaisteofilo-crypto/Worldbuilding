# Briefing — Korú Brand System Viewer

## O que é

Interface web local para visualizar os documentos do mundo de Korú em uma UI navegável — sidebar de arquitetura + área de conteúdo renderizado. O objetivo é transformar os MDs em uma experiência de consulta amigável para a autora e futuros colaboradores (artistas, editores).

Não é um site público. É um **viewer de brand system** — a referência viva do mundo.

---

## O que ele exibe

Toda a estrutura de documentos do repositório, renderizada com tipografia editorial:

| Seção | Origem |
|---|---|
| Bíblia (partes 0–8) | `biblia/parte-*.md` |
| Livro (capítulos 1–6 + epílogo) | `livro/capitulo-*.md` + `livro/epilogo.md` |
| Contos (por personagem) | `contos/*.md` |
| Briefings | `koru-ecosystem-briefing.md`, `koru-workflow.md` |

---

## Stack técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Acesso ao sistema de arquivos via Server Components — lê os MDs diretamente sem API. Roteamento baseado em arquivos é natural para a estrutura de seções. |
| UI | **shadcn/ui** | Sidebar collapsible pronta, ScrollArea, Separator, Badge — componentes com controle total sem opinião de estilo. |
| Estilo | **Tailwind CSS 4** (OKLCH) | Tokens de cor já definidos para Korú. Dark mode fixo. |
| Markdown | **next-mdx-remote** | Render de MD como React com suporte a componentes customizados (callouts, tabelas estilizadas). |
| Frontmatter | **gray-matter** | Parse de metadados dos arquivos (título, status, personagem). |
| Tipografia | Instrument Serif + Inter | Já estabelecida no design system. |
| Linguagem | TypeScript | — |

**Por que Next.js 15 e não Vite/React puro:** Server Components permitem ler o sistema de arquivos diretamente no servidor — sem API route, sem estado de fetch. A sidebar é gerada automaticamente a partir dos arquivos existentes.

---

## Design system — paleta Korú

Dark mode fixo. O mundo é interno, iluminado de cima.

| Token | OKLCH | Uso |
|---|---|---|
| `--background` | oklch(0.07 0.008 280) | Fundo principal |
| `--surface` | oklch(0.10 0.006 280) | Sidebar / cards |
| `--border` | oklch(0.18 0.006 280) | Bordas sutis |
| `--foreground` | oklch(0.92 0.012 85) | Texto principal (branco quente) |
| `--muted-foreground` | oklch(0.55 0.01 280) | Labels, navegação inativa |
| `--accent` | oklch(0.65 0.09 290) | Lilás — Bomi Veh — hover / ativo |
| `--gold` | oklch(0.72 0.10 75) | Dourado — Luz Oru — títulos de seção |
| `--blue-cold` | oklch(0.62 0.09 220) | Azul-frio — Azuri / Oruku — badges de status |
| `--primary` | oklch(0.65 0.09 290) | CTA / item selecionado |

**Tipografia:**
- Títulos h1–h2: `font-serif` (Instrument Serif) — 400
- UI / labels / sidebar: `font-sans` (Inter)
- Corpo do texto literário: `font-serif` 1.125rem, line-height 1.85
- Corpo do texto técnico (bíblia): `font-sans` 0.9375rem, line-height 1.7

---

## Estrutura de rotas

```
/                          → Redirect para /biblia/parte-00
/biblia/[parte]            → Render de biblia/parte-XX.md
/livro/[capitulo]          → Render de livro/capitulo-XX.md ou epilogo
/contos/[personagem]       → Render de contos/[personagem].md
/briefing                  → Render de koru-ecosystem-briefing.md
/workflow                  → Render de koru-workflow.md
```

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  [Korú]                                  [dark]      │  ← Header mínimo
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│   SIDEBAR    │         CONTENT AREA                 │
│              │                                       │
│  ▼ Bíblia   │   # Título do documento               │
│    Parte 0  │                                       │
│    Parte 1  │   Conteúdo renderizado em             │
│    ...      │   tipografia editorial Korú           │
│  ▼ Livro    │                                       │
│    Cap. 1   │   Tabelas estilizadas,                │
│    ...      │   callouts para regras,               │
│  ▼ Contos   │   badges de status                   │
│    Amara    │                                       │
│    Oruku    │                                       │
│    ...      │                                       │
│  ─ Briefing │                                       │
│  ─ Workflow │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

**Sidebar:** `shadcn/ui SidebarProvider` + `Sidebar` + `SidebarGroup` por seção. Collapsible por grupo. Item ativo com `--accent`.

**Content:** `ScrollArea` com `max-w-prose mx-auto` + padding generoso. Sem coluna lateral no conteúdo — foco total no texto.

---

## Componentes MDX customizados

Sobrescrever os elementos HTML padrão do render MD:

| Elemento | Tratamento |
|---|---|
| `h1` | Instrument Serif, dourado (`--gold`), tamanho grande |
| `h2` | Instrument Serif, lilás (`--accent`), separador visual |
| `h3` | Inter semibold, `--foreground` |
| `table` | Bordas `--border`, cabeçalho `--surface`, zebra sutil |
| `blockquote` | Borda esquerda `--accent`, fundo `--surface`, itálico |
| `code` | Fundo `--surface`, fonte mono, `--blue-cold` |
| `strong` | `--gold` |

**Callout especial para regras** (as 13 regras da bíblia): bloco com borda `--accent` e ícone — distingue acordos de texto descritivo.

---

## Frontmatter esperado nos MDs

Os arquivos podem ter (opcional):

```yaml
---
title: "Nome legível"
status: "completo" | "draft" | "placeholder"
personagem: "amara"   # apenas contos
parte: 0              # apenas bíblia
---
```

O viewer usa esses metadados para: título na sidebar, badge de status, ordenação.

---

## O que não tem (por design)

- Sem autenticação — viewer local
- Sem editor — os MDs são editados pelo Claude Code / VS Code
- Sem banco de dados — o repositório é a fonte
- Sem deploy obrigatório — roda com `npm run dev`
- Sem páginas públicas — não é site editorial

---

## Próximo passo para implementação

1. `npx create-next-app@latest koru-site --typescript --tailwind --app --no-src-dir`
2. Instalar shadcn: `npx shadcn@latest init`
3. Adicionar componentes: `sidebar`, `scroll-area`, `separator`, `badge`
4. Instalar: `next-mdx-remote gray-matter`
5. Configurar tokens OKLCH no `globals.css`
6. Implementar layout root com `SidebarProvider`
7. Server function para ler e listar MDs do repositório
8. Componentes MDX customizados (tipografia Korú)
