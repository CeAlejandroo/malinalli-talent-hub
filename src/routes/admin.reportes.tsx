import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { TrendingUp, Users, Briefcase, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { useAtsStore } from "@/lib/atsStore";
import { etapas, type Etapa } from "@/data/malinalli";

export const Route = createFileRoute("/admin/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y Analítica — Malinalli ATS" },
      {
        name: "description",
        content:
          "Analítica en tiempo real de reclutamiento de Malinalli: tasa de conversión, embudo de candidatos y desglose por vacante.",
      },
      { property: "og:title", content: "Reportes y Analítica — Malinalli ATS" },
      {
        property: "og:description",
        content: "Métricas dinámicas y rendimiento del proceso de selección de Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reportes,
});

function Reportes() {
  const { candidatos, vacantes } = useAtsStore();

  const totalCandidatos = candidatos.length;
  const vacantesActivas = vacantes.filter((v) => v.estado === "abierta").length;
  const contratados = candidatos.filter((c) => c.etapa === "Contratado").length;
  const enEntrevista = candidatos.filter((c) => c.etapa === "Entrevista").length;
  const enOferta = candidatos.filter((c) => c.etapa === "Oferta").length;
  const enFiltro = candidatos.filter((c) => c.etapa === "Filtro").length;
  const enPostulado = candidatos.filter((c) => c.etapa === "Postulado").length;

  const tasaConversion =
    totalCandidatos > 0 ? ((contratados / totalCandidatos) * 100).toFixed(1) : "0.0";

  const promedioPorVacante =
    vacantes.length > 0 ? (totalCandidatos / vacantes.length).toFixed(1) : "0.0";

  // Embudo acumulativo y activo calculado con datos reales
  const embudoCalculado = useMemo(() => {
    // Definición de etapas en orden del proceso
    const etapasOrdenadas: { etapa: Etapa; label: string; pesoMinimo: number }[] = [
      { etapa: "Postulado", label: "Postulación recibida", pesoMinimo: 0 },
      { etapa: "Filtro", label: "Filtro curricular", pesoMinimo: 1 },
      { etapa: "Entrevista", label: "Entrevista con equipo", pesoMinimo: 2 },
      { etapa: "Oferta", label: "Oferta extendida", pesoMinimo: 3 },
      { etapa: "Contratado", label: "Contratación concretada", pesoMinimo: 4 },
    ];

    const mapaPesos: Record<Etapa, number> = {
      Postulado: 0,
      Filtro: 1,
      Entrevista: 2,
      Oferta: 3,
      Contratado: 4,
    };

    return etapasOrdenadas.map((e) => {
      // Candidatos que alcanzaron al menos esta etapa en su trayectoria
      const acumulados = candidatos.filter((c) => (mapaPesos[c.etapa] ?? 0) >= e.pesoMinimo).length;
      // Candidatos que se encuentran actualmente en esta etapa
      const activosEnEtapa = candidatos.filter((c) => c.etapa === e.etapa).length;
      const pct = totalCandidatos > 0 ? Math.round((acumulados / totalCandidatos) * 100) : 0;

      return {
        etapa: e.etapa,
        label: e.label,
        activos: activosEnEtapa,
        acumulados,
        pct,
      };
    });
  }, [candidatos, totalCandidatos]);

  // Desglose de candidatos reales por vacante existente en base de datos
  const vacantesConConteo = useMemo(() => {
    return vacantes.map((v) => {
      const postulantesDeVacante = candidatos.filter(
        (c) => c.vacanteId === v.id || c.vacante === v.titulo || c.puesto === v.titulo,
      );
      return {
        ...v,
        totalPostulantes: postulantesDeVacante.length,
        enProceso: postulantesDeVacante.filter(
          (c) => c.etapa === "Filtro" || c.etapa === "Entrevista" || c.etapa === "Oferta",
        ).length,
        contratados: postulantesDeVacante.filter((c) => c.etapa === "Contratado").length,
      };
    });
  }, [vacantes, candidatos]);

  // Diagnóstico dinámico basado en los datos reales actuales
  const diagnosticoDinamico = useMemo(() => {
    if (totalCandidatos === 0) {
      return "Aún no se registran candidatos en la base de datos. Comparte el enlace de vacantes públicas para comenzar a captar talento.";
    }
    if (enPostulado > enEntrevista + enOferta) {
      return `Actualmente tienes ${enPostulado} candidato(s) en etapa inicial (Postulado). Se recomienda realizar el primer filtro técnico para acelerar el ciclo de selección.`;
    }
    if (enEntrevista > 0) {
      return `Cuentas con ${enEntrevista} candidato(s) en fase de entrevistas y ${enOferta} en propuesta de oferta. El flujo de talento muestra una progresión saludable.`;
    }
    if (contratados > 0) {
      return `Excelente avance: se han concretado ${contratados} contratación(es) exitosa(s) representando una tasa de efectividad del ${tasaConversion}%.`;
    }
    return `Hay ${totalCandidatos} postulaciones distribuidas a lo largo del proceso. Revisa las etapas en el tablero Kanban para dar seguimiento.`;
  }, [totalCandidatos, enPostulado, enEntrevista, enOferta, contratados, tasaConversion]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Reportes y Analítica</h1>
        <p className="text-sm text-muted-foreground">
          Rendimiento en tiempo real calculado a partir de la base de datos del ATS.
        </p>
      </header>

      {/* Tarjetas de Métricas Dinámicas */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">
              Total Candidatos
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-primary">{totalCandidatos}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {enPostulado} en espera de filtro inicial
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">
              Tasa de Conversión
            </span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-primary">{tasaConversion}%</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-success">
            {contratados} contratación(es) de {totalCandidatos} perfiles
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">
              Vacantes Activas
            </span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-primary">{vacantesActivas}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            De {vacantes.length} vacantes creadas en el sistema
          </p>
        </div>

        <div className="panel p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] tracking-[0.16em] uppercase font-semibold">
              Promedio por Vacante
            </span>
            <Award className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-3xl font-bold text-primary">
            {promedioPorVacante}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Postulantes promedio por posición</p>
        </div>
      </section>

      {/* Embudo Dinámico */}
      <section className="panel mb-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-primary">Embudo de Reclutamiento Real</h2>
            <p className="text-xs text-muted-foreground">
              Progresión y volumen de candidatos calculados directamente con la base de datos
            </p>
          </div>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-primary">
            {totalCandidatos} postulaciones totales
          </span>
        </div>

        <ul className="space-y-4">
          {embudoCalculado.map((e, i) => (
            <li key={e.etapa}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">
                  <span className="text-primary font-bold mr-1.5">{i + 1}.</span> {e.label} (
                  {e.etapa})
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  <strong className="text-foreground">{e.acumulados}</strong> acumulados ·{" "}
                  <strong className="text-primary">{e.activos}</strong> activos en etapa (
                  {e.pct}%)
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-accent/60">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(e.pct, totalCandidatos > 0 ? 3 : 0)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Diagnóstico inteligente basado en datos reales */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/30 bg-accent/30 p-3.5 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <div>
            <strong className="text-foreground block mb-0.5">Diagnóstico del Proceso:</strong>
            {diagnosticoDinamico}
          </div>
        </div>
      </section>

      {/* Tabla de Rendimiento por Vacante */}
      <section className="panel p-5">
        <h2 className="text-base font-bold text-primary mb-1">Distribución Real por Vacante</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Atracción de talento y progreso clasificado por cada vacante registrada.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Vacante</th>
                <th className="py-2.5 px-3">Departamento</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-center">Postulantes</th>
                <th className="py-2.5 px-3 text-center">En Proceso</th>
                <th className="py-2.5 px-3 text-center">Contratados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {vacantesConConteo.map((v) => (
                <tr key={v.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-foreground">{v.titulo}</td>
                  <td className="py-3 px-3 text-muted-foreground">{v.departamento}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        v.estado === "abierta"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-foreground">
                    {v.totalPostulantes}
                  </td>
                  <td className="py-3 px-3 text-center text-primary font-medium">{v.enProceso}</td>
                  <td className="py-3 px-3 text-center font-bold text-success">
                    {v.contratados > 0 ? `+${v.contratados}` : "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
