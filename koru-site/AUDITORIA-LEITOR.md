# Auditoria de Features — Experiência do Leitor

Data: 2026-06-12 · Branch: `stage` · Escopo: `koru-site/koru-viewer`

---

## O que o leitor já tem hoje

| Recurso | Estado |
|---|---|
| Navegação anterior/próximo (bíblia, livro, contos) | ✅ |
| Barra de progresso de leitura | ✅ |
| Busca full-text (Cmd+K) | ✅ |
| Modo claro/escuro | ✅ |
| Glossário inline com popover | ✅ |
| Loading skeletons + error boundaries | ✅ |
| Galeria com lightbox e navegação por teclado | ✅ |
| Chat "O Akwu responde" (streaming, anônimo) | ✅ |
| Perguntas ao Mundo (conversas públicas paginadas) | ✅ |
| Skip-link, ARIA, navegação por teclado | ✅ |
| Publicação controlada (published/scheduled/draft) | ✅ |

Contexto importante: o site é **fechado por login** (`proxy.ts` redireciona tudo para `/entrar`). Várias features abaixo mudam de prioridade quando o site abrir ao público.

---

## Features propostas

### Tier 1 — Alto impacto, baixo esforço

1. **Continuar de onde parou** — salvar posição de leitura por documento (localStorage) e exibir um card "Continuar lendo: Capítulo VIII" no topo da home. É a feature de maior retorno para um site de leitura serial.
2. **Sumário lateral (TOC)** — nas partes da bíblia e glossários (docs longos com h2/h3), índice flutuante com scroll-spy. Não se aplica a livro/contos (prosa sem seções).
3. **Ajuste de tipografia** — controle A−/A+ de tamanho de fonte e largura de coluna, persistido. Acessibilidade básica de leitura que hoje não existe.
4. **Tempo estimado de leitura** — "~14 min" no hero de cada capítulo/conto. Cálculo trivial (palavras ÷ 200).
5. **Navegação por teclado entre capítulos** — setas ← → para anterior/próximo, espelhando o DocNav.
6. **Voltar ao topo** — botão flutuante em documentos longos.

### Tier 2 — Alto impacto, médio esforço

7. **Marcadores por leitor** — o site já tem auth Supabase por usuário; bookmarks de capítulo/parte ficam naturais (tabela `bookmarks`, botão no hero, lista no perfil/home).
8. **Modo leitura imersivo** — esconder sidebar e chrome com um toque (tecla F ou botão), só o texto. Combina com a estética do mundo.
9. **Personagens linkados no texto** — o mecanismo do glossário já faz highlight inline; estendê-lo para nomes de personagens apontando para `/personagens/[nome]`.
10. **Timestamps nas mensagens** de `/perguntas-ao-mundo/[id]` — hoje não há cronologia visível na conversa.
11. **Zoom no lightbox da galeria** — imagens detalhadas (character sheets) ficam pequenas no viewport.
12. **Aviso de novo capítulo** — o sistema de publish/scheduled já existe; um badge "novo" nos cards da home (comparando `releaseAt` com última visita) fecha o ciclo.

### Tier 3 — Visão / quando o site abrir ao público

13. **Notas e destaques do leitor** — highlights de trechos salvos por usuário (Supabase).
14. **Linha do tempo interativa das Seis Eras** — a parte-08 da bíblia em formato visual navegável.
15. **Mapa interativo de Ikwe** — geografia da parte-02 como mapa clicável ligando aos lugares do glossário.
16. **Compartilhamento de trechos** — quote cards com identidade visual Korú (relevante só com site público).
17. **TTS/audiobook por capítulo** — leitura em áudio dos capítulos.
18. **SEO de abertura** — quando sair do modo privado: remover o `disallow` do `app/robots.ts`, criar `app/sitemap.ts`, OG images por página e `metadataBase`. Os `generateMetadata()` por página já foram adicionados nesta auditoria.

---

## Dívidas técnicas que afetam o leitor (não corrigidas nesta rodada)

- **Sem rate limiting nos logins** e senha admin fraca em `.env.local` — o `.env.local` está corretamente fora do git, mas a senha curta + ausência de throttle em `api/auth/*` é risco real quando houver mais leitores.
- **CSP permissivo** (`unsafe-eval`, `unsafe-inline` em `next.config.mjs`) — reduz a defesa em profundidade do MDX renderizado.
- **Upload sem validação de MIME** nas rotas de editor (`api/editor/upload`, `api/documents/upload`) — validar extensão/tipo contra whitelist.
- **`lib/characters.ts` hardcoded duplica `characters-db`** — duas fontes de verdade para personagens; consolidar no Supabase.
- **Layout do viewer é client component** — impede SSR pleno das páginas de leitura; o `force-dynamic` é intencional (conteúdo editável sem redeploy), mas o layout poderia ser server component com as partes interativas isoladas.
- **Sem observabilidade** — os erros de API agora são logados (`console.error`), mas em produção valeria integrar Sentry ou similar.

---

## Correções aplicadas nesta rodada (branch stage)

1. **Build estava quebrado** — typecheck falhava em `app/admin/(protected)/homepage/page.tsx` (`JSX.IntrinsicElements` → `React.JSX.IntrinsicElements`). Corrigido; build verde.
2. **Pasta fantasma removida** — `Worldbuilding - Koru/` na raiz era lixo de escritas de agente em caminho errado (versões antigas/inferiores de arquivos reais). Resgatado o único arquivo útil: `app/admin/(protected)/escrever/loading.tsx`.
3. **Metadados por página** — `generateMetadata()` em `/biblia/[parte]`, `/livro/[capitulo]`, `/contos/[personagem]`, `/personagens/[nome]` (título do documento na aba do navegador e histórico).
4. **`app/robots.ts` criado** — bloqueia indexação enquanto o site for privado.
5. **Catches silenciosos agora logam** — `banners`, `card-images`, `gallery`, `characters`, `documents`, `tasks`; e o fallback de `card-images` retornava array onde o contrato é objeto (`images: {}`).
