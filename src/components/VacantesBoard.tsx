import { useEffect, useMemo, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Briefcase, Clock, MapPin, Radio, Plus, Send, CheckCircle } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { EstadoVacante, Vacante } from "@/types/database";
import { useAuth } from "@/lib/auth";
import { useAtsStore, VACANTES_DEFAULT } from "@/lib/atsStore";
import { ModalCrearVacante } from "@/components/ModalCrearVacante";
import { ModalPostularse } from "@/components/ModalPostularse";

const MARRON = "#1C0D0A";
const ORO = "#F5B800";

const COLUMNAS: { estado: EstadoVacante; titulo: string }[] = [
  { estado: "abierta", titulo: "Abiertas" },
  { estado: "cerrada", titulo: "Cerradas" },
];

function esVacante(valor: unknown): valor is Vacante {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const fila = valor as Partial<Vacante>;
  return (
    typeof fila.id === "string" &&
    typeof fila.titulo === "string" &&
    typeof fila.departamento === "string" &&
    typeof fila.ubicacion === "string" &&
    typeof fila.tipo_jornada === "string" &&
    typeof fila.descripcion === "string" &&
    (fila.estado === "abierta" || fila.estado === "cerrada") &&
    typeof fila.created_at === "string"
  );
}

function aplicarCambio(
  previas: Vacante[],
  payload: RealtimePostgresChangesPayload<Vacante>,
): Vacante[] {
  if (payload.eventType === "INSERT" && esVacante(payload.new)) {
    if (previas.some((v) => v.id === payload.new.id)) {
      return previas;
    }
    return [payload.new, ...previas];
  }

  if (payload.eventType === "UPDATE" && esVacante(payload.new)) {
    const actualizada = payload.new;
    const existe = previas.some((v) => v.id === actualizada.id);
    if (!existe) {
      return [actualizada, ...previas];
    }
    return previas.map((v) => (v.id === actualizada.id ? actualizada : v));
  }

  if (payload.eventType === "DELETE") {
    const id = "id" in payload.old ? payload.old.id : undefined;
    if (typeof id !== "string") {
      return previas;
    }
    return previas.filter((v) => v.id !== id);
  }

  return previas;
}

