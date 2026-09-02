-- Malinalli ATS — Tabla de Usuarios y Roles
-- Solo las cuentas con rol = 'rh' creadas en base de datos tienen acceso a los paneles de administración.
-- Todo registro público de usuario nuevo recibe por defecto el rol = 'candidato'.

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  rol text not null default 'candidato' check (rol in ('candidato', 'rh')),
  telefono text,
  created_at timestamptz not null default now()
);

-- Permisos
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.usuarios to anon, authenticated;

-- RLS
alter table public.usuarios enable row level security;

drop policy if exists "Lectura de usuarios" on public.usuarios;
create policy "Lectura de usuarios"
  on public.usuarios
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Registro de candidatos" on public.usuarios;
create policy "Registro de candidatos"
  on public.usuarios
  for insert
  to anon, authenticated
  with check (rol = 'candidato');

-- Semilla de usuarios administrativos (RH) y candidatos
insert into public.usuarios (email, nombre, rol, telefono)
values
  ('rh@malinalli.mx', 'Alejandro RH', 'rh', '+52 55 9876 5432'),
  ('admin@malinalli.mx', 'Dirección de Talento RH', 'rh', '+52 55 9876 5431'),
  ('candidato@malinalli.mx', 'Sofía Valdés', 'candidato', '+52 55 1234 5678')
on conflict (email) do nothing;
