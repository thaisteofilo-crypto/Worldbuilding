---
name: publicar
description: Use esta skill quando o usuário disser "publica", "comita e push", "publica isso", "manda pro git", "sobe pro github", ou /publicar. Invoca o agente koru-publisher que comita e faz push das mudanças do projeto de forma estruturada (escopo, mensagem em português, pull rebase antes do push, sem --force).
---

# Skill: publicar

Esta skill aciona o agente `koru-publisher` para commitar e publicar as mudanças atuais no repositório GitHub.

## O que ela faz

1. Verifica `git status`: se limpo, reporta e para
2. Detecta escopo das mudanças (livro / biblia / contos / site / config / docs / multi)
3. Gera mensagem de commit em português no padrão do projeto
4. Faz `git fetch` + `git pull --rebase origin main`
5. Faz `git push origin main`
6. Reporta hash, título e status

## Quando invocar

- Usuário diz: "publica", "comita", "comita e push", "manda pro git", "sobe", "sobe pro github"
- Usuário usa `/publicar` ou `/publicar <mensagem custom>`
- No final de uma sessão de escrita longa, antes de fechar o trabalho

## Como invocar

Use o tool `Agent` com:
- `subagent_type: "general-purpose"` (ou `koru-publisher` se aparecer na lista de agentes disponíveis no system prompt)
- `description: "Publicar mudanças no GitHub"`
- `prompt`: instrua o agente a seguir as regras de `.claude/agents/koru-publisher.md`. Se houver mensagem custom (após `/publicar mensagem aqui`), passe-a como sugestão de título do commit.

## Mensagem custom

Se o usuário fornecer uma mensagem após `/publicar` (exemplo: `/publicar finaliza cap II`), use essa mensagem como **título do commit**, prefixando com o escopo automaticamente detectado. Exemplo: `livro: finaliza cap II`.

Se não houver mensagem custom, deixe o agente decidir o título com base no `git diff`.

## O que NÃO fazer

- Não invocar a skill se `git status` está limpo (faça verificação rápida antes via Bash, ou deixe o agente reportar)
- Não usar `--force`, `--force-with-lease`, `--no-verify` em nenhuma circunstância sem autorização explícita
- Não criar branch novo, sempre opera em `main`
