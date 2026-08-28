import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Star, Clock, GripVertical } from "lucide-react";
import {
  candidatosIniciales,
  etapas,
  metricas,
  type Candidato,
  type Etapa,
} from "@/data/malinalli";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Panel de Control RH — Malinalli ATS" },
      {
        name: "description",
        content:
          "Tablero Kanban de reclutamiento con las etapas Postulado, Filtro, Entrevista, Oferta y Contratado.",
      },
      { property: "og:title", content: "Panel de Control RH — Malinalli ATS" },
      {
        property: "og:description",
        content: "Gestiona el pipeline de talento de Malinalli en un tablero Kanban de 5 columnas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelRh,
});

const etiquetaClases: Record<string, string> = {
  Nuevo: "bg-primary text-primary-foreground",
  Urgente: "bg-destructive text-destructive-foreground",
  Top: "bg-success/20 text-success",
  Sustituto: "bg-accent text-accent-foreground",
};

function PanelRh() {
  const [candidatos, setCandidatos] = useState<Candidato[]>(candidatosIniciales);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [sobre, setSobre] = useState<Etapa | null>(null);

  const mover = (id: string, etapa: Etapa) =>
    setCandidatos((cs) => cs.map((c) => (c.id === id ? { ...c, etapa } : c)));

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-primary sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Pipeline principal de reclutamiento</p>
        </div>
        <button className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" /> Crear vacante
        </button>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map((m) => (
          <div key={m.label} className="panel p-4">
            <p className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              {m.label}
            </p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{m.valor}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.detalle}</p>
          </div>
        ))}
      </section>

      <h2 className="mb-3 text-lg font-semibold">Pipeline principal</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {etapas.map((etapa) => {
          const items = candidatos.filter((c) => c.etapa === etapa);
          return (
            <section
              key={etapa}
              onDragOver={(e) => {
                e.preventDefault();
                setSobre(etapa);
              }}
              onDragLeave={() => setSobre((s) => (s === etapa ? null : s))}
              onDrop={() => {
                if (arrastrando) mover(arrastrando, etapa);
                setArrastrando(null);
                setSobre(null);
              }}
              className={`rounded-xl border p-3 transition-colors ${
                sobre === etapa
                  ? "border-primary bg-accent/40"
                  : "border-border bg-surface"
              }`}
            >
              <header className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {etapa}
                </span>
                <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </header>

              <div className="space-y-3">
                {items.map((c) => (
                  <article
                    key={c.id}
                    draggable
                    onDragStart={() => setArrastrando(c.id)}
                    onDragEnd={() => setArrastrando(null)}
                    className={`panel cursor-grab p-3 active:cursor-grabbing ${
                      arrastrando === c.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                        {c.iniciales}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{c.nombre}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.puesto}</p>
                      </div>
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>

                    <p className="mt-2 truncate text-[11px] text-muted-foreground">
                      {c.vacante}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {c.etiqueta && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${etiquetaClases[c.etiqueta]}`}
                        >
                          {c.etiqueta}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {c.antiguedad}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[11px] text-primary">
                        <Star className="h-3 w-3" fill="currentColor" /> {c.match}%
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <select
                        aria-label={`Mover a ${c.nombre}`}
                        value={c.etapa}
                        onChange={(e) => mover(c.id, e.target.value as Etapa)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1 text-[11px] outline-none focus:border-primary"
                      >
                        {etapas.map((e) => (
                          <option key={e} value={e}>
                            Mover a {e}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}

                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    Arrastra candidatos aquí
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
