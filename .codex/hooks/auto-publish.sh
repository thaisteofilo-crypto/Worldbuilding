#!/usr/bin/env bash
# .claude/hooks/auto-publish.sh
#
# Auto-publish hook para o projeto Korú.
# Roda no evento Stop (quando Claude termina uma resposta).
# Detecta escopo das mudanças, faz commit + pull rebase + push.
#
# Comportamento:
# - Se nada mudou: silencioso, exit 0
# - Se houver conflito no rebase: aborta rebase, reporta, exit 1 (Claude vê)
# - Se push falhar: reporta erro, exit 0 (não bloqueia Claude)
#
# Para desabilitar temporariamente: defina KORU_AUTOPUB=0 no ambiente
# Para ver logs detalhados: KORU_AUTOPUB_DEBUG=1

set -uo pipefail

# Bypass guard
if [[ "${KORU_AUTOPUB:-1}" == "0" ]]; then
  exit 0
fi

# Localizar raiz do repo (o hook roda com cwd do projeto)
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$REPO_ROOT" ]]; then
  exit 0
fi
cd "$REPO_ROOT"

DEBUG="${KORU_AUTOPUB_DEBUG:-0}"
log() { [[ "$DEBUG" == "1" ]] && echo "[auto-publish] $*" >&2 || true; }

# Verificar se há mudanças staged ou unstaged (excluindo untracked desconhecidos)
STATUS="$(git status --porcelain 2>/dev/null || true)"
if [[ -z "$STATUS" ]]; then
  log "nada a publicar"
  exit 0
fi

# Detectar escopo
declare -A SCOPES
while IFS= read -r line; do
  # Cada linha tem formato XY path. Extrai path (ignorando renomes "old -> new")
  path="$(echo "$line" | sed 's/^...//' | sed 's/.* -> //')"
  case "$path" in
    livro/*)            SCOPES[livro]=1 ;;
    biblia/*)           SCOPES[biblia]=1 ;;
    contos/*)           SCOPES[contos]=1 ;;
    koru-site/*)        SCOPES[site]=1 ;;
    .claude/*)          SCOPES[config]=1 ;;
    *.md|*.json|*.txt)  SCOPES[docs]=1 ;;
    *)                  SCOPES[outros]=1 ;;
  esac
done <<< "$STATUS"

# Construir prefixo de escopo
SCOPE_LIST=""
for s in livro biblia contos site config docs outros; do
  [[ -n "${SCOPES[$s]:-}" ]] && SCOPE_LIST="$SCOPE_LIST $s"
done
SCOPE_LIST="$(echo "$SCOPE_LIST" | xargs)"
SCOPE_COUNT=$(echo "$SCOPE_LIST" | wc -w)

if [[ "$SCOPE_COUNT" == "1" ]]; then
  PREFIX="$SCOPE_LIST"
else
  PREFIX="multi"
fi

# Resumo dos arquivos para o corpo
FILE_COUNT=$(echo "$STATUS" | wc -l | xargs)
TOP_FILES=$(echo "$STATUS" | head -5 | sed 's/^...//' | sed 's/.* -> //' | awk '{print "  - " $0}')

# Timestamp curto
TS="$(date +%Y-%m-%d\ %H:%M)"

# Mensagem
COMMIT_MSG=$(cat <<EOF
$PREFIX: atualização automática ($TS)

Escopo detectado: $SCOPE_LIST
Arquivos modificados: $FILE_COUNT

Principais mudanças:
$TOP_FILES

Commit gerado pelo hook auto-publish.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)

# Stage tudo
log "git add -A"
git add -A 2>/dev/null || { log "git add falhou"; exit 0; }

# Commit
log "git commit"
if ! git commit -m "$COMMIT_MSG" >/dev/null 2>&1; then
  log "git commit falhou (nada para commitar?)"
  exit 0
fi

COMMIT_HASH="$(git rev-parse --short HEAD)"
log "commit criado: $COMMIT_HASH"

# Fetch + rebase
log "git fetch + pull --rebase"
if ! git fetch origin main >/dev/null 2>&1; then
  echo "[auto-publish] fetch falhou — push pulado, commit local mantido ($COMMIT_HASH)"
  exit 0
fi

if ! git pull --rebase origin main >/dev/null 2>&1; then
  echo "[auto-publish] CONFLITO NO REBASE — abortando" >&2
  git rebase --abort >/dev/null 2>&1 || true
  echo "[auto-publish] commit $COMMIT_HASH preservado localmente; resolva o conflito manualmente" >&2
  exit 1
fi

# Push
log "git push"
if ! git push origin main >/dev/null 2>&1; then
  echo "[auto-publish] push falhou — commit $COMMIT_HASH preservado localmente"
  exit 0
fi

echo "[auto-publish] $PREFIX $COMMIT_HASH publicado"
exit 0
