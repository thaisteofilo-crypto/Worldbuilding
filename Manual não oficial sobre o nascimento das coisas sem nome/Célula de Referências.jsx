import { useState } from "react";

const data = {
  intro: `Esta célula reúne o universo de referências que alimenta O Entre — não como lista de influências, mas como mapa de forças. Cada obra aqui opera em alguma camada do projeto: na voz, na estrutura, na premissa ontológica, no tom, na recusa ao arco de superação. As referências estão divididas em duas categorias: as que você citou diretamente, que já estão operando na sua escrita consciente ou inconscientemente — e as sugeridas como sustentação, organizadas por função existencial. Nenhuma deve ser absorvida inteira. Filtre. Roube o que serve. Recuse o que conflita.`,
  
  citadas: {
    series: [
      {
        titulo: "Carol e o Fim do Mundo",
        ano: "Netflix, 2023",
        tags: ["premissa central", "estrutura episódica", "inadequação ontológica"],
        como: "A origem direta do primeiro capítulo. Carol é O Entre em forma de animação: não consegue habitar o fim do mundo do jeito certo enquanto todos performam sentido. A estrutura episódica de testar formas de viver quando o tempo falhou é o modelo estrutural do romance. Carol não aprende. O fim chega e ela ainda estava entre.",
        absorver: "Inadequação como condição permanente; personagens ao redor como pressão sem salvação; ausência total de arco de superação; cotidiano burocrático como única morada possível."
      },
      {
        titulo: "The Midnight Gospel",
        ano: "Netflix, 2020",
        tags: ["presença corporal", "dissociação", "função de Ana"],
        como: "A série separa narrativa e conteúdo — o que acontece visualmente e o que é dito não se explicam mutuamente. Isso ressoa com a dissociação da protagonista: o mundo acontece enquanto o pensamento segue seu curso sem que um justifique o outro. O último episódio — a conversa com a mãe antes de ela morrer — é uma das cenas mais ontologicamente densas já feitas em animação.",
        absorver: "Presença corporal mínima como único sentido possível (função de Ana); a morte como colapso irrespondível do tempo; dissociação entre exterior e interior como condição narrativa."
      },
      {
        titulo: "Desencanto",
        ano: "Netflix, 2018–2023",
        tags: ["recusa ao papel", "uso restrito", "Helena"],
        como: "Uso restrito. Bean recusa o papel destinado sem saber o que colocar no lugar — isso tem parentesco com O Entre. Luci, o demônio pessoal, é externalização de um estado interno que não se nomeia: parentesco com Helena. Mas a série tem arco, resolução e usa humor como amortecedor sistemático da tensão — o oposto do que o romance precisa sustentar.",
        absorver: "Apenas: a recusa inicial ao papel destinado sem alternativa clara; Luci como voz da desistência que acompanha sem decidir. Não absorver: estrutura de arco, humor como alívio, resolução."
      },
      {
        titulo: "Long Story Short",
        ano: "Filme, 2021",
        tags: ["tempo simbólico", "presença sem habitação", "espelho invertido"],
        como: "O personagem está em todos os momentos mas não os acumula. O tempo passa e não deixa tração. Isso é exatamente o colapso simbólico do tempo — só que aqui literal, não ontológico. Útil como espelho invertido: mostra o colapso com resolução emocional final, o que ajuda a entender por contraste o que o romance precisa fazer sem fechamento.",
        absorver: "Dissociação entre presença física no tempo e habitá-lo com sentido; a continuidade como fato bruto, não como conquista. Não absorver: a reconciliação final."
      },
      {
        titulo: "The House",
        ano: "Netflix, 2022",
        tags: ["estrutura de antologia", "identidade incompleta", "melancolia funcional"],
        como: "Das quatro séries que você citou, a mais sofisticada estruturalmente. Três histórias na mesma casa, três formas de não conseguir habitar um espaço. O terceiro segmento — a gata que continua reformando a casa sem saber por quê, enquanto os outros partem — é melancolia funcional em estado quase puro: sem esperança fabricada, sem resolução, apenas a continuação como fato.",
        absorver: "Capítulos como câmaras independentes com premissa compartilhada; a casa como identidade instável que nunca se completa; a continuidade sem saber por quê como postura existencial; stop-motion como estética da impermanência."
      }
    ],
    livros: [
      {
        titulo: "Clarice Lispector",
        obras: "A Paixão Segundo G.H. / Água Viva / Laços de Família",
        tags: ["voz", "sintaxe", "percepção antes da palavra"],
        como: "A influência mais estrutural. O que importa absorver não é o 'jeito Clarice' como maneirismo, mas o movimento específico do pensamento: a percepção chega antes da palavra, e a palavra trai a percepção enquanto tenta capturá-la. Isso é exatamente o que a protagonista vive. A Paixão Segundo G.H. é câmara de pressão ontológica sem saída clássica. Água Viva é o presente contínuo como única morada possível.",
        absorver: "Sintaxe do pensamento em fluxo; percepção anterior à explicação; tensão entre palavra e silêncio; gestos mínimos carregados de densidade; a linguagem que tenta e falha."
      },
      {
        titulo: "Ursula K. Le Guin",
        obras: "Os Despossuídos / A Mão Esquerda da Escuridão",
        tags: ["coerência interna", "rigor ético", "recusa de simplificação"],
        como: "Referência de rigor, não de estilo. Em Le Guin, nenhum personagem é apenas símbolo, as contradições éticas não se resolvem com boa vontade, e o protagonista que entende mais não é por isso salvo. Os Despossuídos mostra a impossibilidade de fechar qualquer narrativa de libertação.",
        absorver: "Coerência interna dos sistemas; recusa de simplificações morais; a lucidez que não produz libertação como princípio narrativo; personagens que respiram mesmo sendo funções."
      },
      {
        titulo: "Margaret Atwood",
        obras: "O Conto da Aia / Surfacing / Alias Grace",
        tags: ["persistência sem épica", "adaptação como sobrevivência", "identidade como narrativa aberta"],
        como: "A persistência sem épica. Em Atwood, as personagens continuam porque é o que se faz — não porque encontraram sentido. Surfacing é o mais próximo do projeto: protagonista sem nome, desintegração controlada, a natureza não redime, a linguagem falha, o corpo sabe antes da mente.",
        absorver: "Viver como persistência, não como conquista; adaptação como custo, não como escolha; identidade como narrativa que nunca fecha; consequência silenciosa do cotidiano."
      }
    ]
  },

  sustentacao: [
    {
      categoria: "Para o Colapso Simbólico do Tempo",
      cor: "#8B7355",
      itens: [
        {
          titulo: "The Leftovers",
          tipo: "série · HBO, 2014–2017",
          tags: ["premissa ontológica", "estratégias de sobrevivência", "recusa de explicação"],
          como: "A série que mais diretamente trabalha o colapso simbólico do tempo. Dois por cento da população desaparece sem explicação — e a série nunca explica. Cada personagem representa uma estratégia diferente de lidar com a falha: religião, negação, performance de normalidade. O protagonista Kevin é uma versão de O Entre: continua funcionando sem conseguir habitar o presente.",
          absorver: "Personagens como estratégias de sobrevivência ontológica, não soluções; recusa de explicação como princípio estrutural; melancolia funcional como modo de existir após a ruptura."
        },
        {
          titulo: "Russian Doll",
          tipo: "série · Netflix, 2019–2022",
          tags: ["loop existencial", "tempo que não acumula", "impossibilidade de avançar"],
          como: "O loop não é fantástico: é a experiência de quem não consegue sair de um estado existencial, de quem repete padrões sem conseguir habitá-los diferente. O tempo como experiência subjetiva que pode falhar sem catástrofe visível.",
          absorver: "O loop como estrutura existencial; a impossibilidade de sair de um estado apenas entendendo-o; dias que se repetem sem acumular sentido."
        },
        {
          titulo: "W.G. Sebald",
          tipo: "livro · Os Anéis de Saturno / Austerlitz",
          tags: ["tempo que sedimenta", "melancolia como modo de ver", "respiração longa"],
          como: "O tempo em Sebald não avança nem retorna: ele sedimenta. Os dias não acumulam sentido, acumulam ruína. A melancolia não é patologia — é modo de ver. A prosa de Sebald tem exatamente a respiração longa e suspensa que o romance precisa.",
          absorver: "Tempo como sedimentação; melancolia funcional sem autocompaixão; prosa de respiração longa que suspende em vez de resolver."
        }
      ]
    },
    {
      categoria: "Para a Identidade Instável e a Lucidez que Não Liberta",
      cor: "#6B7B8D",
      itens: [
        {
          titulo: "BoJack Horseman",
          tipo: "série · Netflix, 2014–2020",
          tags: ["lucidez como prisão", "inteligência que não cura", "câmaras existenciais"],
          como: "A referência mais precisa para lucidez que não produz libertação. BoJack entende seus padrões, os nomeia, os analisa — e os repete. A inteligência não cura. Episódios como Free Churro e The View from Halfway Down são câmaras de pressão existencial puras, sem trama externa.",
          absorver: "Lucidez como prisão, não libertação; o personagem que entende tudo e isso não muda nada; episódios de câmara existencial como modelo estrutural para capítulos."
        },
        {
          titulo: "Samuel Beckett",
          tipo: "livro · Molloy / Malone Morre / O Inominável",
          tags: ["identidade que se esvazia", "continuar sem sentido", "princípio radical"],
          como: "O princípio radical. A identidade que se esvazia enquanto fala. Não posso continuar. Vou continuar. — quase o manifesto do romance. Para entender até onde a recusa de resolução pode ir.",
          absorver: "A identidade como processo de esvaziamento; a continuação como fato bruto sem justificativa; a linguagem que falha como única linguagem disponível."
        },
        {
          titulo: "Severance",
          tipo: "série · Apple TV+, 2022–",
          tags: ["identidade partida", "impossibilidade de acesso a si", "cotidiano ontológico"],
          como: "A identidade dividida entre dois contextos sem memória compartilhada. Qual das duas versões é eu? Nenhuma tem acesso ao todo. Isso é operacional para O Entre: a sensação de nunca coincidir consigo porque o si está sempre partido entre estados, tempos, versões.",
          absorver: "A identidade partida como condição, não anomalia; o cotidiano como câmara de pressão ontológica contida; a impossibilidade de acesso a si mesma."
        },
        {
          titulo: "Virginia Woolf",
          tipo: "livro · As Ondas",
          tags: ["identidade como superfície", "impossibilidade de coincidir", "seis vozes sem unificação"],
          como: "Em As Ondas, a identidade não é núcleo — é superfície de contato com o mundo, sempre se refazendo. Seis vozes que nunca se tornam uma. O livro inteiro é sobre a impossibilidade de coincidir consigo.",
          absorver: "Identidade como processo e não como essência; o pensamento em camadas simultâneas; a forma como a percepção sensorial precede a interpretação intelectual."
        },
        {
          titulo: "Thomas Bernhard",
          tipo: "livro · Extinção / O Náufrago",
          tags: ["precisão devastadora", "lucidez como prisão", "inteligência inútil"],
          como: "Protagonistas que entendem tudo com precisão devastadora e isso não muda nada. A lucidez como prisão. A inteligência que não produz libertação — exatamente o princípio central do romance.",
          absorver: "O tom de análise implacável que não consola; o monólogo que avança sem resolver; a recusa de qualquer saída sentimental."
        }
      ]
    },
    {
      categoria: "Para a Melancolia Funcional e o Cotidiano sem Épica",
      cor: "#7A6B5A",
      itens: [
        {
          titulo: "Rectify",
          tipo: "série · SundanceTV, 2013–2016",
          tags: ["impossibilidade de sincronizar", "melancolia funcional pura", "sem clímax"],
          como: "Um homem sai da prisão após dezenove anos e não consegue reentrar no tempo do mundo. A série inteira é sobre a impossibilidade de sincronizar com o presente. Nenhum episódio tem clímax. Nenhum arco se fecha. Provavelmente a série mais próxima do tom geral do romance.",
          absorver: "Melancolia funcional em estado quase puro; estrutura episódica sem progressão narrativa; a dessincronização entre tempo interno e externo como condição permanente."
        },
        {
          titulo: "Annie Ernaux",
          tipo: "livro · Os Anos / Uma Mulher",
          tags: ["vida cotidiana como matéria", "sem sentimentalismo", "tempo que passa sem perceber"],
          como: "A vida cotidiana como matéria ontológica. O tempo que passa sem que se perceba — e a literatura como tentativa de capturá-lo já tarde demais. Escrita sem sentimentalismo, sem heroísmo, sem moralização.",
          absorver: "O cotidiano como único território legítimo; a escrita que observa sem julgar e sem consoler; o tempo como acúmulo que não se percebe enquanto acontece."
        },
        {
          titulo: "Jenny Offill",
          tipo: "livro · Dept. of Speculation / Tempo de Tempestade",
          tags: ["fragmentação estrutural", "persistência sem superação", "forma que mimetiza estado"],
          como: "Fragmentos de consciência que não constroem narrativa linear. A protagonista que persiste sem superação. Melancolia funcional em forma estrutural — o livro em si fragmentado como o estado mental que descreve.",
          absorver: "A fragmentação como princípio estrutural e não apenas estético; a voz que observa a própria vida com distância clínica e afeto simultâneos."
        }
      ]
    },
    {
      categoria: "Para a Estrutura Episódica sem Clímax",
      cor: "#5A6B5A",
      itens: [
        {
          titulo: "Jon Fosse",
          tipo: "livro · Septologia (7 volumes)",
          tags: ["repetição com variação mínima", "tempo circular", "identidade em suspensão"],
          como: "Talvez a referência estrutural mais próxima do que o romance quer fazer. Frases que se repetem com variação mínima, criando hipnose e tensão simultâneas. O tempo que não avança — circula. A identidade que se pergunta a si mesma sem resposta.",
          absorver: "A repetição como estrutura do tempo que não avança; a hipnose narrativa sem drama; o encerramento sempre em suspensão."
        },
        {
          titulo: "Rachel Cusk",
          tipo: "livro · Esboço / Trânsito / Honra",
          tags: ["protagonista como câmara", "pressão sem resolução", "tensão sem clímax"],
          como: "A protagonista que quase não existe como personagem central — existe como câmara de ressonância. Os outros pressionam; ela não resolve. Modelo de como sustentar tensão existencial sem clímax narrativo.",
          absorver: "A protagonista como espaço de pressão e não como agente; a estrutura de encontros que pressionam sem resolver; a identidade que se forma apenas no contato com o outro."
        },
        {
          titulo: "Twin Peaks: The Return",
          tipo: "série · Showtime, 2017",
          tags: ["tempo que circula", "identidade como casca", "recusa total de resolução"],
          como: "18 horas de televisão que recusam sistematicamente a lógica de causa e consequência. O tempo não avança — se dobra, repete, suspende. Dale Cooper passa a maior parte da série deslocado de si mesmo, funcionando como casca de identidade sem núcleo.",
          absorver: "O tempo que circula em vez de avançar; a identidade habitável sem núcleo presente; a estrutura episódica como sequência de microestados."
        },
        {
          titulo: "Marilynne Robinson",
          tipo: "livro · Gilead",
          tags: ["micromomentos", "beleza que não salva", "tensão sem clímax"],
          como: "Um romance inteiro de micromomentos de tensão existencial sem resolução narrativa. A beleza não salva; o entendimento não cura; a continuidade acontece mesmo assim.",
          absorver: "Como sustentar peso ontológico em gestos mínimos; a prosa que carrega mais do que diz; o encerramento como deslocamento, não fechamento."
        }
      ]
    },
    {
      categoria: "Para a Voz e o Monólogo Interno",
      cor: "#6B5A7A",
      itens: [
        {
          titulo: "Fleabag",
          tipo: "série · BBC/Amazon, 2016–2019",
          tags: ["monólogo externalizado", "performance de si", "distância de si como mecanismo"],
          como: "A protagonista usa a performance de si mesma como escudo contra coincidir consigo. O olhar para a câmera é o monólogo interior externalizado — ela comenta sua própria vida em tempo real porque habitar a vida sem comentário seria insuportável.",
          absorver: "Monólogo interno como mecanismo de distância de si; a identidade performada como forma de não ter identidade; a lucidez que não produz libertação mas produz estilo."
        },
        {
          titulo: "Undone",
          tipo: "série · Amazon, 2019–2022",
          tags: ["ambiguidade controlada", "percepção anterior à interpretação", "realidade instável"],
          como: "A protagonista não sabe se está tendo visões, se é esquizofrênica ou se tem acesso a uma percepção mais verdadeira do tempo. A série não resolve essa ambiguidade. A realidade permanece incerta até o fim.",
          absorver: "Ambiguidade controlada como princípio estrutural; a percepção como dado anterior à interpretação; o corpo que percebe antes que a mente classifique."
        },
        {
          titulo: "I May Destroy You",
          tipo: "série · HBO/BBC, 2020",
          tags: ["tempo não-linear", "identidade em fragmentos", "recusa de recuperação"],
          como: "A série recusa a narrativa de recuperação. A identidade não se reconstrói linearmente. Passado e presente coexistem sem hierarquia clara, sem que um explique o outro. O final é profundamente ambíguo — não há fechamento, há um reconhecimento.",
          absorver: "Tempo não-linear como condição existencial, não artifício; a recusa do arco de superação mesmo diante de trauma real; identidade que persiste em fragmentos sem nunca se unificar."
        }
      ]
    },
    {
      categoria: "Apoio Filosófico — Para Informar a Escrita",
      cor: "#5A5A6B",
      itens: [
        {
          titulo: "Mark Fisher",
          tipo: "ensaio · Realismo Capitalista / blog k-punk",
          tags: ["melancolia contemporânea", "colapso do futuro", "condição coletiva"],
          como: "A melancolia contemporânea como condição estrutural, não patologia individual. A dificuldade de imaginar futuro como experiência coletiva — fundamental para o conceito de tempo simbólico que falhou. Leitura paralela à escrita, não como influência estilística, mas como mapa conceitual.",
          absorver: "O colapso do tempo como fenômeno coletivo e não apenas subjetivo; a impossibilidade de habitar o futuro como sintoma contemporâneo."
        },
        {
          titulo: "Maurice Blanchot",
          tipo: "ensaio · O Espaço Literário",
          tags: ["literatura como impossibilidade", "o que não cabe na linguagem", "espaço do não-dito"],
          como: "A literatura como espaço de impossibilidade — onde a experiência que não cabe na linguagem é precisamente o que a literatura tenta dizer. Para entender o que o romance está tentando fazer ao dar linguagem ao que não tem linguagem.",
          absorver: "A escrita como ato de aproximação do que não se pode dizer; a impossibilidade como matéria narrativa."
        },
        {
          titulo: "Hélène Cixous",
          tipo: "ensaio · sobre Lispector e a escrita feminina",
          tags: ["linguagem do corpo", "escrita como presença física", "percepção como ponto de partida"],
          como: "A linguagem que parte do corpo, não da abstração. A escrita como ato físico de presença. Fundamental para entender o que Lispector faz e como replicar o movimento sem imitar o estilo.",
          absorver: "O corpo como território de conhecimento anterior à interpretação; a escrita que emerge da sensação e não do conceito."
        }
      ]
    }
  ],

  conclusao: `O mapa acima não é uma lista de leituras obrigatórias. É um conjunto de forças que já atuam ou podem atuar na escrita de O Entre. Algumas dessas referências precisam ser lidas com atenção clínica — absorver o movimento, recusar o resultado. Outras precisam ser sentidas mais do que analisadas.

Se houvesse uma ordem de urgência: Clarice Lispector pela voz. Samuel Beckett pelo princípio. Jon Fosse pela estrutura. Sebald pela respiração. Mark Fisher pelo mapa conceitual. The Leftovers pela premissa em movimento. Rectify pelo tom. BoJack Horseman pela lucidez que não liberta.

O que une todas essas referências é uma recusa: nenhuma delas oferece ao protagonista — nem ao leitor — a redenção que ele esperava. E é exatamente isso que O Entre precisa sustentar do primeiro ao último parágrafo.`
};

