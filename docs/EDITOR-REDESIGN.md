# EDITOR-REDESIGN — Briefing Técnico

**Projeto:** koru-site / koru-viewer  
**Data:** 2026-05-21  
**Status:** Planejamento

---

## 1. Visão geral

### O que muda

| Área | Estado atual | Estado novo |
|---|---|---|
| Painel de IA | Chat flutuante sobreposto ao editor (`chat-panel.tsx`, ~1100 linhas) | Coluna lateral fixa, sempre visível |
| Resposta da IA | Texto markdown livre em bolhas de chat | Blocos tipados (trecho / anotação / pergunta / consistência) |
| Aceitar/Rejeitar | Clique insere no cursor sem prévia; sem diff visual | Diff inline no editor: original em vermelho, sugestão em verde |
| Contexto da IA | Bíblia inteira carregada em bloco único (`loadBible()` até 80k chars) | Seções selecionáveis, injeção parcial e dinâmica |
| Layout | 2 colunas: sidebar + editor | 3 colunas: sidebar + editor + painel IA |
| Visual | Inline styles densos, `var(--card)` como fundo do editor | Área de escrita em `bg-white`/`bg-black`, tipografia Instrument Serif 18px+ |
| Modo foco | Oculta sidebar, mantém chat flutuante | Oculta sidebar + painel IA, editor centrado em 680px |

### O que fica

- Stack: Next.js 15 App Router, TipTap + `@tiptap/markdown`, Supabase, GitHub API
- Rota: `app/admin/(protected)/editor/page.tsx`
- API de salvar: `app/api/editor/route.ts` (GET + PUT, sem mudança)
- API de IA: `app/api/chat/route.ts` — muda o formato de resposta (Fase 4)
- Autosave, publicação, sidebar de documentos, outline/TOC, modo foco
- Tipografia: Instrument Serif / Instrument Sans (já no DS Iara)

---

## 2. Diagrama de layout

