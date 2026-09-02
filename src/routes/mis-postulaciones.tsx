import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { useAtsStore } from "@/lib/atsStore";
import { useAuth } from "@/lib/auth";
import { Briefcase, Calendar, CheckCircle2, Clock } from "lucide-react";

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

function MisPostulaciones() {
  const { postulaciones } = useAtsStore();
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">Mis postulaciones</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sigue el avance en tiempo real de tus procesos de selección.
            </p>
          </div>
          {usuario && (
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Candidato: {usuario.nombre}
            </span>
          )}
        </div>

        {postulaciones.length === 0 ? (
          <div className="panel mt-8 p-8 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">Aún no te has postulado a ninguna vacante.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Explora el tablero y postúlate a las posiciones activas.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {postulaciones.map((p) => (
              <li key={p.id} className="panel grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-primary">{p.vacanteTitulo}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.empresa} · {p.ubicacion}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> Postulado: {p.fecha}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Clock className="h-3 w-3" /> {p.estatus}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/vacantes"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Explorar más vacantes
        </Link>
      </main>
    </div>
  );
}
