import pg from 'pg'

const { Client } = pg

const client = new Client({
  connectionString: `postgresql://postgres:ODSq58Z7K69irOYC@db.aaegowtthdgvbidmggct.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

// Ensure all required columns exist
await client.query(`
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS species text;
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS location text;
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS mark text;
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS quote text;
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS description text;
  ALTER TABLE characters ADD COLUMN IF NOT EXISTS order_index integer;
`)
console.log('Schema ready.\n')

const characters = [
  {
    slug: 'temiku',
    name: 'Temiku',
    order_index: 0,
    role: 'Protagonista — ser de limiar, origem de evento',
    species: 'Limiar',
    morphology: 'Quadrúpede com chifres. Partes sólidas (Onkweri) coexistindo com partes translúcidas (Azuri). Patas, cascos, flancos, pescoço, testa, focinho. Sem mãos.',
    ability: 'Equilíbrio instável entre dois estados. Luz baixa = parte Onkweri endurece. Luz alta = dissolução acelera, perde memória. Emite luz azul-fria herdada da frequência de Oruku.',
    status: 'Existindo — em trânsito constante',
    origin: 'Emergiu de Bomi Veh saturado simultaneamente pela dissolução de Amara e pela presença de Oruku (Luz Limiar). Não nasceu: tem origem de evento.',
    location: 'Akwu — sem lugar fixo, trânsito entre zonas de luz',
    mark: 'Marcas na testa e bordas dos olhos, herdadas do evento de origem. Padrão azul-frio sobre superfície translúcida.',
    quote: 'O equilíbrio não é conforto. É a distância exata entre endurecer e desaparecer.',
    description: 'Temiku não nasceu. Emergiu de um evento — a saturação simultânea do Bomi Veh pela dissolução de Amara e pela frequência Limiar de Oruku. Carrega em si duas naturezas opostas: partes que endurecem na ausência de luz e partes que se dissolvem quando há luz demais. A contenção emocional dela não é frieza: é mecanismo de sobrevivência física. O círculo azul-frio no Bomi Veh é o excesso que não coagulou nela.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.06 220) 50%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--blue-cold)',
  },
  {
    slug: 'amara',
    name: 'Amara',
    order_index: 1,
    role: 'Azuri — dissolvida. Precursora do evento de origem de Temiku.',
    species: 'Azuri',
    morphology: 'Azuri — quadrúpede com chifres. Corpo translúcido que filtra e redistribui luz. Toque intencional pela testa ou pelo focinho.',
    ability: 'Dissolução voluntária no Bomi Veh. Única instância documentada de dissolução que produziu o estado azul-frio no campo de memória.',
    status: 'Dissolvida — frequência preservada e distribuída no Bomi Veh',
    origin: 'Azuri. Portadora de Isilo-Ori — marca na testa e bordas dos olhos.',
    location: 'Dissolvida no Bomi Veh — frequência distribuída por todo o campo',
    mark: 'Isilo-Ori na testa e bordas dos olhos. Padrão lilás sobre superfície translúcida.',
    quote: 'Dissolver não é desaparecer. É tornar-se parte do que sustenta tudo.',
    description: 'Amara era Azuri — translúcida, com chifres que filtravam luz. Sua dissolução voluntária no Bomi Veh é o único caso documentado que produziu o estado azul-frio no campo de memória. Não morreu: dissolveu-se. Sua frequência persiste no Bomi Veh, e foi metade do evento que gerou Temiku. O que existe de Amara agora é o que o campo guarda de sua passagem.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.22 0.08 290) 50%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--accent)',
  },
  {
    slug: 'oruku',
    name: 'Oruku',
    order_index: 2,
    role: 'Onkweri — passagem presa. Anomalia do Akwu.',
    species: 'Onkweri',
    morphology: 'Onkweri — quadrúpede sólido. Corpo feito de Bomi Veh solidificado. Chifres. Nunca aparece visualmente na narrativa: existe apenas como rastro.',
    ability: 'Emite Luz Limiar — altera a frequência do ambiente em vez de iluminar. Presença detectada pela cor azul-fria que deixa nas veias de Temiku.',
    status: 'Passagem presa — frequência sem receptor, fora do ciclo natural do Akwu',
    origin: 'Onkweri. Estado atual: anomalia que carrega frequência de Azuri (Luz Limiar) sem pertencer a essa espécie.',
    location: 'Fora do ciclo — anomalia no Akwu, sem localização fixa. Existe como frequência, não como presença.',
    mark: 'Não possui — estado de passagem presa impede manifestação visual',
    quote: 'Existir sem ser visto é ainda existir. A frequência não precisa de forma.',
    description: 'Oruku é Onkweri — sólido, denso, feito de Bomi Veh solidificado. Mas carrega uma anomalia: sua frequência é Luz Limiar, típica dos Azuri. Existe como passagem presa — uma frequência sem receptor, fora do ciclo natural do Akwu. Nunca aparece visualmente na narrativa. Apenas o rastro: a cor azul-fria que sua frequência deixou nas veias de Temiku, a herança física que não é sentimental.',
    gradient: 'linear-gradient(160deg, oklch(0.05 0.008 280) 0%, oklch(0.15 0.06 220) 40%, oklch(0.08 0.008 280) 100%)',
    accent_color: 'var(--blue-cold)',
  },
  {
    slug: 'beku',
    name: 'Beku',
    order_index: 3,
    role: 'Azuri — personagem de origem. Conectada a Obaru.',
    species: 'Azuri',
    morphology: 'Azuri — quadrúpede com chifres. Corpo translúcido que filtra e redistribui a luz lateral do Akwu. Toque intencional pela testa ou focinho.',
    ability: 'Filtração e redistribuição de luz. Processos típicos dos Azuri: atravessam luz sem absorvê-la totalmente.',
    status: 'A definir nos contos',
    origin: 'Azuri. Portadora de Isilo-Ori.',
    location: 'Akwu — zonas de luz Oru (dourada, teto)',
    mark: 'Isilo-Ori na testa e bordas dos olhos. Padrão lilás sobre superfície translúcida.',
    quote: 'A luz passa. O que fica é o que ela tocou.',
    description: 'Beku é Azuri — translúcida, quadrúpede com chifres que filtram e redistribuem a luz do Akwu. Sua história se entrelaça com a de Obaru. O conto de origem de Beku é o terceiro na ordem do ciclo narrativo, e revela uma camada dos acordos do mundo que os contos anteriores apenas sugerem.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.07 270) 50%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--accent)',
  },
  {
    slug: 'obaru',
    name: 'Obaru',
    order_index: 4,
    role: 'Onkweri — personagem de contexto. Conectado a Beku e Kemdi.',
    species: 'Onkweri',
    morphology: 'Onkweri — quadrúpede sólido. Corpo feito de Bomi Veh solidificado. Chifres. Toque pela testa ou focinho.',
    ability: 'Solidez e permanência de memória. Onkweri carregam o que solidificou — não esquecem, apenas carregam de outra forma.',
    status: 'A definir nos contos',
    origin: 'Onkweri. Portador de Isilo-Ori.',
    location: 'Akwu — zonas de luz Temu (lilás-frio, teto)',
    mark: 'Isilo-Ori na testa e bordas dos olhos.',
    quote: 'O que solidifica não esquece. Apenas carrega de outra forma.',
    description: 'Obaru é Onkweri — sólido, denso, corpo feito de Bomi Veh solidificado. Conectado a Beku por uma história que cruza as fronteiras entre espécies e a Kemdi por laços que os contos de contexto revelarão. Seu conto é o quarto da série e expande a cosmologia do Akwu além dos eventos de origem.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.20 0.07 75) 50%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--gold)',
  },
  {
    slug: 'kemdi',
    name: 'Kemdi',
    order_index: 5,
    role: 'Onkweri — personagem de contexto. Conectado a Obaru.',
    species: 'Onkweri',
    morphology: 'Onkweri — quadrúpede sólido. Corpo feito de Bomi Veh solidificado. Chifres. Toque pela testa ou focinho.',
    ability: 'Solidez e densidade. Kemdi representa a permanência que não cede — presença que não se desfaz mesmo sob pressão.',
    status: 'A definir nos contos',
    origin: 'Onkweri. Portador de Isilo-Ori.',
    location: 'Akwu — zonas de luz Temu (lilás-frio, teto)',
    mark: 'Isilo-Ori na testa e bordas dos olhos.',
    quote: 'Densidade não é peso. É presença que não se desfaz.',
    description: 'Kemdi é Onkweri — sólido, quadrúpede, corpo de memória solidificada. Sua história conecta-se a Obaru por laços que os contos de contexto revelarão. É o quinto personagem no ciclo narrativo, e seu conto expande as consequências dos acordos do mundo para além dos eventos de origem.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 300) 50%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--accent)',
  },
  {
    slug: 'orike',
    name: 'Orike',
    order_index: 6,
    role: 'Perspectiva do Bomi Veh — conto especial',
    species: 'Bomi Veh',
    morphology: 'Bomi Veh — campo de memória fosforescente. Sem forma física definida. Sem chifres, sem patas. Presença que permeia o Akwu inteiro.',
    ability: 'Percepção total do campo de memória. Registra cada dissolução, solidificação, frequência e passagem. Memória do mundo como dado bruto.',
    status: 'Presente — campo ativo e em processamento contínuo',
    origin: 'O próprio Bomi Veh como entidade perceptiva. Não foi criado: sempre existiu como substrato do Akwu.',
    location: 'Todo o Akwu — o próprio campo de memória que sustenta o mundo',
    mark: 'Não possui — não tem forma física para portar marcas',
    quote: 'Tudo o que toca o campo, o campo guarda. Não por escolha. Por natureza.',
    description: 'Orike não é um ser — é uma perspectiva. O Bomi Veh percebendo a si mesmo. Registra tudo: cada dissolução, cada solidificação, cada frequência que o atravessa. O conto de Orike é o último e o mais singular da série: narrado pelo próprio campo de memória do mundo, pelo substrato que tornou possível Amara, Oruku, Temiku, e todos os outros.',
    gradient: 'linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 290) 30%, oklch(0.16 0.08 75) 70%, oklch(0.10 0.008 280) 100%)',
    accent_color: 'var(--gold)',
  },
]

for (const char of characters) {
  await client.query(
    `insert into characters
      (slug, name, order_index, role, species, morphology, ability, status, origin, location, mark, quote, description, gradient, accent_color)
     values
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     on conflict (slug) do update set
      name = excluded.name,
      order_index = excluded.order_index,
      role = excluded.role,
      species = excluded.species,
      morphology = excluded.morphology,
      ability = excluded.ability,
      status = excluded.status,
      origin = excluded.origin,
      location = excluded.location,
      mark = excluded.mark,
      quote = excluded.quote,
      description = excluded.description,
      gradient = excluded.gradient,
      accent_color = excluded.accent_color`,
    [
      char.slug, char.name, char.order_index, char.role, char.species,
      char.morphology, char.ability, char.status, char.origin, char.location,
      char.mark, char.quote, char.description, char.gradient, char.accent_color,
    ]
  )
  console.log(`  ✓ ${char.name}`)
}

console.log('\nAll 7 characters seeded successfully.')
await client.end()