### Layout padrão (3 colunas)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Voltar]  [Escrever] [Reescrever] [Expandir] [Feedback] [Consistência] ○  │
│  ← toolbar topo slim: var(--card), border-bottom, h=44px                    │
├─────────────────┬────────────────────────────────────┬───────────────────────┤
│                 │                                    │                       │
│   SIDEBAR       │        EDITOR TipTap               │   PAINEL IA           │
│   w=232px       │        flex-1                      │   w=300px             │
│   bg=var(--card)│        bg=white / bg=black         │   bg=var(--card)      │
│   overflow-y    │        overflow-y-auto              │   overflow-y          │
│                 │        max-w=680px centrado         │                       │
│  ▾ Bíblia       │                                    │  ┌─────────────────┐  │
│    Parte 00     │   # Título do documento             │  │ ✦ Sugestão      │  │
│    Parte 01     │                                    │  │ type: trecho    │  │
│    ...          │   Lorem ipsum dolor sit amet,      │  │                 │  │
│  ▾ Livro        │   consectetur adipiscing elit.     │  │ [texto antigo]  │  │
│    Cap I        │                                    │  │ ──── diff ───── │  │
│    Cap II       │   ░░░░░░░░░░░░ ← original         │  │ [texto novo]    │  │
│    ...          │   ▓▓▓▓▓▓▓▓▓▓▓▓ ← sugestão         │  │                 │  │
│  ▾ Contos       │   [✓ Aceitar] [✗ Rejeitar]         │  │ [✓ Aceitar]     │  │
│    Amara        │   ← diff overlay ancorado          │  │ [✗ Rejeitar]    │  │
│    Oruku        │                                    │  └─────────────────┘  │
│    ...          │   Lorem ipsum continuação...       │                       │
│                 │                                    │  ┌─────────────────┐  │
│  ── Estrutura ──│                                    │  │ 📎 Anotação     │  │
│    H1 Título    │                                    │  │ type: anotacao  │  │
│    H2 Seção     │                                    │  │ ↳ âncora trecho │  │
│    H3 Sub       │                                    │  └─────────────────┘  │
│                 │                                    │                       │
│                 │                                    │  ┌─────────────────┐  │
│                 │                                    │  │ ? Pergunta      │  │
│                 │                                    │  │ type: pergunta  │  │
│                 │                                    │  └─────────────────┘  │
│                 │                                    │                       │
│                 │                                    │  ── Histórico ──────  │
│                 │                                    │  ▸ Sugestões anteriores│
│                 │                                    │                       │
│                 │                                    │  ── Contexto ativo ── │
│                 │                                    │  ☑ Parte 03 Cosmologia│
│                 │                                    │  ☑ Parte 04 Criaturas │
│                 │                                    │  ☐ Parte 01 Física    │
│                 │                                    │                       │
│                 │                                    │  [input de prompt   ] │
│                 │                                    │  [Enviar ↵          ] │
└─────────────────┴────────────────────────────────────┴───────────────────────┘
```

### Modo foco

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Nome do documento · 3.421 palavras · 17 min · +142  [Esc]                  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          # Título                                            │
│                                                                              │
│                          Lorem ipsum...                                      │
│                                                                              │
│                          ← editor centrado, max-w=680px                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Sidebar e painel IA são ocultados completamente. Ativado pelo botão "Foco" na toolbar.

---

## 3. Componentes novos a criar

### 3.1 `SuggestionPanel`

**Arquivo:** `components/admin/suggestion-panel.tsx`

Substitui o `ChatPanel` como interface principal de IA. Não é flutuante: é coluna fixa da direita.

**Props:**

```typescript
interface SuggestionPanelProps {
  documentPath: string | null
  documentContent: string
  selectedText: string
  onApplySuggestion: (suggestion: AISuggestion) => void
  onRejectSuggestion: (id: string) => void
}
```

**Estado interno:**
- `suggestions: AISuggestion[]` — lista de blocos da sessão atual
- `history: AISuggestion[]` — blocos anteriores, colapsável
- `prompt: string` — input do usuário
- `isLoading: boolean`
- `activeContext: string[]` — IDs das seções da bíblia ativas

**Estrutura visual:**

```
┌─────────────────────────────────────────┐
│  ✦ Assistente Korú              [•••]   │  ← header com menu
├─────────────────────────────────────────┤
│  [lista de SuggestionBlock]             │  ← scrollável
│                                         │
│  ▸ Histórico (N sugestões)             │  ← colapsável
├─────────────────────────────────────────┤
│  ─── Contexto ativo ───                 │
│  [AIContextSelector]                    │
├─────────────────────────────────────────┤
│  [________________________] [Enviar ↵]  │  ← input fixo no rodapé
└─────────────────────────────────────────┘
```

---

### 3.2 `SuggestionBlock`

**Arquivo:** `components/admin/suggestion-block.tsx`

Bloco tipado de resposta da IA. Cada sugestão da IA gera um ou mais blocos.

**Tipo base:**

```typescript
type SuggestionType = 'trecho' | 'anotacao' | 'pergunta' | 'consistencia'

interface AISuggestion {
  id: string
  type: SuggestionType
  content: string          // texto da sugestão
  originalText?: string    // texto original (só em type='trecho' com diff)
  anchor?: string          // trecho do doc ao qual a anotação se refere
  bibliaRef?: string       // path da parte da bíblia (só em type='consistencia')
  timestamp: number
  status: 'pending' | 'accepted' | 'rejected'
}
```

**Variantes visuais:**

| type | Ícone | Cor de borda | Ação principal |
|---|---|---|---|
| `trecho` | ✦ | `--color-iara` (teal) | Aceitar / Rejeitar |
| `anotacao` | 📎 | `--color-gray-300` | Lida / Descartada |
| `pergunta` | ? | `--color-mel` (dourado) | Responder (abre prompt) |
| `consistencia` | ⚠ | `--color-jambo` (vermelho) | Ver na bíblia / Corrigir |

**Props:**

```typescript
interface SuggestionBlockProps {
  suggestion: AISuggestion
  onAccept: (id: string) => void
  onReject: (id: string) => void
  onViewBiblia?: (path: string) => void
}
```

---

### 3.3 `DiffOverlay`

**Arquivo:** `components/admin/diff-overlay.tsx` (ou extensão TipTap)

Exibe o diff diretamente na área de escrita do TipTap quando a IA sugere substituir um trecho selecionado.

**Comportamento:**

1. A autora seleciona texto e aciona "Reescrever" (ou o painel IA retorna um `type: 'trecho'` com `originalText`)
2. O texto original recebe `mark` com classe `diff-removed` (fundo vermelho-translúcido)
3. O texto sugerido é inserido como `mark` com classe `diff-added` (fundo verde-translúcido) logo após
4. Botões `✓ Aceitar` e `✗ Rejeitar` aparecem posicionados absolutamente no início do diff (via `decorations` do ProseMirror)
5. Aceitar: remove o mark `diff-removed`, limpa o mark `diff-added`, texto novo fica clean
6. Rejeitar: remove ambos os marks, texto original volta limpo

**Implementação técnica:**

- Extensão TipTap customizada: `DiffMark` com dois atributos — `type: 'removed' | 'added'` e `diffId: string`
- Plugin ProseMirror de `decorations` para renderizar os botões Aceitar/Rejeitar no DOM
- CSS via `globals.css`:

```css
.diff-removed {
  background: color-mix(in oklch, oklch(0.55 0.2 25) 20%, transparent);
  text-decoration: line-through;
  text-decoration-color: oklch(0.55 0.2 25 / 0.5);
}

