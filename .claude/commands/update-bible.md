# /update-bible

Atualiza `koru-ecosystem-briefing.md` com novas decisões criativas, elementos criados nos contos, ou correções identificadas durante a escrita do livro.

## Como usar

```
/update-bible [descrição do que precisa ser integrado]
```

**Exemplos:**
- `/update-bible o conto de Oruku estabeleceu que um Azuri sente o querer como ausência de movimento, não como emoção`
- `/update-bible nova localização descoberta no capítulo 3`
- `/update-bible verificar se a cena X é consistente com a Regra 08`

## O que este comando faz

1. Lê `koru-ecosystem-briefing.md` completo
2. Avalia se o novo elemento é consistente com a física existente
3. Se consistente: integra na seção correta (mantendo tom documental técnico)
4. Se conflita: aponta o conflito antes de fazer qualquer alteração
5. Atualiza a tabela de atualizações no `koru-workflow.md`

## Regras do guardião

- Nunca altera a física estabelecida sem confirmação da autora
- Nunca usa linguagem narrativa no documento técnico
- Ambiguidades intencionais do mundo não são "resolvidas" sem autorização
- Novas regras precisam de: fundamento + consequência de quebra

## Verificação de consistência

Pode ser usado também para verificar se algo é consistente, sem necessariamente atualizar:

```
/update-bible verificar: [elemento a verificar]
```

Retorna: consistente / conflita com [referência específica] / não documentado (precisaria ser adicionado)
