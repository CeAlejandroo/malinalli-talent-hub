import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { embudo } from "@/data/malinalli";

export const Route = createFileRoute("/admin/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y Analítica — Malinalli ATS" },
      {
        name: "description",
        content:
          "Analítica de reclutamiento de Malinalli: tiempo de contratación, tasa de conversión y abandono del embudo.",
      },
      { property: "og:title", content: "Reportes y Analítica — Malinalli ATS" },
      {
        property: "og:description",
        content: "Rendimiento del proceso de reclutamiento en los últimos 30 días.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reportes,
});

function Reportes() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Analítica</h1>
        <p className="text-sm text-muted-foreground">
          Rendimiento de reclutamiento · últimos 30 días
        </p>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="panel p-4">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Tiempo de contratación
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-primary">18 días</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-success">
            <TrendingDown className="h-3.5 w-3.5" /> 2 días menos vs mes anterior
          </p>
        </div>
        <div className="panel p-4">
          <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Tasa de conversión
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-primary">4.2 %</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-success">
            <TrendingUp className="h-3.5 w-3.5" /> +0.5% vs mes anterior
          </p>
        </div>
      </section>

      <section className="panel p-4">
        <h2 className="text-base font-semibold">Abandono del embudo</h2>
        <p className="mb-4 text-xs text-muted-foreground">Candidatos activos por etapa</p>

        <ul className="space-y-4">
          {embudo.map((e, i) => (
            <li key={e.etapa}>
              <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm">
                <span className="truncate">
                  {i + 1}. {e.etapa}
                </span>
                <span className="shrink-0 text-muted-foreground">
                  {e.valor.toLocaleString("es-MX")} ({e.pct}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
                <div className="h-full rounded-full bg-primary" style={{ width: `${e.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-lg border border-primary/40 bg-accent/40 p-3 text-xs text-muted-foreground">
          La mayor caída (64%) ocurre antes de la entrevista inicial. Revisar criterios de filtrado
          automático.
        </p>
      </section>
    </main>
  );
}
