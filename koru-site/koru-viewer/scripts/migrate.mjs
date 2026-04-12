import pg from 'pg'
const { Client } = pg

const client = new Client({
  connectionString: `postgresql://postgres:ODSq58Z7K69irOYC@db.aaegowtthdgvbidmggct.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false }
})

const schema = `
-- Documents: todo conteúdo MD do mundo
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  section text not null check (section in ('biblia','livro','contos','briefing','workflow')),
  content text not null default '',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Characters: dados dos 7 personagens
create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,
  gradient text,
  accent_color text,
  morphology text,
  ability text,
  status text,
  origin text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks: board de tarefas do projeto
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','done')),
  category text default 'outro' check (category in ('conto','capitulo','biblia','site','outro')),
  priority text default 'normal' check (priority in ('low','normal','high')),
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Images: concept art e referências
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  character_slug text,
  url text not null,
  caption text,
  type text default 'concept_art' check (type in ('concept_art','reference','finished','environment')),
  created_at timestamptz default now()
);

-- Realtime
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table characters;
alter publication supabase_realtime add table tasks;

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists documents_updated_at on documents;
create trigger documents_updated_at before update on documents
  for each row execute function update_updated_at();

drop trigger if exists characters_updated_at on characters;
create trigger characters_updated_at before update on characters
  for each row execute function update_updated_at();

drop trigger if exists tasks_updated_at on tasks;
create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

-- Seed: tasks iniciais do projeto
insert into tasks (title, description, category, status, priority, order_index) values
  ('Conto da Amara','Escrever conto de origem de Amara — dissolução no Bomi Veh','conto','todo','high',1),
  ('Conto do Oruku','Escrever conto de Oruku — passagem presa','conto','todo','high',2),
  ('Conto do Beku','Escrever conto de Beku','conto','todo','normal',3),
  ('Conto do Obaru','Escrever conto de Obaru','conto','todo','normal',4),
  ('Conto do Kemdi','Escrever conto de Kemdi','conto','todo','normal',5),
  ('Conto do Temi','Escrever conto de Temi (Temiku jovem)','conto','todo','normal',6),
  ('Conto de Orike','Conto especial — perspectiva do Bomi Veh','conto','todo','high',7),
  ('Expandir Capítulo 1','Expandir cap. 1 do livro','capitulo','todo','normal',1),
  ('Expandir Capítulo 2','Expandir cap. 2 do livro','capitulo','todo','normal',2),
  ('Expandir Capítulo 3','Expandir cap. 3 do livro','capitulo','todo','normal',3),
  ('Expandir Capítulo 4','Expandir cap. 4 do livro','capitulo','todo','normal',4),
  ('Expandir Capítulo 5','Expandir cap. 5 do livro','capitulo','todo','normal',5),
  ('Expandir Capítulo 6','Expandir cap. 6 do livro','capitulo','todo','normal',6),
  ('Design Temiku','Concept art de Temiku','outro','todo','high',1),
  ('Design Amara','Concept art de Amara','outro','todo','normal',2),
  ('Design Oruku','Concept art de Oruku','outro','todo','normal',3),
  ('Admin panel','Construir painel admin com editor MD + kanban','site','in_progress','high',1),
  ('Deploy vercel','Fazer deploy do koru-viewer na Vercel','site','todo','normal',2)
on conflict do nothing;
`

try {
  await client.connect()
  console.log('Conectado ao banco Supabase...')
  await client.query(schema)
  console.log('Schema criado com sucesso!')

  // Verificar tabelas
  const { rows } = await client.query(`
    select tablename from pg_tables
    where schemaname = 'public'
    order by tablename
  `)
  console.log('Tabelas criadas:', rows.map(r => r.tablename).join(', '))
} catch (err) {
  console.error('Erro:', err.message)
} finally {
  await client.end()
}
