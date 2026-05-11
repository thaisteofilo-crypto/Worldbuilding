-- 006: koru_chat_conversations
-- Histórico das conversas do chatbot público do mundo de Korú.
-- Anônimo: salva session_id (cookie), user_agent truncado, e o array de mensagens.
-- Não salva IP nem dados identificáveis.

create table if not exists public.koru_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_agent text,
  message_count int generated always as (jsonb_array_length(messages)) stored
);

create index if not exists idx_koru_chat_session on public.koru_chat_conversations(session_id);
create index if not exists idx_koru_chat_created on public.koru_chat_conversations(created_at desc);
create index if not exists idx_koru_chat_updated on public.koru_chat_conversations(updated_at desc);
