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



---

*Este mapa é a referência de consistência. Atualize quando a estrutura mudar.*