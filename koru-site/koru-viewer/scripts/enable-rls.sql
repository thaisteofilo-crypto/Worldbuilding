-- ============================================================
-- Habilita Row-Level Security (RLS) em todas as tabelas públicas
-- ============================================================
-- Rodar este script UMA VEZ no SQL Editor do Supabase.
-- Resolve o alerta "Table publicly accessible / rls_disabled_in_public".
--
-- Estratégia:
-- Todas as tabelas são acessadas APENAS via API routes que usam o
-- service role key (SUPABASE_SERVICE_ROLE_KEY). O service role bypassa
-- RLS automaticamente, então nenhuma policy é necessária.
-- Acesso anônimo (browser/anon key) fica completamente bloqueado.
--
-- Pré-requisito: o site precisa estar usando as API routes para
-- tasks/documents (não mais o cliente Supabase direto no browser).
-- ============================================================

ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content  ENABLE ROW LEVEL SECURITY;

-- Limpa policies permissivas legadas (caso existam de versões anteriores)
DROP POLICY IF EXISTS documents_all          ON documents;
DROP POLICY IF EXISTS tasks_all              ON tasks;
DROP POLICY IF EXISTS gallery_metadata_read  ON gallery_metadata;
DROP POLICY IF EXISTS gallery_metadata_write ON gallery_metadata;
DROP POLICY IF EXISTS "Service role full access" ON image_positions;

-- Garante RLS nas tabelas que já tinham (sem policies)
ALTER TABLE image_positions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_metadata ENABLE ROW LEVEL SECURITY;

-- ---- Verificação ----
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies p WHERE p.tablename = t.tablename) AS policies
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