export default function CelulaReferencias() {
  const [aba, setAba] = useState("citadas");
  const [catAtiva, setCatAtiva] = useState(null);
  const [itemAberto, setItemAberto] = useState(null);

  const toggleItem = (id) => setItemAberto(itemAberto === id ? null : id);

  return (
    <div style={{
      fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
      background: "#0F0E0C",
      minHeight: "100vh",
      color: "#C8BFA8",
      padding: "0"
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2A2820",
        padding: "48px 48px 32px",
        background: "#0A0908"
      }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#5A5040", marginBottom: 16, textTransform: "uppercase" }}>
          worldbuilding · O Entre
        </div>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 400, color: "#E8DFC8", lineHeight: 1.1, letterSpacing: -0.5 }}>
          Célula de Referências
        </h1>
        <p style={{ margin: "20px 0 0", fontSize: 15, lineHeight: 1.8, color: "#8A7E68", maxWidth: 680 }}>
          {data.intro}
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", borderBottom: "1px solid #2A2820", padding: "0 48px", background: "#0D0C0A" }}>
        {[
          { id: "citadas", label: "Referências Citadas" },
          { id: "sustentacao", label: "Referências de Sustentação" },
          { id: "conclusao", label: "Conclusão" }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setAba(tab.id); setItemAberto(null); setCatAtiva(null); }}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "16px 0", marginRight: 32,
              fontSize: 13, letterSpacing: 1,
              color: aba === tab.id ? "#E8DFC8" : "#5A5040",
              borderBottom: aba === tab.id ? "2px solid #8B7355" : "2px solid transparent",
              transition: "all 0.2s", textTransform: "uppercase"
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "40px 48px", maxWidth: 900 }}>

        {/* CITADAS */}
        {aba === "citadas" && (
          <div>
            <Section titulo="Séries que você citou" subtitulo="Já operam na sua escrita consciente ou inconscientemente">
              {data.citadas.series.map((item, i) => (
                <ItemCard key={i} item={item} id={`s-${i}`} aberto={itemAberto === `s-${i}`} toggle={toggleItem} tipo="série" />
              ))}
            </Section>
            <div style={{ marginTop: 48 }}>
              <Section titulo="Autoras que você citou" subtitulo="Referências estéticas, éticas e estruturais declaradas no projeto">
                {data.citadas.livros.map((item, i) => (
                  <ItemCard key={i} item={item} id={`l-${i}`} aberto={itemAberto === `l-${i}`} toggle={toggleItem} tipo="livro" isLivro />
                ))}
              </Section>
            </div>
          </div>
        )}

        {/* SUSTENTAÇÃO */}
        {aba === "sustentacao" && (
          <div>
            <p style={{ fontSize: 14, color: "#6A6050", marginBottom: 36, lineHeight: 1.7 }}>
              Organizadas por função existencial. Filtre o que serve. Recuse o que conflita com os princípios do projeto.
            </p>
            {data.sustentacao.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 40 }}>
                <button
                  onClick={() => setCatAtiva(catAtiva === ci ? null : ci)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0", width: "100%", textAlign: "left"
                  }}>
                  <div style={{ width: 3, height: 20, background: cat.cor, borderRadius: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, letterSpacing: 2, color: cat.cor, textTransform: "uppercase", fontFamily: "Courier New, monospace" }}>
                    {cat.categoria}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "#4A4030" }}>
                    {catAtiva === ci ? "▲" : "▼"}
                  </span>
                </button>
                <div style={{ borderTop: `1px solid ${cat.cor}22`, paddingTop: 16 }} />
                {(catAtiva === ci || catAtiva === null) && cat.itens.map((item, ii) => (
                  <ItemCard key={ii} item={item} id={`c${ci}-${ii}`} aberto={itemAberto === `c${ci}-${ii}`} toggle={toggleItem} tipo={item.tipo} cor={cat.cor} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* CONCLUSÃO */}
        {aba === "conclusao" && (
          <div>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#5A5040", marginBottom: 20, textTransform: "uppercase" }}>
                Síntese operacional
              </div>
              <div style={{
                borderLeft: "2px solid #8B7355",
                paddingLeft: 28,
                fontSize: 16,
                lineHeight: 1.9,
                color: "#C8BFA8",
                whiteSpace: "pre-line"
              }}>
                {data.conclusao}
              </div>
            </div>

            <div style={{ marginTop: 48 }}>
              <div style={{ fontSize: 11, letterSpacing: 3, color: "#5A5040", marginBottom: 20, textTransform: "uppercase" }}>
                Mapa de urgência
              </div>
              {[
                { ref: "Clarice Lispector", funcao: "voz e sintaxe" },
                { ref: "Samuel Beckett", funcao: "o princípio radical" },
                { ref: "Jon Fosse", funcao: "estrutura e respiração" },
                { ref: "W.G. Sebald", funcao: "tempo que sedimenta" },
                { ref: "Mark Fisher", funcao: "mapa conceitual do projeto" },
                { ref: "The Leftovers", funcao: "premissa em movimento" },
                { ref: "Rectify", funcao: "tom e melancolia funcional" },
                { ref: "BoJack Horseman", funcao: "lucidez que não liberta" },
                { ref: "Carol e o Fim do Mundo", funcao: "estrutura episódica central" },
                { ref: "The House", funcao: "câmaras independentes com premissa compartilhada" }
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", gap: 16, padding: "12px 0",
                  borderBottom: "1px solid #1E1C18",
                  alignItems: "baseline"
                }}>
                  <span style={{ fontSize: 11, color: "#4A4030", fontFamily: "Courier New", width: 24, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, color: "#E8DFC8" }}>{r.ref}</span>
                  <span style={{ fontSize: 13, color: "#6A6050", marginLeft: "auto", textAlign: "right", maxWidth: 260 }}>
                    {r.funcao}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ titulo, subtitulo, children }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: "#E8DFC8" }}>{titulo}</h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#5A5040" }}>{subtitulo}</p>
      </div>
      {children}
    </div>
  );
}

