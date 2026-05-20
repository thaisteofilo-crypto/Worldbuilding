# Skill: Design System Korú

O design system oficial do Korú agora vive em `design-system/` na raiz do projeto.

**Fonte autoritativa:** `design-system/CLAUDE.md` (ler antes de criar ou modificar qualquer componente).

---

## Identidade visual (resumo)

| Item | Valor |
|---|---|
| Primary teal | `#0B717F` |
| Cream background | `#F7F2E6` |
| Dark background | `#091717` |
| Heading font | Instrument Serif |
| Body font | Instrument Sans |
| Mono font | Space Mono |
| Botões | `rounded-full` (pill) |
| Modo | Light + Dark (não é dark-only) |

---

## Stack

React 19 · Vite 8 · TypeScript 6 · Tailwind v4 (sem config file, tokens via `@theme {}` em `src/index.css`) · shadcn/ui com `@base-ui/react` (não Radix) · Storybook 10.4 · Framer Motion 12 · Lucide React · CVA

```
cd design-system
npm run storybook   → http://localhost:6006
npm run dev         → http://localhost:5173
```

## Stage para testar no contexto Korú

Existe um `stage/` na raiz que monta páginas com conteúdo Korú usando os componentes do DS — útil pra validar a aparência antes de migrar o site.

```
cd stage
npm install
npm run dev         → http://localhost:5180
```

Hoje o stage consome o source do DS via alias (`vite.config.ts` → `design-system` aponta para `../design-system/src/index.ts`). Isso porque o `dist/index.js` do DS tem chamadas `require("react")` herdadas de dep CJS — bug do build, ainda a corrigir.

---

## O que está pronto

- 20+ componentes UI (`src/components/ui/`): Button, Badge, Card, GlassCard, Input, Select, Checkbox, Switch, Slider, Tabs, Accordion, Dialog, Sheet, Popover, Tooltip, DropdownMenu, Avatar, Table, Progress, Skeleton, Sonner, etc.
- 7 section blocks (`src/components/sections/`): Hero, Feature, Stats, Pricing, CTA, Testimonial, FAQ — todos com variantes light/dark
- Foundations no Storybook: Colors, Typography, Tokens, Icons (80+ Lucide)
- Tokens HSL para Tailwind em `src/index.css` (light em `:root`, dark em `@media (prefers-color-scheme: dark)`)

---

## Regras críticas

1. **`data-orientation` no base-ui** — usar `data-[orientation=horizontal]:*`, nunca `data-horizontal:*`. Afeta Slider, Separator, Tabs, ScrollArea, ToggleGroup.
2. **Button com `render={<a>}`** exige `nativeButton={false}`.
3. **Select** precisa de `<Label htmlFor>` para acessibilidade.
4. **Tailwind v4 sem config file** — tokens vivem em `@theme {}` dentro de `src/index.css`.
5. **Botões são sempre pill** (`rounded-full`).
6. **Não usar** `#000`, `#fff`, `bg-black`, `bg-white` — sempre tons da marca.

---

## Migração do koru-site

O site `koru-site/koru-viewer/` ainda usa o design system antigo (OKLCH dark-fixo). A migração para o novo sistema (teal + Tailwind v4 + light/dark) está pendente.

Quando migrar:
- Trocar tokens OKLCH em `koru-site/koru-viewer/app/globals.css` pelos tokens HSL do novo design system
- Substituir componentes locais pelos do `design-system/`
- Habilitar light mode (hoje é dark-only no viewer)
- Trocar fonte body (hoje Inter) para Instrument Sans

Detalhes completos: `design-system/CLAUDE.md`.
