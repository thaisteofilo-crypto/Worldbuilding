# KORÚ — WORKFLOW DE CRIAÇÃO
### Mapa completo do projeto: bíblia, livro e contos

---

## VISÃO GERAL DO PROJETO

| Entregável | Arquivo | Status | Tipo |
|---|---|---|---|
| Bíblia do Mundo | `koru-ecosystem-briefing.md` | ✅ Concluída | Referência técnica |
| Livro — Temiku | `koru-livro.md` | 🔲 A expandir | Narrativa literária |
| Conto — Amara | `contos/koru-conto-amara.md` | 🔲 A criar | Conto literário |
| Conto — Oruku | `contos/koru-conto-oruku.md` | 🔲 A criar | Conto literário |
| Conto — Obaru | `contos/koru-conto-obaru.md` | 🔲 A criar | Conto literário |
| Conto — Kemdi | `contos/koru-conto-kemdi.md` | 🔲 A criar | Conto literário |
| Conto — Beku | `contos/koru-conto-beku.md` | 🔲 A criar | Conto literário |
| Conto — Temi | `contos/koru-conto-temi.md` | 🔲 A criar | Conto literário |
| Conto — Orike | `contos/koru-conto-orike.md` | 🔲 A criar | Conto literário |

**Total de entregáveis:** 9 documentos (1 concluído, 8 a criar)

---

## MAPA DE DEPENDÊNCIAS

```
koru-ecosystem-briefing.md (FUNDAÇÃO)
         ↓ alimenta todos os outros
    ┌────┴────────────────────┐
    ↓                         ↓
CONTOS (7 histórias)       LIVRO (expansão)
    ↓                         ↑
    └──── aprofundam personagens
          que o livro usa
```

**Regra de dependência:**
1. A bíblia deve estar estável antes de escrever contos ou livro
2. Os contos podem ser escritos em qualquer ordem entre si
3. O livro idealmente vem depois dos contos — cada conto aprofunda um personagem que o livro usa

**O que a bíblia garante:** física do mundo (luz, morfologia, memória-energia), regras dos 13 acordos, tom e paleta visual. Qualquer novo elemento criado nos contos ou no livro deve ser compatível com a bíblia — se não for, atualiza a bíblia primeiro.

---

## ORDEM RECOMENDADA DE CRIAÇÃO

```
FASE 1 — Contos de origem (antes do tempo do livro)
  1. Amara      — o que ela era antes de Oruku a encontrar
  2. Oruku       — a escolha de ficar (perspectiva do Azuri)
  3. Beku        — o dia de Kemi + nascimento do projeto Mwanga-ji

FASE 2 — Contos de contexto (paralelos ao livro)
  4. Obaru       — a rigidez que precede sua abertura
  5. Kemdi       — o momento do toque de eleição
  6. Temi        — a vida nômade, antes de Orunjó

FASE 3 — Conto especial
  7. Orike       — arquivo vivo. Perspectiva não-animal. Formato diferente.

FASE 4 — Livro
  8. koru-livro.md — expansão capítulo a capítulo
```

---

## ESPECIFICAÇÕES POR TIPO DE ENTREGÁVEL

### BÍBLIA (`koru-ecosystem-briefing.md`)

**Tom:** documental técnico. Referência, não narrativa.
**Quando atualizar:** sempre que um conto ou capítulo do livro estabelece algo novo no mundo.
**Como atualizar:** usar o comando `/update-bible` ou chamar o agente `bible-keeper` diretamente.
**Critério de qualidade:**
- Toda nova regra tem fundamento + consequência de quebra
- Toda nova espécie tem morfologia + paleta + física
- Nenhuma inconsistência com o sistema de luz revisado (teto do Akwu + Ariku + Bomi Veh como eco)
- Nenhuma menção a "palmas" ou "mãos" — sempre "testa" ou "focinho"

---

### CONTOS (por personagem)

**Tom:** narrativo literário. Melancolia funcional. Beleza que custa.
**Extensão alvo:** 1.500 a 3.000 palavras por conto.
**Estrutura mínima de cada conto:**

