-- Enable pgvector extension for RAG (Base de Conhecimento)
create extension if not exists vector;

-- Tabela de Configurações do Agente de IA
create table public.agent_settings (
  id uuid primary key default gen_random_uuid(),
  system_prompt text not null default 'Você é a Ana, assistente virtual da Bosco.',
  active boolean default false,
  message_delay_minutes integer default 2,
  max_daily_messages integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Leads (Contatos do Kanban)
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  column_id text not null, -- Ex: 'lead', 'qualificacao', 'agendado'
  is_ai_active boolean default true, -- Se o humano assumir, isso vira false
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Histórico de Mensagens (O Cérebro de Memória)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela para os Roteiros/Objeções
create table public.agent_scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  script_type text not null check (script_type in ('roteiro', 'objecao')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela para a Base de Conhecimento (RAG / Vector Store)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(1536) -- Para uso com text-embedding-3-small (OpenAI)
);

-- Row Level Security (RLS) habilitada para garantir segurança, mas por ser um MVP interno,
-- você pode configurar políticas permissivas ou consumir via Service Role Key no server-side.
alter table public.agent_settings enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.agent_scripts enable row level security;
alter table public.documents enable row level security;

create policy "Enable full access to all for now MVP" on public.agent_settings for all using (true);
create policy "Enable full access to all for now MVP" on public.leads for all using (true);
create policy "Enable full access to all for now MVP" on public.messages for all using (true);
create policy "Enable full access to all for now MVP" on public.agent_scripts for all using (true);
create policy "Enable full access to all for now MVP" on public.documents for all using (true);
