-- ============================================================
-- Habilita Row-Level Security (RLS) em todas as tabelas públicas
-- ============================================================
-- Rodar este script UMA VEZ no SQL Editor do Supabase.
-- Resolve o alerta "Table publicly accessible / rls_disabled_in_public".
--
-- Versão defensiva: itera sobre todas as tabelas existentes no schema
-- public, habilita RLS em cada uma e remove policies que existirem.
-- Service role bypassa RLS, então o backend continua funcionando;
-- acesso anônimo (anon key no browser) fica completamente bloqueado.
-- ============================================================

DO $$
DECLARE
  t record;
  p record;
BEGIN
  -- Habilita RLS em todas as tabelas do schema public
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;

  -- Remove TODAS as policies existentes no schema public (deixa só service role)
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END
$$;

-- Verificação
SELECT
  tablename,
  rowsecurity AS rls_enabled,
  (SELECT count(*) FROM pg_policies p WHERE p.tablename = t.tablename AND p.schemaname = 'public') AS policies
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;
