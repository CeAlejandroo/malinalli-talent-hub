import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/vacantes")({
  head: () => ({
    meta: [
      { title: "Malinalli — Portal de vacantes y talento de alto rendimiento" },
      {
        name: "description",
        content:
          "Explora vacantes disponibles, forma parte de nuestro equipo",
      },
      { property: "og:title", content: "Malinalli — Portal de vacantes" },
      {
        property: "og:description",
        content: "Tu próximo empleo laboral podría estar aquí",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortalVacantes,
});

function PortalVacantes() {
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

        <App />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Malinalli El Sabor de los Dioses      </footer>
    </div>
  );
}