.diff-added {
  background: color-mix(in oklch, oklch(0.6 0.15 145) 18%, transparent);
}
```

**Interface exportada:**

```typescript
interface DiffOverlayRef {
  applyDiff: (originalText: string, suggestedText: string) => string  // retorna diffId
  acceptDiff: (diffId: string) => void
  rejectDiff: (diffId: string) => void
  hasDiff: () => boolean
}
```

---

### 3.4 `AIContextSelector`

**Arquivo:** `components/admin/ai-context-selector.tsx`

Painel de contexto da bíblia no rodapé do `SuggestionPanel`. Detecta automaticamente quais partes são relevantes para o documento aberto e permite ativar/desativar manualmente.

**Mapeamento automático documento → partes da bíblia:**

```typescript
const DOC_TO_BIBLIA_MAP: Record<string, string[]> = {
  // Livro: usa cosmologia, criaturas, Temiku
  'livro/': ['biblia/parte-03.md', 'biblia/parte-04.md', 'biblia/parte-05.md'],
  // Contos individuais: usa a parte do personagem + cosmologia
  'contos/conto-temiku.md': ['biblia/parte-05.md', 'biblia/parte-03.md'],
  'contos/conto-amara.md':  ['biblia/parte-04.md', 'biblia/parte-03.md'],
  'contos/conto-oruku.md':  ['biblia/parte-05.md', 'biblia/parte-04.md'],
  // Bíblia: usa a própria parte + parte-00 (fundamentos)
  'biblia/': ['biblia/parte-00.md'],
}
```

**Props:**

```typescript
interface AIContextSelectorProps {
  documentPath: string | null
  activeContext: string[]
  onChange: (active: string[]) => void
}
```

**Visual:**

```
── Contexto ativo ─────────────────
☑  Parte 03 — Cosmologia
☑  Parte 04 — Criaturas
☐  Parte 01 — Física do Akwu
☐  Parte 00 — Fundamentos
[+ Adicionar seção]
```

Cada item tem checkbox. Seções ativas são carregadas e injetadas no prompt da IA. O estado persiste em `localStorage` por `documentPath`.

---

## 4. Componentes existentes que mudam

### 4.1 `chat-panel.tsx` → substituído

**Arquivo:** `components/admin/chat-panel.tsx`

O componente inteiro (1100 linhas) é substituído pelo `SuggestionPanel`. O que deve ser preservado/migrado:

- Lógica de `loadHistory` / `saveHistory` / `archiveSession` → migrada para hook `useAIHistory`
- Renderizador de markdown seguro (`renderMarkdownSafe`, `renderInline`, `parseTableMarkdown`) → extraído para `lib/render-markdown.tsx` (reutilizável)
- Modos de IA (`correct`, `feedback`, `consistency`, `report`, `expand`, `describe`, `continue`, `rewrite`) → mantidos na API, expostos como ações no `SuggestionPanel`

O `ChatPanel` e `ChatToggleButton` são removidos da `editor/page.tsx`. O botão flutuante some.

**Nota de migração:** o arquivo pode ser mantido temporariamente durante a Fase 1 enquanto o `SuggestionPanel` não está funcional. Remover apenas na Fase 2.

---

### 4.2 `editor/page.tsx` → novo layout 3 colunas

**Arquivo:** `app/admin/(protected)/editor/page.tsx` (1841 linhas → reduzir)

**Mudanças estruturais:**

1. Remover imports de `ChatPanel` e `ChatToggleButton`
2. Adicionar import de `SuggestionPanel`
3. Substituir o estado `showChat: boolean` por `suggestionPanelVisible: boolean` (padrão: `true`)
4. Novo layout JSX — substituir o `<div className="flex flex-1 gap-3">` por estrutura de 3 colunas:

```tsx
<div className="flex flex-1 min-h-0">
  {/* Col 1: Sidebar */}
  <Sidebar ... />

  {/* Col 2: Editor */}
  <main className="flex-1 flex flex-col min-h-0 min-w-0 bg-white dark:bg-black">
    <EditorToolbar ... />
    <RichEditor ref={richEditorRef} ... />
  </main>

  {/* Col 3: Painel IA */}
  {!focusMode && (
    <SuggestionPanel
      documentPath={selectedPath}
      documentContent={content}
      selectedText={editorSelection}
      onApplySuggestion={handleApplySuggestion}
      onRejectSuggestion={handleRejectSuggestion}
    />
  )}
