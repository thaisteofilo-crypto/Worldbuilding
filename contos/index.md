# KORÚ — Contos dos Personagens

Sete contos sobre as criaturas que habitam Korú — cada um uma lacuna que o livro menciona mas não mostra. Funcionam de forma autossuficiente, mas aprofundam a leitura do livro principal (*Temiku*).

---

## Tabela de contos

| Personagem | Período temporal | O que revela | Status |
|---|---|---|---|
| **Amara** | Anos antes do livro | Sua qualidade de escuta com as Ariku — o que a tornava diferente desde antes de Oruku | 🔲 a escrever |
| **Oruku** | O momento da escolha | O que é para um Azuri querer parar — como uma criatura de passagem experimenta o querer | 🔲 a escrever |
| **Beku** | Dia de Kemi + anos até o projeto Mwanga-ji | Que Beku não construiu o projeto por maldade — construiu por precisão de arquiteto | 🔲 a escrever |
| **Obaru** | Décadas antes do livro | Havia um Obaru diferente — a rigidez foi resposta a um quebramento, não a personalidade original | 🔲 a escrever |
| **Kemdi** | Meses antes do livro | A eleição não foi escolhida por ela — foi consequência de estar completamente presente | 🔲 a escrever |
| **Temi** | Semanas antes do livro | O nomadismo não é liberdade simples — é a forma que ela encontrou de não ter que escolher | 🔲 a escrever |
| **Orike** | Era III ou Era IV | Que Orike está ciente de tudo há mais tempo do que qualquer criatura viva imagina. Que não intervir é escolha, não indiferença | 🔲 a escrever |

---

## Ordem recomendada de escrita

A ordem segue a lógica de dependência narrativa: os contos de origem constroem a base emocional que os contos de contexto precisam, e o conto de Orike fecha o ciclo com perspectiva de Era.

```
FASE 1 — Contos de origem (antes do tempo do livro)
  1. amara   → contos/conto-amara.md
  2. oruku   → contos/conto-oruku.md
  3. beku    → contos/conto-beku.md

FASE 2 — Contos de contexto (meses a décadas antes do livro)
  4. obaru   → contos/conto-obaru.md
  5. kemdi   → contos/conto-kemdi.md
  6. temi    → contos/conto-temi.md

FASE 3 — Conto especial (formato diferente — perspectiva não-animal)
  7. orike   → contos/conto-orike.md
```

---

## Briefings

Cada conto tem um briefing completo em `contos/briefings/`. O briefing é o documento que o agente `conto-writer` lê antes de escrever — não é publicado, é referência interna.

| Briefing | Arquivo |
|---|---|
| Amara | `contos/briefings/briefing-conto-amara.md` |
| Oruku | `contos/briefings/briefing-conto-oruku.md` |
| Beku | `contos/briefings/briefing-conto-beku.md` |
| Obaru | `contos/briefings/briefing-conto-obaru.md` |
| Kemdi | `contos/briefings/briefing-conto-kemdi.md` |
| Temi | `contos/briefings/briefing-conto-temi.md` |
| Orike | `contos/briefings/briefing-conto-orike.md` |

---

## Como gerar um conto

```
/write-conto [personagem]
```

O agente `conto-writer` carrega automaticamente o briefing correspondente, a bíblia do mundo (`koru-ecosystem-briefing.md`) e escreve o conto diretamente no arquivo placeholder do personagem.

**Exemplo:**
```
/write-conto amara
```

---

## Critérios de qualidade (checklist rápido)

Antes de considerar um conto concluído, verificar:

- [ ] Autossuficiente — funciona sem ter lido o livro
- [ ] Física integrada como dado, não explicada
- [ ] Zero mãos, zero palmas — toque pela testa ou pelo focinho
- [ ] Abertura abrupta — já no meio de algo
- [ ] Fechamento em gesto pequeno e físico
- [ ] Emoções descritas pelo corpo, não explicadas
- [ ] Tom: melancolia funcional — não glorifica, não dramatiza demais

---

*KORÚ — Contos dos Personagens*
*Referência: `koru-ecosystem-briefing.md` (bíblia) + `koru-workflow.md` (workflow)*