function TarjetaVacante({
  vacante,
  esRh,
  onPostularse,
  onAlternarEstado,
}: {
  vacante: Vacante;
  esRh: boolean;
  onPostularse: (vacante: Vacante) => void;
  onAlternarEstado: (vacante: Vacante) => void;
}) {
  return (
    <article
      className="flex flex-col gap-2 rounded-xl border p-4 transition-all duration-200 hover:border-[#F5B800]"
      style={{ backgroundColor: MARRON, borderColor: `${ORO}55` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="w-fit rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
          style={{ backgroundColor: ORO, color: MARRON }}
        >
          {vacante.departamento}
        </span>

        {esRh && (
          <button
            type="button"
            onClick={() => onAlternarEstado(vacante)}
            className="text-[11px] font-medium text-[#F5B800]/80 transition-colors hover:text-[#F5B800] hover:underline"
          >
            {vacante.estado === "abierta" ? "Cerrar vacante" : "Reabrir vacante"}
          </button>
        )}
      </div>

      <h3 className="text-sm font-semibold md:text-base" style={{ color: ORO }}>
        {vacante.titulo}
      </h3>

      <ul className="space-y-1 text-xs text-[#F5B800]/80">
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
          Estado: <strong className="capitalize">{vacante.estado}</strong>
        </li>
      </ul>

      <p className="text-xs leading-relaxed text-white/75">{vacante.descripcion}</p>

      {vacante.estado === "abierta" && (
        <div className="mt-2 flex items-center justify-between border-t border-[#F5B800]/20 pt-2.5">
          <span className="text-[11px] text-white/50">Postulación activa</span>
          <button
            type="button"
            onClick={() => onPostularse(vacante)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: ORO, color: MARRON }}
          >
            <Send className="h-3 w-3" /> Postularme
          </button>
        </div>
      )}
    </article>
  );
}

export function VacantesBoard() {
  const { usuario } = useAuth();
  const { vacantes: vacantesStore, actualizarEstadoVacante } = useAtsStore();

  // Renderizado instantáneo (0ms): se inicia directamente con las vacantes en memoria / localStorage
  const [vacantes, setVacantes] = useState<Vacante[]>(() =>
    vacantesStore.length > 0 ? vacantesStore : VACANTES_DEFAULT,
  );
  // Solo mostrar cargando si verdaderamente no hay vacantes disponibles en memoria
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [enVivo, setEnVivo] = useState(false);

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [vacanteParaPostularse, setVacanteParaPostularse] = useState<Vacante | null>(null);

  const esRh = usuario?.rol === "rh";

  // Mantener sincronizado el estado local con atsStore en tiempo real
  useEffect(() => {
    if (vacantesStore && vacantesStore.length > 0) {
      setVacantes(vacantesStore);
    }
  }, [vacantesStore]);

  // Consulta en segundo plano sin bloquear la interfaz
  useEffect(() => {
    let cancelado = false;

    async function cargarSegundoPlano() {
      if (!isSupabaseConfigured) {
        return;
      }

      try {
        // Timeout de 1200ms para evitar esperas por DNS no resuelto o fallas de conexión
        const peticionSupabase = supabase
          .from("vacantes")
          .select("id, titulo, departamento, ubicacion, tipo_jornada, descripcion, estado, created_at")
          .order("created_at", { ascending: false });

        const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Timeout rápido Supabase") }), 1200),
        );

        const { data, error: consultaError } = await Promise.race([peticionSupabase, timeout]);

        if (cancelado) return;

        if (consultaError) {
          console.warn("Supabase no disponible o timeout (mostrando datos locales inmediatos):", consultaError.message);
        } else if (data && data.length > 0) {
          setVacantes(data);
        }
      } catch (err) {
        if (cancelado) return;
        console.warn("Falla de red con Supabase (manteniendo datos locales):", err);
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void cargarSegundoPlano();

    let canal: ReturnType<typeof supabase.channel> | null = null;
    try {
      canal = supabase
        .channel("vacantes-board")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vacantes" },
          (payload: RealtimePostgresChangesPayload<Vacante>) => {
            setVacantes((previas) => aplicarCambio(previas, payload));
          },
        )
        .subscribe((status) => {
          setEnVivo(status === "SUBSCRIBED");
        });
    } catch {
      // Ignorar error si no resuelve websocket
    }

    return () => {
      cancelado = true;
      if (canal) {
        void supabase.removeChannel(canal);
      }
    };
  }, []);

  const alternarEstadoVacante = (vacante: Vacante) => {
    const nuevo = vacante.estado === "abierta" ? "cerrada" : "abierta";
    actualizarEstadoVacante(vacante.id, nuevo);
    setVacantes((prev) =>
      prev.map((v) => (v.id === vacante.id ? { ...v, estado: nuevo } : v)),
    );
  };

  const porEstado = useMemo(() => {
    const mapa: Record<EstadoVacante, Vacante[]> = { abierta: [], cerrada: [] };
    for (const vacante of vacantes) {
      if (mapa[vacante.estado]) {
        mapa[vacante.estado].push(vacante);
      }
    }
    return mapa;
  }, [vacantes]);

  if (cargando && vacantes.length === 0) {
    return (
      <p className="rounded-xl border border-[#F5B800]/30 bg-[#1C0D0A] p-8 text-center text-sm text-[#F5B800]/80">
        Cargando tablero de vacantes…
      </p>
    );
  }

  if (error && vacantes.length === 0) {
    return (
      <p className="rounded-xl border border-destructive/40 bg-[#1C0D0A] p-8 text-center text-sm text-destructive">
        {error}
      </p>
    );
  }

  return (
    <section className="space-y-4">
      {/* Barra de cabecera con indicadores y botón para subir vacantes para RH */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F5B800]/20 bg-[#1C0D0A] p-3">
        <div className="flex items-center gap-3">
          <p className="text-xs font-bold tracking-[0.18em] text-[#F5B800]/90">
            TABLERO DE VACANTES
          </p>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              borderColor: enVivo ? ORO : `${ORO}40`,
              color: enVivo ? ORO : `${ORO}99`,
              backgroundColor: MARRON,
            }}
          >
            <Radio className={`h-3 w-3 ${enVivo ? "animate-pulse" : ""}`} />
            {enVivo ? "En vivo (Supabase)" : "Modo Local / Demo"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {esRh ? (
            <button
              type="button"
              onClick={() => setModalCrearAbierto(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORO, color: MARRON }}
            >
              <Plus className="h-3.5 w-3.5" /> Subir nueva vacante (RH)
            </button>
          ) : (
            <span className="text-xs text-white/60">
              Sesión: <strong className="text-[#F5B800]">{usuario?.nombre || "Candidato"}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Columnas Kanban: Abiertas y Cerradas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {COLUMNAS.map((columna) => {
          const items = porEstado[columna.estado];
          return (
            <div
              key={columna.estado}
              className="rounded-xl border p-3 md:p-4"
              style={{ backgroundColor: "#2A1612", borderColor: `${ORO}33` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: ORO }}>
                  {columna.titulo}
                </h2>
                <span className="text-xs text-[#F5B800]/70">{items.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[#F5B800]/25 p-4 text-center text-xs text-white/50">
                    Sin vacantes {columna.estado === "abierta" ? "abiertas" : "cerradas"}.
                  </p>
                ) : (
                  items.map((vacante) => (
                    <TarjetaVacante
                      key={vacante.id}
                      vacante={vacante}
                      esRh={esRh}
                      onPostularse={(v) => setVacanteParaPostularse(v)}
                      onAlternarEstado={alternarEstadoVacante}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para que RH suba una nueva vacante */}
      <ModalCrearVacante
        open={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
      />

      {/* Modal para que el candidato se postule */}
      <ModalPostularse
        vacante={vacanteParaPostularse}
        open={Boolean(vacanteParaPostularse)}
        onClose={() => setVacanteParaPostularse(null)}
      />
    </section>
  );
}
