-- Malinalli Talent Hub — esquema ATS (vacantes + postulantes)
-- Ejecutar en el SQL Editor de Supabase o vía CLI (`supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_vacante') then
    create type public.estado_vacante as enum ('abierta', 'cerrada');
  end if;
  if not exists (select 1 from pg_type where typname = 'estado_postulante') then
    create type public.estado_postulante as enum (
      'nuevo',
      'en_revision',
      'entrevista',
      'rechazado',
      'contratado'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table if not exists public.vacantes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  departamento text not null,
  ubicacion text not null,
  tipo_jornada text not null,
  descripcion text not null,
  estado public.estado_vacante not null default 'abierta',
  created_at timestamptz not null default now()
);

create table if not exists public.postulantes (
  id uuid primary key default gen_random_uuid(),
  vacante_id uuid not null references public.vacantes (id) on delete cascade,
  nombre_completo text not null,
  email text not null,
  telefono text,
  linkedin_url text,
  cv_url text,
  estado public.estado_postulante not null default 'nuevo',
  created_at timestamptz not null default now(),
  constraint postulantes_email_formato check (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index if not exists postulantes_vacante_id_idx on public.postulantes (vacante_id);
create index if not exists postulantes_estado_idx on public.postulantes (estado);
create index if not exists vacantes_estado_idx on public.vacantes (estado);
create index if not exists vacantes_created_at_idx on public.vacantes (created_at desc);

-- ---------------------------------------------------------------------------
-- Permisos (rol anónimo = tablero público)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table public.vacantes to anon, authenticated;
grant insert on table public.postulantes to anon, authenticated;

-- El dashboard de RH usará la service role o políticas adicionales más adelante.
revoke update, delete on table public.vacantes from anon, authenticated;
revoke select, update, delete on table public.postulantes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.vacantes enable row level security;
alter table public.postulantes enable row level security;

drop policy if exists "Lectura pública de vacantes" on public.vacantes;
create policy "Lectura pública de vacantes"
  on public.vacantes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Escritura pública de postulantes" on public.postulantes;
create policy "Escritura pública de postulantes"
  on public.postulantes
  for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- Datos de ejemplo (tablero público)
-- ---------------------------------------------------------------------------
insert into public.vacantes (titulo, departamento, ubicacion, tipo_jornada, descripcion, estado)
select *
from (
  values
    (
      'Senior Full Stack Developer',
      'Tecnología',
      'Remoto (México)',
      'Tiempo completo',
      'Experiencia sólida en React, Node y arquitecturas orientadas a servicios para liderar iniciativas de producto.',
      'abierta'::public.estado_vacante
    ),
    (
      'Diseñador UX/UI Senior',
      'Diseño',
      'Remoto, LATAM',
      'Tiempo completo',
      'Investigación, sistemas de diseño y prototipado de alta fidelidad para productos financieros.',
      'abierta'::public.estado_vacante
    ),
    (
      'Especialista en Marketing',
      'Marketing',
      'Presencial, Monterrey',
      'Medio tiempo',
      'Campañas de employer branding, contenido y gestión de comunidades de talento.',
      'abierta'::public.estado_vacante
    )
) as seed(titulo, departamento, ubicacion, tipo_jornada, descripcion, estado)
where not exists (select 1 from public.vacantes limit 1);
