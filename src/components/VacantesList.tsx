import { useEffect, useState } from "react";
import { Briefcase, Clock, MapPin } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Vacante } from "@/types/database";
import { useAtsStore, VACANTES_DEFAULT } from "@/lib/atsStore";

const MARRON = "#1C0D0A";
const ORO = "#F5B800";

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fecha);
}

export function VacantesList() {
  const { vacantes: vacantesStore } = useAtsStore();
  const [vacantes, setVacantes] = useState<Vacante[]>(() => {
    const abiertas = (vacantesStore.length > 0 ? vacantesStore : VACANTES_DEFAULT).filter(
      (v) => v.estado === "abierta",
    );
    return abiertas;
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        const peticion = supabase
          .from("vacantes")
          .select("id, titulo, departamento, ubicacion, tipo_jornada, descripcion, estado, created_at")
          .eq("estado", "abierta")
          .order("created_at", { ascending: false });

        const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 1200),
        );

        const { data, error: consultaError } = await Promise.race([peticion, timeout]);

        if (cancelado) return;

        if (!consultaError && data && data.length > 0) {
          setError(null);
          setVacantes(data);
        }
      } catch {
        // mantener datos locales
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  if (cargando) {
    return (
      <p className="rounded-xl border border-[#F5B800]/30 bg-[#1C0D0A] p-8 text-center text-sm text-[#F5B800]/80">
        Cargando vacantes…
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-[#1C0D0A] p-8 text-center text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (vacantes.length === 0) {
    return (
      <p className="rounded-xl border border-[#F5B800]/30 bg-[#1C0D0A] p-8 text-center text-sm text-muted-foreground">
        No hay vacantes abiertas en este momento.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {vacantes.map((vacante) => (
        <article
          key={vacante.id}
          className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:border-[#F5B800]"
          style={{ backgroundColor: MARRON, borderColor: `${ORO}55` }}
        >
          <div>
            <span
              className="mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
              style={{ backgroundColor: ORO, color: MARRON }}
            >
              {vacante.departamento}
            </span>
            <h2 className="text-base font-semibold" style={{ color: ORO }}>
              {vacante.titulo}
            </h2>
          </div>

          <ul className="space-y-1 text-xs text-[#F5B800]/75">
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {vacante.ubicacion}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {vacante.tipo_jornada}
            </li>
            <li className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              Vacante {vacante.estado}
            </li>
          </ul>

          <p className="text-xs leading-relaxed text-white/80">{vacante.descripcion}</p>

          <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t pt-3" style={{ borderColor: `${ORO}33` }}>
            <span className="truncate text-[11px] text-[#F5B800]/70">
              Publicada {formatearFecha(vacante.created_at)}
            </span>
            <button
              type="button"
              className="shrink-0 rounded-md px-4 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORO, color: MARRON }}
            >
              Postularme
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
