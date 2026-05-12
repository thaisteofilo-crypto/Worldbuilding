# Korú Viewer: QA Report + Análise UX/UI

**Data:** 2026-04-16
**Escopo:** Site viewer + admin após batches de melhorias

---

## 1. PERFORMANCE

### Build & Runtime
| Métrica | Status | Nota |
|---|---|---|
| Server start (Turbopack) | 643ms | Excelente |
| Console errors | 0 | Zero erros |
| Failed network requests | 0 | Zero falhas |
| Server errors | 0 | Zero erros |

### Warnings (non-blocking)
| Warning | Quantidade | Impacto | Fix |
|---|---|---|---|
| `Image fill missing sizes` | ~48 ocorrências | LCP/CLS em mobile | Adicionar `sizes` prop em `<Image fill>` na home (card carousel) e hero banner |

### Recomendações de Performance
1. **`sizes` prop em imagens**: Todas as `<Image fill>` devem ter `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"` para otimizar carregamento responsivo
2. **Lazy loading de glossário**: Com 44 termos, o regex de glossário é reconstruído por página. Considerar memoização ou build-time generation
3. **MDX compilation**: Cada página compila MDX no request. Considerar ISR (Incremental Static Regeneration) para pages de bíblia que mudam raramente

---

## 2. ACESSIBILIDADE (WCAG AA)

### Contrast Ratios (Dark Mode)
| Elemento | Foreground | Background | Ratio | Status |
|---|---|---|---|---|
| Body text | oklch(0.93) | oklch(0.07) | ~14:1 | PASS |
| Muted text | oklch(0.62) | oklch(0.07) | ~7.5:1 | PASS |
| Reference text (→) | oklch(0.62 @ 70%) | oklch(0.07) | ~5.2:1 | PASS |
| Border (dark) | oklch(0.30) | oklch(0.07) | ~3.5:1 | PASS (decorativo) |

### Navegação
| Item | Status | Nota |
|---|---|---|
| Skip to content link | PASS | Visível em focus |
| Keyboard navigation | PASS | Tab funciona em sidebar, links, busca |
| Cmd+K search | PASS | Abre modal de busca |
| aria-labels | PASS | Sidebar e nav com labels |
| Focus indicators | PASS | `focus-visible:outline-2` em links |

### Pontos de Atenção
1. **Glossary tooltips**: CSS-only (hover), não acessível via keyboard. Considerar `tabIndex={0}` + `focus-within` para exibir tooltip via tab
2. **Hero banner text**: Títulos longos cortam em mobile ("Ecossistema · O Ciclo da Mem..."), considerar truncamento com tooltip ou quebra de linha
3. **Admin login**: campo sem `autocomplete="current-password"`, browsers não oferecem preenchimento automático

---

## 3. RESPONSIVIDADE

| Viewport | Status | Notas |
|---|---|---|
| Desktop (1440px) | PASS | Sidebar + conteúdo lado a lado |
| Tablet (768px) | PASS | Sidebar colapsável, conteúdo full-width |
| Mobile (375px) | PASS | Sidebar oculta, hamburger menu, conteúdo responsivo |

### Problemas Encontrados
- **Títulos longos no hero mobile**: "Ecossistema · O Ciclo da Memória" é cortado. O formato "Original · Subtítulo" funciona em desktop mas fica apertado em < 400px
- **Tabelas do glossário em mobile**: scroll horizontal funciona mas indicador de scroll não é visível

---

## 4. ANÁLISE UX/UI

### O que funciona bem
1. **Hierarquia de headings**: h2 com borda inferior cria separação visual clara entre seções
2. **Referências sutis**: `→ Ver Parte X` em text-xs não compete com o texto principal
3. **Glossary tooltips**: 44 termos cobrem o vocabulário completo, hover revela definição instantânea
4. **Doc-nav minimalista**: setas + título sem borda é limpo e não distrai
5. **Nomes proprietários**: sidebar com "Regras · Os 13 Acordos" transmite identidade do mundo
6. **Admin simplificado**: greeting + 4 stats é tudo que precisa para um painel de controle
7. **Dark mode**: OKLCH tokens bem calibrados, contrast ratios excelentes

