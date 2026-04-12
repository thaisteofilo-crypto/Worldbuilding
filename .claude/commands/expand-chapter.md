# /expand-chapter

Expande um capítulo do livro de Korú (história de Temiku), preservando a voz original e integrando as correções físicas do plano de revisão.

## Como usar

```
/expand-chapter [número]
```

**Capítulos disponíveis:** 1 | 2 | 3 | 4 | 5 | 6 | epilogo

**Exemplos:**
- `/expand-chapter 1`
- `/expand-chapter 5`
- `/expand-chapter epilogo`

## O que este comando faz

1. Lê `koru-ecosystem-briefing.md` para contexto físico completo
2. Lê `koru-workflow.md` para as expansões obrigatórias do capítulo especificado
3. Lê o capítulo atual (de `koru-livro.md` ou `koru-completo-extracted.txt`)
4. Verifica os contos disponíveis na pasta `contos/` para aprofundar personagens presentes
5. Expande o capítulo: preserva o que existe, adiciona o que está especificado
6. Não modifica o que já funciona

## Regra principal

**Preservar e expandir, nunca substituir.** O texto original é a âncora. As expansões são adições, não substituições.

**Exceção:** inconsistências morfológicas (menções a mãos/palmas) são corrigidas nas expansões.

## O epílogo

O epílogo (`/expand-chapter epilogo`) retorna a mensagem: *"O epílogo está perfeito. Nenhuma expansão necessária."* Não modifica o texto.

## Especificações

- **Extensão alvo por capítulo:** 2.000 a 5.000 palavras (do rascunho de ~500)
- **Voz:** preservar o ritmo e a precisão do narrador original
- **Física:** integrada nas expansões, nunca explicada para o leitor
