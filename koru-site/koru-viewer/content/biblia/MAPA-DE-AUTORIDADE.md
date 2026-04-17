# MAPA DE AUTORIDADE DA BÍBLIA

*Guia de referência para manter a bíblia coerente. Para cada conceito, existe **uma única parte** que define (fonte canônica). Outras partes podem mencionar ou referenciar, nunca redefinir.*

---

## Regra de ouro

Para qualquer conceito novo, pergunte: **"isto é física, ecologia, lugar, criatura, personagem, regra, cultura ou história?"** Apenas uma resposta é primária. Demais partes usam a convenção:

```
→ Ver [Parte X, Nome](parte-0X-arquivo.md)
```

Nunca redefina. Se precisar repetir um fato, use uma linha curta + ponteiro.

---

## Hierarquia de dependências

```
Parte 00  → Manifesto (tom, intenção)            ninguém depende
    ↓
Parte 01  → FÍSICA: Akwu, Luz, Ngurui, Zoeji     base para tudo
    ↓
Parte 02  → GEOGRAFIA: lugares, Chi-Oa,          depende de 01
            Jobi-Ariku, Ima-ri como lugar
    ↓
Parte 03  → ECOSSISTEMA: Asa, Bomi Veh,          depende de 01, 02
            Mwanga-ji, Nguvu-Chi, ciclos,
            reprodução
    ↓
Parte 04  → CRIATURAS: morfologia por espécie    depende de 01, 03
    ↓
Parte 05  → PERSONAGENS: instâncias              depende de 03, 04
    ↓
Parte 06  → REGRAS: mecânicas + consequências    depende de 01, 03, 04
    ↓
Parte 07  → CULTURA: práticas por Asa, Nyame-jo, depende de 02, 03, 06
            governo, Kanda, valores
    ↓
Parte 08  → LINHA DO TEMPO                       depende de tudo
```

A seta é sempre fundação → derivado. Nunca o contrário.

---

## Tabela de autoridade por conceito

| Conceito | Fonte canônica | Quem pode referenciar |
|---|---|---|
| **Akwu** (câmara) | Parte 01 | Parte 02, Glossário |
| **Korú vs Akwu** (disambiguação) | Parte 00 (âncora) + Parte 01 | Todos |
| **Luz Oru, Temu, Limiar** | Parte 01 | 03, 04, 05 |
| **Ngurui** | Parte 01 | 03 |
| **Zoeji** | Parte 01 | 02, 03, 07 |
| **Ikwe** | Parte 02 | 08 |
| **Bomi-Weh** (planície) | Parte 02 | Glossário |
| **Rimba Ngozi** | Parte 02 | 03, 05 |
| **Orunjó** | Parte 02 | 07 |
| **Chi-Oa** (arquitetura) | Parte 02 | 07 (só vida cultural) |
| **Jobi-Ariku** | Parte 02 | 07 |
| **Jobi-Koro** | Parte 02 | 06 (regra 06), 08 (Era IV) |
| **Njia-Kwe** | Parte 02 |, |
| **Ima-ri** (lugar) | Parte 02 | 07 (mecânica cultural) |
| **Círculo Azul-Frio** | Parte 02 | 03, 05 |
| **Base de Orike** | Parte 02 | 04 (Orike criatura) |
| **Bomi Veh** (5 estados) | Parte 03 | 02, Glossário |
| **Asa** (Mwanga, Rimbi, Temu, Nkosi) | Parte 03 | 07 (práticas), 06 (regras 06, 07) |
| **Ciclo memória-energia** | Parte 03 |, |
| **Mwanga-ji** (extração) | Parte 03 | 05 (Beku) |
| **Nguvu-Chi** (extração sustentável) | Parte 03 |, |
| **Reprodução por espécie** | Parte 03 | 05 (Temiku) |
| **Morfologia Azuri, Onkweri, Ariku, Ubomi-chi, Nkosi-ha** | Parte 04 | 05 |
| **Orike** (criatura) | Parte 04 | 02 (lugar) |
| **Temiku, Amara, Oruku, Obaru, Kemdi, Beku, Temi** | Parte 05 | Contos, livro |
| **Origem de Temiku (narrativa)** | Parte 05 | 03 (fato ecológico) |
| **13 Regras** | Parte 06 | 04, 05, 07 |
| **Isilo-Ori** (mecânica) | Parte 06, Regra 10 | 04 (marca visual), 05 (Kemdi), 07 (cargo) |
| **Toque de eleição** | Parte 06, Regra 10 | 04, 05 |
| **Regra 06 (Jobi-Koro)** | Parte 06 | 02, 08 |
| **Nyame-jo** | Parte 07 | 08 (menção histórica) |
| **Oa-Chi, Orime, Ima-Kwe** (governo) | Parte 07 | 02 (menção leve) |
| **Kanda** (alimentação) | Parte 07 |, |
| **Valores centrais** | Parte 07 |, |
| **5 Eras** | Parte 08 |, |

---

## Convenções de escrita

**Tom:**
- Parte 00 a 08: **documental técnico**. Tabelas, listas, linguagem de referência. Sem narrativa.
- Contos e livro (fora da bíblia): narrativo literário. Ver `.claude/skills/voz-thais/SKILL.md`.

**Nomenclatura:**
- **Korú** quando falar do mundo (cultura, criaturas, história)
- **Akwu** quando falar da câmara física (estrutura, teto, contenção)
- Nunca escrever "universo de Korú" (Akwu é o contêiner, Korú é o conteúdo)
- **Ariku → Arikus**, **Onkweri → Onkweris**, **Asa → Asas**, **Azuri → Azuris** no plural (flexão regular em português)
- **Bomi Veh** (solo-memória, sem hífen) ≠ **Bomi-Weh** (planícies, com hífen)
- **Ima-ri** (lugar) ≠ **Ima-Kwe** (cargo)
- **Oru** (luz) ≠ **Oruku** (personagem)
- **Temu** (Asa) ≠ **Temi** (personagem nômade) ≠ **Temiku** (personagem híbrida)

**Estrutura de cada Parte:**
1. Cabeçalho com número e título
2. Separador `---`
3. Seções com `###`
4. Cross-references no fim de cada seção com `→ Ver [Parte X, Nome](parte-0X.md)`

**Ao escrever qualquer coisa nova:**
1. Identifique a parte fonte canônica pelo mapa acima
2. Se o conceito já existe na fonte, atualize lá
3. Em outras partes, adicione apenas menção + link
4. Nunca escreva a mesma definição em dois lugares

---

*Este mapa é a referência de consistência. Atualize quando a estrutura mudar.*
