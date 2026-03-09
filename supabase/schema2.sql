-- Modificar a tabela leads caso ainda existisse
drop table if exists public.leads cascade;

-- Tabela de Colunas Dinamicas para o Kanban
create table public.columns (
  id text primary key,
  title text not null,
  order_index integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Leads reconstruída com todas as propriedades do CRM
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  column_id text references public.columns(id) on delete cascade not null,
  company_name text,
  contact_name text,
  phone text unique,
  message text,
  company_info text,
  nicho text,
  lead_origin text,
  proof_link text,
  website text,
  test_result text,
  generated_messages jsonb,
  order_index integer not null default 0,
  is_ai_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.columns enable row level security;
alter table public.leads enable row level security;
create policy "Enable full access to all for now MVP" on public.columns for all using (true);
create policy "Enable full access to all for now MVP" on public.leads for all using (true);
