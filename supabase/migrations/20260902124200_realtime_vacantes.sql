-- Habilita eventos Realtime (INSERT/UPDATE/DELETE) sobre vacantes.
do $$
begin
  alter publication supabase_realtime add table public.vacantes;
exception
  when duplicate_object then null;
end $$;