</div>
```

5. Extrair a toolbar de formatação do TipTap para componente `EditorToolbar` (reduz linhas na page)
6. Handler `handleApplySuggestion` substitui `handleInsertText` / `handleAcceptSuggestion`:

```typescript
function handleApplySuggestion(suggestion: AISuggestion) {
  if (suggestion.type === 'trecho' && suggestion.originalText) {
    // Ativa DiffOverlay no editor
    richEditorRef.current?.diff.applyDiff(suggestion.originalText, suggestion.content)
  } else {
    // Insere no cursor (comportamento atual)
    handleInsertText(suggestion.content)
  }
}
```

---

### 4.3 `rich-editor.tsx` → extensão DiffOverlay

**Arquivo:** `components/admin/rich-editor.tsx`

**Mudanças:**

1. Adicionar extensão `DiffMark` ao array de extensões do TipTap:

```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Markdown,
    Table, TableRow, TableHeader, TableCell,
    DiffMark,  // nova extensão
  ],
  ...
})
```

2. Expor `diff` no `RichEditorRef`:

```typescript
export interface RichEditorRef {
  editor: Editor | null
  diff: DiffOverlayRef  // nova
}
```

3. A implementação da extensão `DiffMark` fica em `lib/tiptap/diff-mark.ts`

---

## 5. API da IA — mudanças necessárias

### 5.1 Endpoint atual

`POST /api/chat` — recebe `{ messages, documentPath, documentContent, mode, responseMode }`, retorna SSE streaming de texto livre.

O endpoint **não muda de assinatura** nas Fases 1-3. A mudança de formato é adicionada na Fase 4.

### 5.2 Novo parâmetro: `contextSections`

A partir da Fase 3, o endpoint recebe a lista de seções ativas:

```typescript
// Request body (Fase 3+)
{
  messages: Message[]
  documentPath: string
  documentContent: string
  mode: string | null
  responseMode: 'concise' | 'detailed' | null
  contextSections: string[]  // NOVO: ex: ['biblia/parte-03.md', 'biblia/parte-04.md']
}
```

Em `buildSystemPrompt`, a lógica de `loadBible()` é substituída por `loadBibleSections(contextSections)`:

```typescript
function loadBibleSections(sections: string[]): string {
  return sections
    .map((path) => {
      const abs = resolve(REPO_ROOT, path)
      if (!existsSync(abs)) return ''
      return `\n\n--- ${path} ---\n${readFileSync(abs, 'utf-8').slice(0, 20000)}`
    })
    .join('')
}
```

Isso reduz o payload de contexto de até 80k chars (bíblia inteira) para 20-40k chars (apenas seções relevantes).

### 5.3 Novo formato de resposta (Fase 4)

Novo modo `mode: 'structured'` retorna JSON em vez de texto streaming:

```typescript
// Response — modo structured
{
  suggestions: AISuggestion[]
}

