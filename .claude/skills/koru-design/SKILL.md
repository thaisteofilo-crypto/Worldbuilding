# Skill: Design System Korú

Esta skill define o sistema visual completo do site de Korú.
Ler antes de criar ou modificar qualquer componente do site.

---

## Paleta de cores (OKLCH)

Definidas em `koru-site/app/globals.css`:

| Variável CSS | Valor | Uso |
|---|---|---|
| `--background` | oklch(0.07 0.008 280) | Fundo da página |
| `--surface` | oklch(0.10 0.006 280) | Cards, painéis |
| `--border` | oklch(0.18 0.006 280) | Bordas |
| `--foreground` | oklch(0.92 0.012 85) | Texto principal |
| `--muted-foreground` | oklch(0.55 0.01 280) | Texto secundário |
| `--accent` | oklch(0.65 0.09 290) | Lilás — Bomi Veh |
| `--gold` | oklch(0.72 0.10 75) | Dourado — Oru |
| `--blue-cold` | oklch(0.62 0.09 220) | Azul-frio — Azuri |
| `--primary` | oklch(0.65 0.09 290) | Botão principal |
| `--primary-foreground` | oklch(0.07 0.008 280) | Texto no botão |

**Regra:** dark mode sempre. Nunca adicionar light mode ao site público.

---

## Tipografia

| Classe | Fonte | Uso |
|---|---|---|
| `font-serif` | Instrument Serif | Títulos, conteúdo literário |
| `font-sans` | Inter | UI, labels, navegação, metadados |
| `font-mono` | Monospace | Editor de markdown |

**Escala tipográfica para prosa:**
- `text-xl` (1.125rem) + `leading-[1.85]` para texto literário
- `text-sm` + `tracking-[0.15em]` para labels uppercase

---

## Gradientes atmosféricos (sem imagens reais)

Usar quando não há imagem de arte:

```css
/* Hero */
background: linear-gradient(135deg, oklch(0.07 0.008 280), oklch(0.12 0.015 290), oklch(0.07 0.008 270));

/* Bomi Veh — lilás */
background: linear-gradient(135deg, oklch(0.10 0.008 280), oklch(0.18 0.06 290), oklch(0.10 0.008 280));

/* Oru — dourado */
background: linear-gradient(180deg, oklch(0.18 0.08 75), oklch(0.10 0.008 280));

/* Azuri — azul-frio */
background: linear-gradient(135deg, oklch(0.10 0.008 280), oklch(0.16 0.07 220), oklch(0.10 0.008 280));
```

---

## Componentes padrão

### Hero fullscreen
- Altura: `min-h-screen`
- Imagem de fundo: `object-cover` com overlay `bg-gradient-to-t from-background`
- Título: `font-serif text-6xl md:text-8xl`
- Máximo de texto: estreito, alinhado à esquerda

### Card de personagem
- Aspecto: `aspect-[3/4]` (retrato)
- Nome: `font-serif` abaixo da imagem
- Hover: `border-accent`

### Card de conto / capítulo
- Layout horizontal: título + metadado à direita
- Separado por linha `border-border`
- Hover: `text-accent` no título

### Seção de ambientes
- Grid `md:grid-cols-3`
- Cada célula: `aspect-[4/3]` + label overlay

### Barra de progresso (livro)
- Linha fina `h-px` com fundo `border`
- Preenchimento `accent` animado
- Label: "X de 6 capítulos"

---

## Como adicionar imagens reais

1. Colocar arquivo em `koru-site/public/images/`
2. Usar `next/image` com `fill` e container `relative`
3. Sempre adicionar overlay gradiente para manter legibilidade do texto

```tsx
<div className="relative aspect-[16/9] rounded-xl overflow-hidden">
  <Image
    src="/images/ambientes/akwu.jpg"
    alt="Interior do Akwu com luz dourada descendo do teto"
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
</div>
```

---

## Erros comuns a evitar

- Não usar `tailwind.config.ts` (CSS 4 não usa)
- Não usar `@tailwind base` (usar `@import "tailwindcss"`)
- Não adicionar light mode ao site público
- Não colocar text-shadow excessivo em texto sobre imagem
- Não usar border-radius grande em imagens de personagem (fica artificial)
- Não criar novos componentes em `components/ui/` (são do shadcn, não tocar)