```
CABEÇALHO DE REFERÊNCIA (interno, não publicado):
  - Personagem
  - Período temporal (antes/durante/depois do livro)
  - O que este conto revela que o livro não mostra
  - Física de Korú presente no conto

TEXTO DO CONTO:
  - Cena única ou sequência curta
  - Perspectiva do personagem ou próxima a ele
  - Termina com algo que muda a leitura do personagem no livro
```

**Critério de qualidade:**
- Autossuficiente — funciona sem ter lido o livro
- Revela algo que o livro menciona mas não mostra
- A física de Korú está integrada, não explicada
- O tom é coerente com a paleta do mundo (não glorifica, não dramatiza demais)
- Nenhuma inconsistência morfológica (sem mãos, toque pela testa)

---

### PERFIS ESPECÍFICOS DOS CONTOS

**AMARA**
- Período: anos antes do livro (antes de Oruku)
- Revelar: como era a escuta dela com as Ariku — o que a tornava diferente
- Cena proposta: o primeiro dia em que ela entendeu uma transmissão sem treinamento formal. A sensação de receber o que ninguém havia lhe ensinado a receber.
- Física presente: linguagem de pressão das Ariku, Bomi Veh processando memória

**ORUKU**
- Período: o momento da escolha (a primeira vez que ficou quando deveria ter passado)
- Revelar: como um Azuri experimenta o querer — o que é para uma criatura de passagem descobrir que quer parar
- Cena proposta: ele está traduzindo para Amara e percebe que ficou depois do fim da tradução. Ainda está lá. Não sabe por quê ainda está lá.
- Física presente: Luz Limiar, como o limiar "sente" um Azuri que para de passar, o início do exílio

**BEKU**
- Período: o dia de Kemi + os anos seguintes até o Mwanga-ji
- Revelar: que Beku não construiu o projeto por maldade — construiu por precisão
- Cena proposta: Beku sentado ao lado de Kemi que não o reconhece. A decisão de criar o projeto não como gesto de raiva, mas como gesto de arquiteto: se o design é cruel, o design pode ser substituído.
- Física presente: Jobi-Koro como Zoeji colapsado, Bomi Veh poroso no Asa Temu, sobrescrição de memória

**OBARU**
- Período: décadas antes do livro (formação da rigidez)
- Revelar: que houve um momento em que Obaru se abriu e algo quebrou — e a rigidez foi a resposta ao quebramento, não a personalidade original
- Cena proposta: ele era diferente. Um Onkweri que acreditava em criaturas de limiar. E então algo aconteceu. (O que aconteceu fica à escolha narrativa — pode ser uma perda, uma traição de confiança, um acordo que destruiu alguém que ele amava.)
- Física presente: sistema de memória dos Onkweri, estratificação como acumulação

**KEMDI**
- Período: o momento do toque de eleição (meses antes do livro)
- Revelar: que a eleição não foi escolhida por ela — foi uma consequência de estar completamente presente num momento em que um Azuri estava passando
- Cena proposta: ela não foi ao Azuri. Estava em outra coisa quando o Azuri passou. O toque aconteceu porque ela era a única que não estava com medo. Três respirações que mudaram a estrutura do que ela é.
- Física presente: Regra 10 (declaração mútua), Luz Limiar, marcas na testa e bordas dos olhos

**TEMI**
- Período: vida nômade (paralelo ao livro — antes de chegar a Orunjó)
- Revelar: que o nomadismo de Temi não é liberdade simples — é a forma que ela encontrou de não ter que escolher um lugar quando nenhum lugar tinha espaço para ela antes
- Cena proposta: um dia qualquer no Bomi-Weh. Ela sabe que está indo para Orunjó e que lá algo vai mudar. Ela ainda não sabe o quê.
- Física presente: Bomi Veh nas planícies, teto do Akwu visível sem filtro de Ariku, Ngurui nas planícies abertas

**ORIKE**
- Período: Era III ou Era IV (memória antiga)
- Formato diferente: não é narrado pelo ponto de vista de Orike (ela não "pensa" em palavras). É narrado pelo ponto de vista do Bomi Veh ao redor dela em um momento específico, ou de um Ubomi-chi que registrou algo.
- Revelar: que Orike está ciente de tudo que acontece ao seu redor há mais tempo do que qualquer criatura viva consegue imaginar. E que ela escolhe não intervir não por indiferença — mas porque sabe que o que não é vivido não pode ser arquivado.
- Física presente: arquivo das Ariku via Ubomi-chi, Zoeji em Era mais antiga, Era IV como memória registrada