// Cada sugestão segue o tipo definido em 3.2
```

O modelo é instruído no system prompt a responder em JSON quando `mode === 'structured'`:

```
Quando o modo for 'structured', responda APENAS com JSON válido no formato:
{
  "suggestions": [
    {
      "type": "trecho",
      "content": "texto sugerido",
      "originalText": "texto original (se houver)",
      "anchor": null,
      "bibliaRef": null
    },
    {
      "type": "consistencia",
      "content": "Onkweri descritos com mãos — morfologia incorreta.",
      "anchor": "Ela colocou a palma na parede.",
      "bibliaRef": "biblia/parte-03.md"
    }
  ]
}
```

**Modo structured não usa streaming.** O endpoint retorna `Response` com `Content-Type: application/json` diretamente.

Os modos existentes (`correct`, `feedback`, `consistency`, `report`, `expand`, `describe`, `continue`, `rewrite`) continuam funcionando com streaming, sem mudança para compatibilidade durante a migração.

---

## 6. Tokens visuais (DS Iara)

| Área | Light | Dark | Token |
|---|---|---|---|
| Área de escrita (editor) | `#ffffff` | `#000000` / `#101010` | `bg-white` / `bg-[var(--color-gray-950)]` |
| Sidebar | `#F2F2F2` | `#040E0F` | `bg-[var(--color-gray-50)]` / `bg-[var(--color-una)]` |
| Painel IA | `#F2F2F2` | `#0B363C` | `bg-[var(--color-gray-50)]` / `bg-[var(--color-ibu)]` |
| Toolbar | `var(--card)` | `var(--card)` | padrão do DS |
| Acento primário | `#0B6377` | `#0B6377` | `--color-iara` |
| Diff removido | `oklch(0.55 0.2 25 / 0.2)` | idem | inline no CSS |
| Diff adicionado | `oklch(0.6 0.15 145 / 0.18)` | idem | inline no CSS |

**Tipografia na área de escrita:**

```css
.tiptap-editor-content {
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 18px;
  line-height: 1.75;
  max-width: 680px;
  margin: 0 auto;
}
```

---

## 7. Fases de implementação

### Fase 1 — Layout 3 colunas + SuggestionPanel com UI

**Objetivo:** O novo layout visual existe, mas o painel IA ainda não chama a API.

**Escopo:**

- Criar `SuggestionPanel` com layout estático (sem chamada de IA)
- Criar `SuggestionBlock` com as 4 variantes visuais
- Criar `AIContextSelector` com mapeamento hardcoded
- Atualizar `editor/page.tsx`: layout 3 colunas, remover `ChatToggleButton`
- Manter `ChatPanel` intacto (não deletar ainda)
- Ajuste visual da área de escrita: `bg-white`/`bg-black`, Instrument Serif 18px

**Critério de conclusão:** o editor abre com 3 colunas, o painel IA exibe UI correta sem erro, o chat antigo sumiu da tela.

---

### Fase 2 — DiffOverlay + aceitar/rejeitar

**Objetivo:** O diff funciona no TipTap. O fluxo aceitar/rejeitar é visual.

**Escopo:**

- Criar `lib/tiptap/diff-mark.ts` (extensão TipTap)
- Criar `DiffOverlay` lógica + plugin ProseMirror para botões
- Atualizar `RichEditorRef` para expor `diff`
- Atualizar `editor/page.tsx`: handler `handleApplySuggestion`
- Testar: selecionar texto → acionar reescrita → diff aparece → aceitar/rejeitar funciona
- Remover `ChatPanel` e `ChatToggleButton` definitivamente

**Critério de conclusão:** diff visual funcional para texto de substituição; texto sem diff funciona como antes.

---

### Fase 3 — Contexto da bíblia + injeção no prompt

**Objetivo:** A IA recebe apenas as seções da bíblia relevantes, não o arquivo inteiro.

**Escopo:**

- Adicionar `contextSections` ao body do POST em `SuggestionPanel`
- Atualizar `app/api/chat/route.ts`: novo parâmetro `contextSections`, lógica `loadBibleSections`
- `AIContextSelector` passa a carregar e persistir o estado por documento
- Testar: verificar que o payload de contexto diminuiu, qualidade de resposta mantida

**Critério de conclusão:** chamada com `contextSections` populado retorna resposta correta da IA.

---

### Fase 4 — Respostas estruturadas da IA

**Objetivo:** A IA retorna `AISuggestion[]` em vez de texto livre; o painel exibe blocos tipados.

**Escopo:**

