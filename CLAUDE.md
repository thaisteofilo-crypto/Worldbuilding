# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## O que é este projeto

Projeto de worldbuilding criativo para o mundo de **Korú**, um mundo cuja física é baseada em memória. O repositório contém a bíblia do mundo, um livro (história de Temiku) e contos literários por personagem.

Não há código de software. Os "artefatos" são documentos markdown.

---

## Estrutura

```
koru-ecosystem-briefing.md  , bíblia completa (fonte autoritativa do mundo)
koru-workflow.md            , mapa do projeto, dependências, ordem de criação
biblia/                     , bíblia dividida em partes (parte-00 a parte-08) + briefings/
livro/                      , capítulos do livro (capitulo-01 a capitulo-06 + epilogo) + briefings/
contos/                     , contos por personagem (placeholders) + briefings/
.claude/agents/             , bible-keeper, conto-writer, book-writer
.claude/commands/           , /write-conto, /expand-chapter, /update-bible
.claude/skills/voz-thais/   , skill de voz da autora
```

**Regra de dependência:** a bíblia é a fundação. Contos e livro dependem dela. Qualquer novo elemento criado nos contos ou no livro deve ser compatível com a bíblia, se não for, atualizar a bíblia primeiro com `/update-bible`.

---

## Comandos disponíveis

```
/write-conto [personagem]   , escreve conto literário (amara|oruku|beku|obaru|kemdi|temi|orike)
/expand-chapter [número]    , expande capítulo do livro (1–6 ou epilogo)
/update-bible [descrição]   , integra novos elementos na bíblia ou verifica consistência
```

**Ordem recomendada para contos:** amara → oruku → beku → obaru → kemdi → temi → orike

**Sobre o epílogo:** nunca modificar. Está perfeito como está.

---

## Dois tons, dois contextos

| Documento | Tom | O que isso significa |
|---|---|---|
| `koru-ecosystem-briefing.md` e `biblia/` | Documental técnico | Tabelas, listas, linguagem de referência. Sem narrativa. |
| `livro/` e `contos/` | Narrativo literário | Voz da autora (ver skill). Melancolia funcional. Física integrada como dado, nunca explicada. |

Nunca usar tom narrativo em documentos técnicos. Nunca usar tom expositivo em textos literários.

---

## Regras invioláveis do mundo

**Morfologia, a mais crítica:**
- Azuri e Onkweri são **quadrúpedes com chifres**. Sem mãos, sem palmas.
- Contato intencional: pela **testa** (fronte) ou pelo **focinho**.
- Marca de Isilo-Ori: na **testa** e nas **bordas dos olhos**, nunca nas palmas.
- Qualquer menção a "colocou a palma", "com as mãos" etc. é erro, substituir por "encostou a testa" ou "aproximou o focinho".

**Sistema de luz:**
- Luz vem do **teto interno do Akwu**, não do chão.
- Ariku filtram e redistribuem lateralmente.
- Bomi Veh: fosforescência suave (eco horizontal, nunca de baixo para cima de forma ominosa).
- Três tipos: Oru (teto dourado), Temu (teto lilás-frio), Luz Limiar (Azuri, altera frequência, não ilumina).

**Bomi Veh, 5 estados:**
1. Vivo (lilás, processando)
2. Solidificado (denso, escuro, os Onkweri *são* este estado)
3. Preto (Ubomi-chi mortos, irreversível sem intervenção)
4. Cinza permanente (Jobi-Koro, violação do ciclo)
5. Azul-frio (único caso documentado: dissolução de Amara)

**Temiku:**
- Equilíbrio instável: luz baixa = parte Onkweri endurece. Luz alta = dissolução acelera, perde memória.
- Luz azul-fria (herança física de frequência de Oruku, não herança sentimental).
- A contenção emocional dela é mecanismo de sobrevivência física, não frieza.
- Origem: emergiu de Bomi Veh saturado simultaneamente pela dissolução de Amara + Luz Limiar de Oruku. Tem origem de evento, não de lugar.

**Oruku:**
- Nunca aparece visualmente na narrativa. Apenas o rastro (cor azul-fria, frequência nas veias de Temiku).
- Estado atual: "passagem presa", frequência sem receptor, fora do ciclo.

**Acordos vs. regras:**
- As 13 regras são **acordos com o mundo**, consequências são respostas físicas do ambiente, não punições por autoridade.
- Novas regras requerem: fundamento + consequência de quebra documentados.

---

## Agentes disponíveis

- **bible-keeper**, atualiza e verifica consistência da bíblia
- **conto-writer**, escreve contos literários (lê a skill de voz antes de escrever)
- **book-writer**, expande capítulos do livro (preserva voz original, não reescreve)

Ao escrever qualquer texto narrativo, o agente relevante deve ler `.claude/skills/voz-thais/SKILL.md` primeiro.

---

## Voz da autora (resumo da skill)

- Abertura abrupta, o texto começa no meio de algo, sem introdução
- Alternância de ritmo: frases longas interrompidas por cortes curtos
- Frases nominais como pausas estruturais ("O campo. O céu.")
- Metáforas físicas com peso, nunca decorativas
- Fechamento em contenção: emoção grande termina em gesto pequeno e preciso
- Zero emoções explicadas, descreve o que acontece no corpo/espaço
- Parênteses para pensamentos tangenciais que carregam o ponto central

Ver `.claude/skills/voz-thais/SKILL.md` para exemplos detalhados com ✅/❌.
