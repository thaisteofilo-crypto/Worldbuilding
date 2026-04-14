-- Tabela para conteúdo editável do site (títulos, labels, taglines, etc.)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_site_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_content_updated_at ON site_content;
CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_site_content_updated_at();

-- Valores padrão (não sobrescreve se já existirem)
INSERT INTO site_content (key, value) VALUES
  -- Hero
  ('hero.tagline',             'Um mundo cuja física é baseada em memória.'),
  ('hero.cta_primary_text',    'Bíblia do Mundo'),
  ('hero.cta_primary_href',    '/biblia/parte-00'),
  ('hero.cta_secondary_text',  'O Livro'),
  ('hero.cta_secondary_href',  '/livro/01'),

  -- Seções da home
  ('section.personagens.label', 'Personagens'),
  ('section.personagens.title', 'Os seres do Akwu'),
  ('section.biblia.label',      'Bíblia do Mundo'),
  ('section.biblia.title',      'O arquivo vivo'),
  ('section.livro.label',       'Livro'),
  ('section.livro.title',       'O Peso da Luz'),
  ('section.contos.label',      'Contos'),
  ('section.contos.title',      'Vozes do Akwu'),

  -- Footer
  ('footer.copyright', 'Todos os direitos reservados a Thaís Teófilo'),

  -- Títulos dos cards da Bíblia
  ('biblia.parte-00.title', 'Introdução'),
  ('biblia.parte-01.title', 'Física e Cosmologia'),
  ('biblia.parte-02.title', 'Geografia'),
  ('biblia.parte-03.title', 'Ecossistema'),
  ('biblia.parte-04.title', 'Criaturas'),
  ('biblia.parte-05.title', 'Personagens'),
  ('biblia.parte-06.title', 'Regras'),
  ('biblia.parte-07.title', 'Cultura'),
  ('biblia.parte-08.title', 'Linha do Tempo'),

  -- Títulos dos cards do Livro
  ('livro.01.title',      'Capítulo 1'),
  ('livro.02.title',      'Capítulo 2'),
  ('livro.03.title',      'Capítulo 3'),
  ('livro.04.title',      'Capítulo 4'),
  ('livro.05.title',      'Capítulo 5'),
  ('livro.06.title',      'Capítulo 6'),
  ('livro.epilogo.title', 'Epílogo')

ON CONFLICT (key) DO NOTHING;