- Adicionar `mode: 'structured'` ao endpoint `app/api/chat/route.ts`
- System prompt com instrução de resposta em JSON
- `SuggestionPanel`: conectar ao endpoint, parsear resposta, popular `suggestions[]`
- `SuggestionBlock` ganha botões funcionais que chamam `onApplySuggestion` / `onRejectSuggestion`
- Histórico colapsável: sugestões da sessão movidas para `history[]`
- Testar cada `type`: trecho (com e sem diff), anotação, pergunta, consistência

**Critério de conclusão:** prompt enviado no painel IA → blocos tipados aparecem → aceitar funciona → diff visual ativado para type=trecho.

---

## 8. Checklist de entrega por fase

### Fase 1

- [ ] `components/admin/suggestion-panel.tsx` criado
- [ ] `components/admin/suggestion-block.tsx` criado (4 variantes)
- [ ] `components/admin/ai-context-selector.tsx` criado
- [ ] `editor/page.tsx` atualizado: layout 3 colunas
- [ ] Área de escrita com Instrument Serif 18px
- [ ] Sidebar: tokens corretos light/dark
- [ ] Painel IA: tokens corretos light/dark
- [ ] Modo foco: oculta painel IA
- [ ] Build sem erros de TypeScript

### Fase 2

- [ ] `lib/tiptap/diff-mark.ts` criado
- [ ] Plugin ProseMirror para botões de diff funcionando
- [ ] `RichEditorRef` exporta `diff: DiffOverlayRef`
- [ ] `editor/page.tsx`: handler `handleApplySuggestion` implementado
- [ ] `chat-panel.tsx` removido (ou marcado como deprecated)
- [ ] CSS `.diff-removed` / `.diff-added` em `globals.css`
- [ ] Teste manual: selecionar → reescrever → aceitar → texto atualizado
- [ ] Teste manual: selecionar → reescrever → rejeitar → texto original restaurado

### Fase 3

- [ ] `app/api/chat/route.ts`: parâmetro `contextSections` aceito
- [ ] `loadBibleSections()` implementada em `route.ts`
- [ ] `SuggestionPanel`: envia `contextSections` no POST
- [ ] `AIContextSelector`: estado persistido por `documentPath` em `localStorage`
- [ ] Mapeamento `DOC_TO_BIBLIA_MAP` coberto para livro/ e contos/ principais
- [ ] Teste: payload de contexto confirmado no Network tab do browser

### Fase 4

- [ ] `mode: 'structured'` aceito pelo endpoint
- [ ] System prompt instrui resposta em JSON
- [ ] Parser de `AISuggestion[]` no `SuggestionPanel` (com fallback para erro de parse)
- [ ] `SuggestionBlock` com botões funcionais
- [ ] Histórico colapsável funcionando
- [ ] type=trecho ativa DiffOverlay automaticamente quando `originalText` presente
- [ ] type=consistencia exibe link para `bibliaRef`
- [ ] type=pergunta abre input de prompt com contexto pré-preenchido
- [ ] Teste E2E: abrir livro/capitulo-01 → enviar prompt → blocos aparecem → aceitar trecho → diff visual

---

## 9. Decisões pendentes

**Para validar antes de iniciar:**

1. **Largura do painel IA:** 300px fixo ou redimensionável via drag?  
   _Recomendação: 300px fixo na Fase 1, resize na Fase 4 se necessário._

2. **O painel IA aparece mesmo sem documento aberto?**  
   _Recomendação: Sim, mas com estado vazio e input desabilitado._

3. **Histórico de sugestões: por sessão ou por documento?**  
   _Atual: o chat persiste por `documentPath`. Manter o mesmo critério para sugestões._

4. **Modos da toolbar (Escrever, Reescrever, Expandir, Feedback):** chamam a IA diretamente e populam o painel, ou abrem o painel esperando input?  
   _Recomendação: chamam diretamente (comportamento atual preservado), resultado aparece como `SuggestionBlock` no painel._

5. **`DiffOverlay` no painel vs. no editor:** os botões Aceitar/Rejeitar ficam no painel IA (`SuggestionBlock`) ou ancorados no editor (ProseMirror decoration)?  
   _Recomendação: ambos. O bloco no painel tem os botões; o editor mostra os decorations visuais (marcação de cor) mas sem botões para não poluir a área de escrita._