function ItemCard({ item, id, aberto, toggle, tipo, cor = "#8B7355", isLivro = false }) {
  return (
    <div style={{
      marginBottom: 12,
      border: `1px solid ${aberto ? cor + "44" : "#1E1C18"}`,
      borderRadius: 4,
      background: aberto ? "#141210" : "transparent",
      transition: "all 0.2s"
    }}>
      <button
        onClick={() => toggle(id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          width: "100%", textAlign: "left", padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: 16
        }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, color: "#E8DFC8", fontWeight: 400 }}>
              {item.titulo}
            </span>
            <span style={{ fontSize: 11, color: "#5A5040", fontFamily: "Courier New", letterSpacing: 1 }}>
              {isLivro ? item.obras : (item.ano || tipo)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {item.tags.map((t, i) => (
              <span key={i} style={{
                fontSize: 10, color: cor, border: `1px solid ${cor}44`,
                padding: "2px 8px", borderRadius: 2, letterSpacing: 1,
                textTransform: "uppercase", fontFamily: "Courier New"
              }}>{t}</span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#4A4030", flexShrink: 0, paddingTop: 4 }}>
          {aberto ? "▲" : "▼"}
        </span>
      </button>

      {aberto && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #1E1C18" }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#A89878", margin: "16px 0 12px" }}>
            {item.como}
          </p>
          <div style={{ background: "#0A0908", borderLeft: `2px solid ${cor}`, padding: "12px 16px", borderRadius: "0 4px 4px 0" }}>
            <span style={{ fontSize: 11, color: cor, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Courier New" }}>
              O que absorver
            </span>
            <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.7, color: "#7A7060", fontStyle: "italic" }}>
              {item.absorver}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
