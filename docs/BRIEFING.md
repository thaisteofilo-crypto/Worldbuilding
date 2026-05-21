# Korú Brand System — Briefing do Projeto

**Versão:** 1.0
**Data:** 2026-05-21
**Autora:** Thais Teofilo

---

## 1. Visão Geral

O **Korú Brand System** é um web app de documentação de marca para o universo criativo Korú — um sistema centralizado que organiza todas as diretrizes visuais, editoriais e de identidade do projeto.

É uma ferramenta para a própria autora (e futuramente colaboradores), não um site público. O objetivo é ter um lugar único e navegável onde todas as decisões de marca estejam registradas de forma acessível, estruturada e consistente.

Diferente do `koru-site/` (viewer de documentos do worldbuilding), o Brand System é focado em **diretrizes de design e linguagem** — não em conteúdo narrativo.

---

## 2. Contexto

### Universo Korú
Korú é um projeto de worldbuilding criativo cuja física é baseada em memória. O universo tem uma bíblia completa (`koru-ecosystem-briefing.md`), capítulos de livro e contos por personagem. A autora é Thais Teofilo.

### O que já existe
- **`koru-site/`** — viewer local de documentos markdown (bíblia, livro, contos). Stack: Next.js 15, shadcn/ui, Tailwind CSS 4 com OKLCH dark-only, next-mdx-remote, TypeScript.
- **`design-system/`** — fonte autoritativa do design system atual do universo Korú (CLAUDE.md como referência).

### Por que um Brand System separado
O `koru-site/` serve para leitura de conteúdo criativo. O Brand System serve para **consulta e manutenção das diretrizes de marca**. São propósitos distintos que justificam interfaces distintas. Unificar os dois criaria acoplamento desnecessário e comprometeria a clareza de cada ferramenta.

---

## 3. Objetivo do Projeto

Criar um web app local que funcione como referência viva de marca do universo Korú:

- Centralizar decisões visuais (cores, tipografia, iconografia, componentes)
- Documentar a voz e o tom editorial
- Registrar regras de uso e misuso (o que fazer e o que não fazer)
- Servir como guia de referência rápida durante a produção de conteúdo

O Brand System é o contrato interno de identidade do universo.

---

## 4. Escopo Atual — Fase 1

**Meta:** scaffold completo com interface funcionando localmente.

### O que será construído

- Estrutura de projeto Next.js com TypeScript
- Sidebar de navegação com seções do brand system
- Área de conteúdo principal com renderização de arquivos MDX
- Roteamento baseado em arquivos (cada seção = um arquivo MDX)
- Estilização com Tailwind CSS e componentes shadcn/ui
- Leitura de arquivos MDX locais via sistema de arquivos (sem banco de dados)

### O que a fase 1 não inclui

- Autenticação ou controle de acesso
- Banco de dados ou storage externo
- Deploy em produção
- Sistema de edição inline
- Busca full-text

---

## 5. Escopo Futuro — Fase 2+

Funcionalidades planejadas para fases posteriores, fora do escopo atual:

| Funcionalidade | Tecnologia | Justificativa |
|---|---|---|
| Banco de dados | Supabase | Persistência de dados, metadados de assets |
| Autenticação | Supabase Auth | Controle de acesso para colaboradores |
| Storage de assets | Supabase Storage | Arquivos de imagem, fontes, ícones |
| Deploy em produção | Vercel | Acesso remoto ao brand system |
| Busca full-text | Supabase ou Algolia | Navegação em base de conteúdo maior |
| Versionamento de diretrizes | A definir | Histórico de mudanças de marca |

Todas as decisões de arquitetura da fase 1 devem ser compatíveis com essa expansão — sem criar dívida técnica que bloqueie a fase 2.

---

## 6. Conteúdo do Brand System

Seções esperadas na interface. Cada seção corresponde a um ou mais arquivos MDX.

### 6.1 Identidade Visual
- Origem e filosofia visual do universo Korú
- Logo e símbolo (uso correto, variações, espaçamento)
- Mood e referências visuais

### 6.2 Cores
- Paleta primária e secundária
- Tokens de cor (com valores OKLCH e hex)
- Usos semânticos (fundo, texto, destaque, erro)
- Exemplos de uso correto e incorreto

