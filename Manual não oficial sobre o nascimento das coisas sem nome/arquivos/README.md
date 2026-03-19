# MythQuill Studio

Portabilidade do dashboard "O Entre" para Next.js App Router.

## Como Rodar
1. Certifique-se de ter Node.js instalado.
2. Na raiz do projeto, execute:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse `http://localhost:3000`.

## Estrutura de Pastas
- `/app`: Roteamento e layouts.
- `/components/studio`: Componentes específicos do dashboard.
- `/components/ui`: Componentes de UI atômicos (RainbowButton, PromptBox).
- `/lib`: Utilitários, storage e tipos.

## Checklist de Aceitação (Migração A-D)
- [x] **A) Referências**: Tabs e expand/collapse funcionando.
- [x] **B) Estrutura**: CRUD completo com auto-save e Dots.
- [x] **C) Personagens**: CRUD completo, link com capítulos e sincronização em tempo real.
- [x] **D) Indicador de salvo**: Feedback visual de salvamento.
