import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bookmark, MapPin, Clock, Search, Briefcase } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { vacantes, areas, modalidades } from "@/data/malinalli";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Malinalli — Portal de vacantes y talento de alto rendimiento" },
      {
        name: "description",
        content:
          "Explora vacantes de tecnología, diseño, ventas y finanzas en Malinalli Elite Recruitment y postúlate en minutos.",
      },
      { property: "og:title", content: "Malinalli — Portal de vacantes" },
      {
        property: "og:description",
        content: "Encuentra tu próximo desafío profesional con Malinalli Elite Recruitment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalVacantes,
});

function PortalVacantes() {
  const [q, setQ] = useState("");
  const [area, setArea] = useState("Todas");
  const [modalidad, setModalidad] = useState("Cualquiera");
  const [guardadas, setGuardadas] = useState<string[]>([]);

  const resultados = useMemo(
    () =>
      vacantes.filter(
        (v) =>
          (area === "Todas" || v.area === area) &&
          (modalidad === "Cualquiera" || v.modalidad === modalidad) &&
          (v.titulo + v.empresa).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, area, modalidad],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-primary sm:text-4xl">
            Encuentra tu próximo desafío
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Oportunidades diseñadas para profesionales de alto rendimiento. Postulación
            transparente, acompañamiento humano.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="panel h-fit p-4">
            <label className="relative block">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar vacante..."
                className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </label>

            <p className="mt-5 mb-2 text-[11px] tracking-[0.18em] text-muted-foreground">
              DEPARTAMENTO
            </p>
            <ul className="space-y-1">
              {areas.map((a) => (
                <li key={a}>
                  <button
                    onClick={() => setArea(a)}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
                      area === a
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent/60"
                    }`}
                  >
                    <span>{a}</span>
                    <span className="text-xs">
                      {a === "Todas"
                        ? vacantes.length
                        : vacantes.filter((v) => v.area === a).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-5 mb-2 text-[11px] tracking-[0.18em] text-muted-foreground">
              UBICACIÓN
            </p>
            <ul className="space-y-1">
              {modalidades.map((m) => (
                <li key={m}>
                  <button
                    onClick={() => setModalidad(m)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      modalidad === m
                        ? "bg-accent text-primary"
                        : "text-muted-foreground hover:bg-accent/60"
                    }`}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section>
            <p className="mb-3 text-right text-xs text-muted-foreground">
              Mostrando {resultados.length} resultados
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {resultados.map((v) => (
                <article
                  key={v.id}
                  className="panel flex flex-col gap-3 p-4 transition-colors hover:border-primary/60"
                >
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                    <div className="min-w-0">
                      {v.destacada && (
                        <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground">
                          NUEVO
                        </span>
                      )}
                      <h2 className="truncate text-base font-semibold text-primary">
                        {v.titulo}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">{v.empresa}</p>
                    </div>
                    <button
                      aria-label="Guardar vacante"
                      onClick={() =>
                        setGuardadas((g) =>
                          g.includes(v.id) ? g.filter((x) => x !== v.id) : [...g, v.id],
                        )
                      }
                      className={`shrink-0 ${
                        guardadas.includes(v.id) ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <Bookmark
                        className="h-4 w-4"
                        fill={guardadas.includes(v.id) ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {v.ubicacion}
                    </li>
                    <li className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" /> {v.salario}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" /> {v.jornada}
                    </li>
                  </ul>

                  <p className="text-xs leading-relaxed text-muted-foreground/90">
                    {v.descripcion}
                  </p>

                  <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border pt-3">
                    <span className="truncate text-[11px] text-muted-foreground">
                      Publicada {v.publicada.toLowerCase()}
                    </span>
                    <button className="shrink-0 rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90">
                      Postularme
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {resultados.length === 0 && (
              <p className="panel p-8 text-center text-sm text-muted-foreground">
                No hay vacantes que coincidan con tu búsqueda.
              </p>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Malinalli Elite Recruitment · Talento que transforma organizaciones
      </footer>
    </div>
  );
}