---

### LIVRO (`koru-livro.md`)

**Tom:** narrativo literário. Mesmo tom do documento original — manter a voz.
**Estrutura:** 6 capítulos + epílogo (já existentes, a expandir)
**Extensão alvo por capítulo:** 2.000 a 5.000 palavras (versus ~500 atuais por capítulo)

**Expansões obrigatórias por capítulo:**

| Cap. | Título | Expansão necessária |
|---|---|---|
| I | O que ela é | + Dois Nkosi-ha no galho durante dissolução de Amara. + Formigamento nas partes Onkweri desde pequena. |
| II | A mentira silenciosa | + Linguagem da convocação. + O que Temiku sente ao aceitar — o que ela teme que não diz. |
| III | O que a floresta guarda | + Explicação do Bomi preto em termos de ciclo (Ubomi-chi mortos = memórias sem digestão). + Cena com Orike mais extensa. |
| IV | O projeto do fim do luto | + A física da porosidade das Jobi-Koro no Asa Temu. + Beku como arquiteto, não como vilão. |
| V | O limiar como morada | + Menção ao Zoeji — camadas de tempo sobrepostas nas Jobi-Koro. + Um Nkosi-ha na entrada que não entra. + A linguagem exata de como o limiar "reconhece" Temiku. |
| VI | O que ela paga | + Física da auto-dissolução de Temiku (acender ao máximo = acelerar fragmentação). + O que ela perde como fragmento físico, não apenas emocional. |
| Epílogo | Depois | Manter como está — já perfeito. |

**Critério de qualidade:**
- A voz do documento original é mantida (não "melhorada" — preservada)
- As correções físicas estão integradas sem serem explicadas (mostrar, não explicar)
- Os 6 ajustes do plano estão todos presentes
- As marcas de Isilo-Ori na testa e nas bordas dos olhos (não nas palmas)
- A luz de Temiku: azul-fria, responsiva, não constante

---

## COMO USAR OS AGENTES

### `/write-conto [personagem]`
Chama o agente `conto-writer` com o perfil completo do personagem e as especificações do conto.
**Exemplo:** `/write-conto amara`

### `/expand-chapter [número]`
Chama o agente `book-writer` com o capítulo atual e as expansões necessárias.
**Exemplo:** `/expand-chapter 5`

### `/update-bible [tópico]`
Chama o agente `bible-keeper` para integrar uma nova decisão criativa na bíblia.
**Exemplo:** `/update-bible novo elemento descoberto no conto de Oruku`

---

## CONTROLE DE CONSISTÊNCIA

Antes de publicar qualquer documento, verificar:

**Física:**
- [ ] Sistema de luz: teto do Akwu + Ariku + Bomi Veh como eco (não do chão)
- [ ] Morfologia: quadrúpedes com chifres, sem mãos, toque pela testa/focinho
- [ ] Isilo-Ori: marcas na testa e bordas dos olhos
- [ ] Temiku: luz azul-fria, responsiva, auto-dissolução por intensidade

**Nomenclatura:**
- [ ] Oru e Temu se referem ao estado do teto do Akwu, não à luz do chão
- [ ] Luz Limiar: emitida pelos Azuri, terceiro tipo, não ilumina — altera frequência
- [ ] Bomi Veh: 5 estados documentados (vivo, solidificado, preto, cinza, azul-frio)

**Regras:**
- [ ] Toque de eleição: declaração mútua + fronte a fronte + máximo 3 respirações
- [ ] Azuri exilado: considerado morto pelo acordo, frequência fora do ciclo
- [ ] Jobi-Koro no Asa Temu: porosas, mais perigosas, ninguém entra sem missão declarada

---

## ATUALIZAÇÕES DA BÍBLIA

Registrar aqui quando a bíblia for atualizada e por quê:

| Data | Atualização | Motivo |
|---|---|---|
| — | v1.0 — documento original | Criação inicial |
| — | v2.0 — sistema de luz revisado, morfologia corrigida, 13 regras | Revisão completa |

---

*KORÚ — Workflow de Criação*
*Última atualização: v2.0*