### Oportunidades de Melhoria

#### Alta Prioridade
| # | Melhoria | Impacto | Esforço |
|---|---|---|---|
| 1 | **Breadcrumb com nome proprietário**: atualmente mostra "Ecossistema" no breadcrumb mas sidebar mostra "Ecossistema · O Ciclo da Memória" | Consistência visual | Baixo |
| 2 | **Glossary keyboard accessibility**: tooltips precisam funcionar via Tab, não só hover | Acessibilidade | Médio |
| 3 | **Image sizes prop**: adicionar em todas as `<Image fill>` | Performance LCP | Baixo |
| 4 | **Mobile hero title**: truncar ou quebrar títulos longos graciosamente | Mobile UX | Baixo |

#### Média Prioridade
| # | Melhoria | Impacto | Esforço |
|---|---|---|---|
| 5 | **Table of Contents (TOC)**: sidebar ou floating para páginas longas da bíblia (Parte 01 tem 7+ seções) | Navegação | Médio |
| 6 | **Search preview**: mostrar snippet do resultado, não só título | Descoberta | Médio |
| 7 | **Reading progress bar**: indicador sutil no topo da página para documentos longos | Engajamento | Baixo |
| 8 | **Cross-reference cards**: ao passar o mouse em `→ Ver Parte X`, mostrar preview da seção referenciada | Navegação | Alto |

#### Futuras Features
| # | Feature | Descrição |
|---|---|---|
| 9 | **Mapa interativo de Ikwe**: visualização geográfica clicável com Rimba Ngozi, Orunjó, Bomi-Weh, Jobi-Koro |
| 10 | **Timeline visual**: As Cinco Eras em formato visual horizontal/vertical com eventos marcados |
| 11 | **Diagrama do ciclo de memória**: infográfico interativo mostrando morte → Bomi Veh → Ubomi-chi → Ariku → arquivo |
| 12 | **Character relationship graph**: grafo visual das conexões entre os 7 personagens |
| 13 | **Asa cycle visualization**: representação visual dos 4 Asas (Mwanga → Rimbi → Temu → Nkosi) com cores e estados |
| 14 | **PDF export**: exportar bíblia completa como PDF formatado para impressão |
| 15 | **Modo apresentação**: slideshow das seções da bíblia para pitches e reuniões |
| 16 | **Diff viewer**: comparar versões da bíblia quando elementos são alterados |

---

## 5. DX (Developer Experience)

### Pontos Fortes
- **Turbopack**: HMR rápido, server start < 1s
- **MDX pipeline**: content → sanitize → render pipeline é limpo e previsível
- **OKLCH tokens**: sistema de cor perceptualmente uniforme, fácil de ajustar
- **Glossary system**: adicionar um termo = 1 linha em `lib/glossary.ts`, highlighting automático

### Dívida Técnica
| Item | Severidade | Nota |
|---|---|---|
| Admin page.tsx tinha 1866 linhas | RESOLVIDO | Reduzido para 169 |
| Editor label overrides stale | RESOLVIDO | Filesystem titles agora vencem |
| `onMouseEnter` em server component | RESOLVIDO | Substituído por CSS hover |
| Characters.ts hardcoded | BAIXA | Funciona com fallback de DB, mas dados duplicados |
| Glossary regex rebuild por página | BAIXA | Memoizar se performance degradar |

---

## 6. CHECKLIST FINAL

| Item | Status |
|---|---|
| Zero console errors | PASS |
| Zero server errors | PASS |
| Zero failed requests | PASS |
| Sidebar nomes proprietários | PASS |
| Headings com hierarquia clara | PASS |
| Referências sutis (→) | PASS |
| Doc-nav só setas | PASS |
| Glossário 44 termos | PASS |
| Glass-cards sem border | PASS |
| Dark mode contrast AA | PASS |
| Admin dashboard minimalista | PASS |
| Admin sem "Documentos" | PASS |
| Mobile responsivo | PASS |
| Keyboard navigation | PASS |

---

*Relatório gerado automaticamente. Próximo passo sugerido: implementar melhorias #1-4 (alta prioridade).*
