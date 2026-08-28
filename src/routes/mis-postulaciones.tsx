import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { vacantes } from "@/data/malinalli";

export const Route = createFileRoute("/mis-postulaciones")({
  head: () => ({
    meta: [
      { title: "Mis postulaciones — Malinalli" },
      {
        name: "description",
        content: "Consulta el estatus de tus postulaciones en Malinalli Elite Recruitment.",
      },
      { property: "og:title", content: "Mis postulaciones — Malinalli" },
      {
        property: "og:description",
        content: "Sigue el avance de tus procesos de selección con Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MisPostulaciones,
});

const estatus = ["En revisión", "Filtro telefónico", "Entrevista agendada"] as const;

function MisPostulaciones() {
  const postulaciones = vacantes.slice(0, 3).map((v, i) => ({
    ...v,
    estatus: estatus[i % estatus.length],
  }));

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Mis postulaciones</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sigue el avance de cada proceso en el que participas.
        </p>

        <ul className="mt-6 space-y-3">
          {postulaciones.map((p) => (
            <li key={p.id} className="panel grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-primary">{p.titulo}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {p.empresa} · {p.ubicacion}
                </p>
              </div>
              <span className="self-start rounded-md bg-accent px-3 py-1 text-xs font-semibold text-primary">
                {p.estatus}
              </span>
            </li>
          ))}
        </ul>

        <Link
          to="/vacantes"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Ver más vacantes
        </Link>
      </main>
    </div>
  );
}
