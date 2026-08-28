import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Star, MoreVertical } from "lucide-react";
import { candidatosIniciales, etapas } from "@/data/malinalli";

export const Route = createFileRoute("/rh/candidatos")({
  head: () => ({
    meta: [
      { title: "Gestión de Candidatos — Malinalli ATS" },
      {
        name: "description",
        content:
          "Tabla de candidatos de Malinalli con etapa del proceso, calificación y vacante asociada.",
      },
      { property: "og:title", content: "Gestión de Candidatos — Malinalli ATS" },
      {
        property: "og:description",
        content: "Gestiona y evalúa el talento en proceso dentro del ATS de Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Candidatos,
});

function Candidatos() {
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState<string>("Todas");

  const filtrados = useMemo(
    () =>
      candidatosIniciales.filter(
        (c) =>
          (etapa === "Todas" || c.etapa === etapa) &&
          (c.nombre + c.puesto + c.vacante).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, etapa],
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Candidatos</h1>
        <p className="text-sm text-muted-foreground">Gestiona y evalúa el talento en proceso.</p>
      </header>

      <div className="mb-4 grid gap-3 sm:flex sm:items-center">
        <label className="relative block w-full sm:max-w-xs">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar candidatos, vacantes..."
            className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {["Todas", ...etapas].map((e) => (
            <button
              key={e}
              onClick={() => setEtapa(e)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                etapa === e
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border text-xs tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Candidato</th>
              <th className="px-4 py-3 font-medium">Vacante</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Calificación</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
              <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-accent/40">
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                      {c.iniciales}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.puesto}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="truncate">{c.vacante}</p>
                  <p className="text-xs text-muted-foreground">{c.antiguedad}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-primary/50 px-2 py-0.5 text-xs text-primary">
                    {c.etapa}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-xs text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(c.match / 20) ? "text-primary" : "text-muted-foreground"
                        }`}
                        fill={i < Math.round(c.match / 20) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-1 text-muted-foreground">{c.match}%</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    aria-label={`Acciones para ${c.nombre}`}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Mostrando {filtrados.length} de {candidatosIniciales.length} candidatos
      </p>
    </main>
  );
}
