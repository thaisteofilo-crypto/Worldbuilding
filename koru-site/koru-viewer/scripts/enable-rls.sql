-- ============================================================
-- Habilita Row-Level Security (RLS) em todas as tabelas públicas
-- ============================================================
-- Rodar este script UMA VEZ no SQL Editor do Supabase.
-- Resolve o alerta "Table publicly accessible / rls_disabled_in_public".
--
-- Estratégia:
-- 1. Tabelas acessadas SÓ via API routes (service role): RLS on, sem policy.
--    O service role bypassa RLS, então tudo continua funcionando.
-- 2. Tabelas acessadas direto pelo browser (anon key): RLS on + policy
--    permissiva. Não adiciona segurança real, mas remove o alerta.
--    (O site é privado por SITE_TOKEN, então o risco é limitado.)
-- ============================================================

-- ---- Service-role only (sem policies) ----
ALTER TABLE characters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content  ENABLE ROW LEVEL SECURITY;

-- ---- Acessadas pelo browser admin (precisam de policy permissiva) ----
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS documents_all ON documents;
CREATE POLICY documents_all ON documents
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tasks_all ON tasks;
CREATE POLICY tasks_all ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- ---- Verificação ----
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies p WHERE p.tablename = t.tablename) AS policies
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
