-- Idempotente: tablas ya existen; aplica GRANT, RLS, realtime y seed.

grant usage on schema public to anon, authenticated;
grant select on table public.vacantes to anon, authenticated;
grant insert on table public.postulantes to anon, authenticated;

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

do $$
begin
  alter publication supabase_realtime add table public.vacantes;
exception
  when duplicate_object then null;
end $$;

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
