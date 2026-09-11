-- Malinalli Talent Hub — Esquema de Mensajes ATS
-- Vincula conversaciones y mensajes directos entre RH y candidatos

create table if not exists public.mensajes (
  id uuid primary key default gen_random_uuid(),
  postulante_id uuid references public.postulantes (id) on delete cascade,
  de text not null check (de in ('rh', 'candidato')),
  texto text not null,
  leido boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists mensajes_postulante_id_idx on public.mensajes (postulante_id);
create index if not exists mensajes_created_at_idx on public.mensajes (created_at asc);

-- Permisos
grant usage on schema public to anon, authenticated;
grant select, insert on table public.mensajes to anon, authenticated;

-- RLS
alter table public.mensajes enable row level security;

drop policy if exists "Lectura de mensajes" on public.mensajes;
create policy "Lectura de mensajes"
  on public.mensajes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Insercion de mensajes" on public.mensajes;
create policy "Insercion de mensajes"
  on public.mensajes
  for insert
  to anon, authenticated
  with check (true);
