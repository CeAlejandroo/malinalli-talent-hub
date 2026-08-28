import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";

export const Route = createFileRoute("/admin/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes con candidatos — Malinalli ATS" },
      {
        name: "description",
        content:
          "Bandeja de conversaciones entre el equipo de reclutamiento de Malinalli y los candidatos en proceso.",
      },
      { property: "og:title", content: "Mensajes con candidatos — Malinalli ATS" },
      {
        property: "og:description",
        content: "Coordina entrevistas y da seguimiento a los candidatos desde una sola bandeja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MensajesPage,
});

type Conversacion = {
  id: string;
  nombre: string;
  vacante: string;
  hora: string;
  mensajes: { de: "rh" | "candidato"; texto: string }[];
};

const conversaciones: Conversacion[] = [
  {
    id: "c1",
    nombre: "Ana Lucía Ramírez",
    vacante: "Senior Full Stack Developer",
    hora: "10:24",
    mensajes: [
      { de: "candidato", texto: "Hola, ¿sigue abierta la vacante remota?" },
      { de: "rh", texto: "¡Hola Ana! Sí, seguimos en etapa de filtro. ¿Puedes el jueves 11:00?" },
      { de: "candidato", texto: "Perfecto, agendo el jueves." },
    ],
  },
  {
    id: "c2",
    nombre: "Diego Fernández",
    vacante: "Cloud Architecture Lead",
    hora: "09:02",
    mensajes: [
      { de: "rh", texto: "Diego, compartimos la propuesta económica por correo." },
      { de: "candidato", texto: "Gracias, la reviso hoy mismo." },
    ],
  },
  {
    id: "c3",
    nombre: "Mariana Solís",
    vacante: "Director of Enterprise Sales",
    hora: "Ayer",
    mensajes: [{ de: "candidato", texto: "¿Cuándo tendrían retroalimentación de la entrevista?" }],
  },
];

function MensajesPage() {
  const [activa, setActiva] = useState(conversaciones[0]!.id);
  const [texto, setTexto] = useState("");
  const conversacion = conversaciones.find((c) => c.id === activa)!;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary sm:text-3xl">Mensajes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Comunicación directa con las personas candidatas en proceso.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel h-fit p-2">
          {conversaciones.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiva(c.id)}
              className={`w-full rounded-md p-3 text-left transition-colors ${
                c.id === activa ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <span className="truncate text-sm font-semibold text-foreground">{c.nombre}</span>
                <span className="text-[11px] text-muted-foreground">{c.hora}</span>
              </span>
              <span className="block truncate text-xs text-muted-foreground">{c.vacante}</span>
            </button>
          ))}
        </aside>

        <section className="panel flex min-h-[420px] flex-col p-4">
          <header className="border-b border-border pb-3">
            <h2 className="text-sm font-semibold text-primary">{conversacion.nombre}</h2>
            <p className="text-xs text-muted-foreground">{conversacion.vacante}</p>
          </header>

          <div className="flex-1 space-y-3 py-4">
            {conversacion.mensajes.map((m, i) => (
              <p
                key={i}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  m.de === "rh"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {m.texto}
              </p>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTexto("");
            }}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-t border-border pt-3"
          >
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
