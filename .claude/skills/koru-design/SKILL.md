# Skill: Design System Korú

Esta skill define o sistema visual completo do site de Korú.
Ler antes de criar ou modificar qualquer componente do site.

---

## Modo dual (light + dark)

O site suporta dois modos via `next-themes` (classe `.dark` no `<html>`):
- **Light** (default): editorial, fundo cinza claro, cards brancos
- **Dark**: atmosférico original, fundo quase preto, cores vibrantes

Toggle de tema no header (viewer) e canto superior direito (home).

---

## Paleta de cores (OKLCH)

Definidas em `koru-site/koru-viewer/app/globals.css`:

### Light mode (`:root`)

| Variável CSS | Valor | Uso |
|---|---|---|
| `--background` | oklch(0.93 0.006 280) | Fundo da página |
| `--surface` | oklch(0.88 0.008 280) | Áreas de placeholder, surface |
| `--foreground` | oklch(0.15 0.01 280) | Texto principal |
| `--card` | oklch(1.00 0 0) | Cards (branco puro) |
| `--border` | oklch(0.75 0.01 280) | Bordas |
| `--muted-foreground` | oklch(0.40 0.01 280) | Texto secundário |
| `--accent` | oklch(0.40 0.12 290) | Lilás — Bomi Veh |
| `--gold` | oklch(0.48 0.12 65) | Dourado — Oru |
| `--blue-cold` | oklch(0.42 0.10 230) | Azul-frio — Azuri |
| `--primary` | oklch(0.40 0.12 290) | Botão principal |

### Dark mode (`.dark`)

| Variável CSS | Valor | Uso |
|---|---|---|
| `--background` | oklch(0.07 0.008 280) | Fundo da página |
| `--surface` | oklch(0.10 0.006 280) | Cards, painéis |
| `--foreground` | oklch(0.92 0.012 85) | Texto principal |
| `--border` | oklch(0.18 0.006 280) | Bordas |
| `--muted-foreground` | oklch(0.55 0.01 280) | Texto secundário |
| `--accent` | oklch(0.65 0.09 290) | Lilás — Bomi Veh |
| `--gold` | oklch(0.72 0.10 75) | Dourado — Oru |
| `--blue-cold` | oklch(0.62 0.09 220) | Azul-frio — Azuri |
| `--primary` | oklch(0.65 0.09 290) | Botão principal |

---

## Tipografia

| Classe | Fonte | Uso |
|---|---|---|
| `font-serif` | Instrument Serif | Títulos, headings |
| `font-sans` | Inter | UI, labels, navegação, texto de leitura (contos/livro) |

**Regra:** contos e livro usam `font-sans` para facilitar leitura. Títulos sempre `font-serif`.

---

## Glassmorfismo

Duas classes utilitárias:

```css
.glass       /* Header, overlays — blur + translúcido */
.glass-card  /* Cards — branco sólido com sombra (light) ou escuro sólido (dark) */
```

**Light:** fundo branco opaco `oklch(1.00)`, borda `oklch(0.80)`, sombra suave
**Dark:** fundo escuro `oklch(0.16)`, borda `oklch(0.25)`, sombra forte

---

## Gradientes atmosféricos por seção

Cada seção da home tem gradiente próprio (light e dark separados com `dark:hidden` / `hidden dark:block`):

```css
/* Personagens — lilás */
Light: linear-gradient(160deg, oklch(0.88 0.04 290), oklch(0.92 0.02 310))
Dark:  linear-gradient(160deg, oklch(0.10 0.02 290), oklch(0.13 0.03 310))

/* Bíblia — dourado */
Light: linear-gradient(160deg, oklch(0.90 0.05 75), oklch(0.88 0.04 60))
Dark:  linear-gradient(160deg, oklch(0.12 0.04 75), oklch(0.10 0.03 60))

/* Livro — azul-frio */
Light: linear-gradient(160deg, oklch(0.88 0.05 220), oklch(0.92 0.03 240))
Dark:  linear-gradient(160deg, oklch(0.10 0.04 220), oklch(0.12 0.03 240))

/* Contos — lilás profundo */
Light: linear-gradient(160deg, oklch(0.87 0.05 290), oklch(0.90 0.04 310))
Dark:  linear-gradient(160deg, oklch(0.10 0.04 290), oklch(0.12 0.03 310))

/* Referências — dourado suave */
Light: linear-gradient(160deg, oklch(0.90 0.04 60), oklch(0.88 0.05 80))
Dark:  linear-gradient(160deg, oklch(0.12 0.04 60), oklch(0.10 0.03 80))
```

---

## Componentes padrão

### Hero (home)
- Altura: `min-h-screen`, centralizado
- Título: `font-serif`, `clamp(6rem, 18vw, 14rem)`
- Botões: `rounded-full` (pill), preto sólido + glass-card

### Card vertical (personagem, referência, livro, conto)
- Classe: `glass-card rounded-xl`
- Área de imagem: `aspect-ratio: 3/4` (personagens), `4/3` (bíblia), `2/3` (referências)
- Texto: `p-3`, nome em `font-serif`, label em `font-sans text-xs`
- Hover: `hover:scale-[1.02]`

### Seção full-screen (home)
- `min-h-screen flex flex-col justify-center`
- Gradiente de fundo dual-mode
- Título: `font-serif text-5xl md:text-6xl`
- Label: `text-xs uppercase tracking-[0.25em]`

### Card de informação (personagem detail)
- Classe: `glass-card rounded-xl p-5`
- Label colorida em `text-xs uppercase tracking-[0.15em]`

### Sidebar (viewer)
- Sem separadores visuais entre grupos
- Labels de grupo coloridas: gold (bíblia), accent (livro), blue-cold (contos)

### Header (viewer)
- Classe: `glass sticky top-0`
- Contém: sidebar trigger, breadcrumb, theme toggle

### Botões
- Primário: `rounded-full`, fundo `--foreground`, cor `--background`
- Secundário: `rounded-full glass-card`

---

## Imagens

### Personagens (página de detalhe)
- 3 imagens grandes: frente, perfil, costas
- Aspecto: `16/9`, `rounded-xl`
- Arquivo: `public/images/personagens/{nome}-{frente|perfil|costas}.{jpg|png|webp}`
- Placeholder: ícone SVG de imagem centralizado

### Banners (home)
- Gradientes atmosféricos (substituíveis por imagens)
- Arquivo: `public/images/banners/{secao}.{jpg|png|webp}`

---

## Admin

- Acesso: ícone de engrenagem na home (canto superior direito)
- Autenticação: Supabase auth (email/senha) via `/admin/login`
- Rotas protegidas: `app/admin/(protected)/`
- Login público: `app/admin/login/`

---

## Erros comuns a evitar

- Não usar `tailwind.config.ts` (Tailwind CSS 4 não usa)
- Não usar `@tailwind base` (usar `@import "tailwindcss"`)
- Não usar `rounded-sm` em cards (usar `rounded-xl`)
- Não usar bordas/linhas divisórias entre seções (visual fluido)
- Não usar `font-serif` para texto corrido de leitura (usar `font-sans`)
- Não criar novos componentes em `components/ui/` (são do shadcn, não tocar)
- Garantir que gradientes tenham versão light E dark (`dark:hidden` + `hidden dark:block`)
