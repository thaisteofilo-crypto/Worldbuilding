import pg from 'pg'

const { Client } = pg

const client = new Client({
  connectionString: `postgresql://postgres:ODSq58Z7K69irOYC@db.aaegowtthdgvbidmggct.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

await client.query(`
  insert into characters (slug, name, role, morphology, ability, status, origin, gradient, accent_color)
  values
    ('temiku','Temiku','Ser de limiar — origem de evento','Quadrúpede com chifres. Partes sólidas (Onkweri) coexistindo com partes translúcidas (Azuri).','Equilíbrio instável. Luz baixa = endurece. Luz alta = dissolução.','Existindo','Emergiu de Bomi Veh saturado por dissolução de Amara + Luz Limiar de Oruku','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.06 220) 50%, oklch(0.10 0.008 280) 100%)','var(--blue-cold)'),
    ('amara','Amara','Azuri — dissolvida','Azuri — quadrúpede com chifres. Toque pela testa ou focinho.','Dissolução voluntária no Bomi Veh. Única instância de Bomi Veh azul-frio documentada.','Dissolvida — frequência preservada no Bomi Veh','Azuri. Isilo-Ori na testa e bordas dos olhos.','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.22 0.08 290) 50%, oklch(0.10 0.008 280) 100%)','var(--accent)'),
    ('oruku','Oruku','Onkweri — passagem presa','Onkweri — quadrúpede sólido. Bomi Veh solidificado. Chifres.','Luz Limiar — altera frequência do ambiente. Nunca aparece visualmente na narrativa.','Passagem presa — frequência sem receptor, fora do ciclo','Onkweri. Estado atual: anomalia.','linear-gradient(160deg, oklch(0.05 0.008 280) 0%, oklch(0.15 0.06 220) 40%, oklch(0.08 0.008 280) 100%)','var(--blue-cold)'),
    ('beku','Beku','Azuri','Azuri — quadrúpede com chifres.','A definir.','A definir','Azuri.','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.07 270) 50%, oklch(0.10 0.008 280) 100%)','var(--accent)'),
    ('obaru','Obaru','Onkweri','Onkweri — quadrúpede sólido.','A definir.','A definir','Onkweri.','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.20 0.07 75) 50%, oklch(0.10 0.008 280) 100%)','var(--gold)'),
    ('kemdi','Kemdi','Onkweri','Onkweri — quadrúpede sólido.','A definir.','A definir','Onkweri.','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 300) 50%, oklch(0.10 0.008 280) 100%)','var(--accent)'),
    ('orike','Orike','Perspectiva do Bomi Veh','Bomi Veh — campo de memória fosforescente. Sem forma física definida.','Percepção total do campo de memória do Akwu.','Presente — campo ativo','O próprio Bomi Veh como entidade.','linear-gradient(160deg, oklch(0.07 0.008 280) 0%, oklch(0.18 0.05 290) 30%, oklch(0.16 0.08 75) 70%, oklch(0.10 0.008 280) 100%)','var(--gold)')
  on conflict (slug) do update set
    name = excluded.name,
    role = excluded.role,
    morphology = excluded.morphology,
    ability = excluded.ability,
    status = excluded.status,
    origin = excluded.origin,
    gradient = excluded.gradient,
    accent_color = excluded.accent_color
`)

console.log('Characters seeded!')
await client.end()