### 6.3 Tipografia
- Famílias tipográficas em uso
- Hierarquia (h1–h6, body, caption, label)
- Tamanhos, pesos, entrelinhamento
- Regras de composição tipográfica

### 6.4 Iconografia
- Sistema de ícones adotado
- Tamanhos e pesos disponíveis
- Regras de uso em contexto

### 6.5 Voz e Tom
- Voz da autora (baseado na skill `voz-thais`)
- Tom documental técnico vs. tom narrativo literário
- Regras editoriais (o que escrever, como escrever)
- Exemplos com ✅ correto / ❌ incorreto

### 6.6 Componentes
- Biblioteca de componentes UI do brand system
- Props, variantes e comportamentos
- Código de exemplo para cada componente

### 6.7 Uso e Misuso
- Regras consolidadas do que fazer e não fazer
- Casos de borda documentados
- Referência rápida para produção de conteúdo

---

## 7. Stack Técnica

### Fase 1 (atual)

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Componentes UI | shadcn/ui |
| Estilização | Tailwind CSS 4 |
| Conteúdo | MDX (arquivos locais) |
| Parser MDX | next-mdx-remote ou @next/mdx |
| Deploy | Local (localhost) |

### Fase 2+ (futuro)

| Camada | Tecnologia |
|---|---|
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Deploy | Vercel |

### Decisões de stack já tomadas

- **TypeScript obrigatório** — consistência com o `koru-site/` existente
- **shadcn/ui** — componentes acessíveis, sem lock-in de biblioteca proprietária
- **Tailwind CSS 4** — alinhamento com o design system Korú existente
- **App Router** — padrão Next.js atual, compatível com RSC (React Server Components)
- **MDX** — permite misturar markdown com componentes React no conteúdo

---

## 8. Critérios de Sucesso — Fase 1

A fase 1 está concluída quando:

1. **Interface no navegador** — o app roda em `localhost` sem erros
2. **Sidebar navegável** — todas as seções do brand system aparecem na sidebar e são clicáveis
3. **MDX renderizado** — o conteúdo de cada seção é exibido corretamente na área principal
4. **Roteamento funcionando** — cada seção tem sua própria URL (ex: `/cores`, `/tipografia`)
5. **Responsividade básica** — layout funciona em tela cheia (desktop)
6. **Sem dados hardcoded** — o conteúdo vem de arquivos MDX, não de strings no código

---

## 9. Restrições e Decisões

### O que não fazer agora

- **Não subir para produção** — fase 1 é estritamente local
- **Não implementar autenticação** — sem múltiplos usuários na fase 1
- **Não criar banco de dados** — conteúdo em arquivos MDX é suficiente para fase 1
- **Não unificar com o `koru-site/`** — são projetos com propósitos distintos
- **Não criar sistema de edição inline** — o conteúdo é editado diretamente nos arquivos MDX

### Decisões já tomadas

- O projeto vive em uma pasta separada do repositório (não dentro de `koru-site/`)
- A pasta de conteúdo MDX fica em `content/` dentro do projeto
- Os arquivos de conteúdo seguem a convenção `[secao].mdx`
- O design system Korú (`design-system/CLAUDE.md`) é a fonte autoritativa de tokens visuais

### Dependências externas

- O Brand System lê o design system Korú como referência, mas não o importa diretamente
- Não há dependência de runtime com o `koru-site/`

---

## 10. Próximos Passos

### Imediato (fase 1)

1. Criar scaffold do projeto Next.js com TypeScript e App Router
2. Instalar e configurar shadcn/ui e Tailwind CSS 4
3. Implementar layout base (sidebar + área de conteúdo)
4. Configurar pipeline de leitura e renderização de MDX
5. Criar arquivos MDX de placeholder para cada seção
6. Configurar roteamento dinâmico baseado nos arquivos MDX
7. Estilizar com tokens do design system Korú
8. Validar critérios de sucesso da fase 1

### Médio prazo (fase 2)

1. Definir modelo de dados para assets no Supabase
2. Implementar autenticação básica com Supabase Auth
3. Migrar storage de imagens para Supabase Storage
4. Configurar deploy no Vercel
5. Implementar busca full-text

---

*Este briefing é o documento de referência para o desenvolvimento do Korú Brand System. Qualquer decisão que contradiga este documento deve ser discutida e registrada aqui antes de ser implementada.*
