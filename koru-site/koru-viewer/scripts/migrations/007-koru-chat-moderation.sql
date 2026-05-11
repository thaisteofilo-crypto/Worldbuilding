-- 007: koru_chat_conversations — colunas de moderação
-- Permite esconder conversas da listagem pública /perguntas-ao-mundo
-- sem deletá-las. Default: visível.
--
-- - is_hidden: se true, a conversa não aparece em /perguntas-ao-mundo
--   nem em /api/koru-chat/history (lado do visitante).
-- - hidden_at: timestamp da última vez que foi escondida.
-- - hidden_reason: razão livre, opcional (uso interno).
--
-- Aplicar no Supabase Studio antes de subir o código novo, senão
-- as queries que filtram por is_hidden retornarão erro de coluna inexistente.

alter table public.koru_chat_conversations
  add column if not exists is_hidden boolean not null default false,
  add column if not exists hidden_at timestamptz,
  add column if not exists hidden_reason text;

-- Índice para a listagem pública (filtra is_hidden = false e ordena por updated_at).
create index if not exists idx_koru_chat_public_feed
  on public.koru_chat_conversations(updated_at desc)
  where is_hidden = false;
