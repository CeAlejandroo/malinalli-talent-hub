import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { Send, User, Briefcase, Mail, MessageSquare, CheckCheck, Clock } from "lucide-react";
import { useAtsStore } from "@/lib/atsStore";

export const Route = createFileRoute("/admin/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes con candidatos — Malinalli ATS" },
      {
        name: "description",
        content:
          "Bandeja de conversaciones reales entre el equipo de reclutamiento de Malinalli y los candidatos en proceso.",
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

function MensajesPage() {
  const { conversaciones, candidatos, enviarMensaje } = useAtsStore();
  const [activaId, setActivaId] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finMensajesRef = useRef<HTMLDivElement>(null);

  // Asegurar selección de conversación activa válida
  const conversacion = useMemo(() => {
    if (conversaciones.length === 0) return null;
    const encontrada = conversaciones.find((c) => c.id === activaId);
    return encontrada || conversaciones[0];
  }, [conversaciones, activaId]);

  // Candidato asociado para obtener etapa y datos adicionales
  const candidatoAsociado = useMemo(() => {
    if (!conversacion) return null;
    return candidatos.find((c) => c.id === conversacion.candidatoId);
  }, [candidatos, conversacion]);

  // Scroll automático al último mensaje
  useEffect(() => {
    finMensajesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversacion?.mensajes]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !conversacion || enviando) return;

    const textoAEnviar = texto;
    setTexto("");
    setEnviando(true);

    try {
      await enviarMensaje({
        conversacionId: conversacion.id,
        texto: textoAEnviar,
        de: "rh",
      });
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setEnviando(false);
    }
  };

  const enviarPlantillaRapida = (mensajePlantilla: string) => {
    setTexto(mensajePlantilla);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">Mensajes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comunicación directa y seguimiento con los candidatos registrados en base de datos.
        </p>
      </header>

      {conversaciones.length === 0 ? (
        <div className="panel p-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-base font-semibold">No hay candidatos en la base de datos</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Las conversaciones se crearán automáticamente cuando los candidatos se postulen a las
            vacantes.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Lista de conversaciones */}
          <aside className="panel flex flex-col p-2">
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Candidatos ({conversaciones.length})
              </p>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[600px]">
              {conversaciones.map((c) => {
                const esActiva = conversacion?.id === c.id;
                const ultimoMensaje = c.mensajes[c.mensajes.length - 1];
                const cand = candidatos.find((candItem) => candItem.id === c.candidatoId);

                return (
                  <button
                    key={c.id}
                    onClick={() => setActivaId(c.id)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      esActiva
                        ? "bg-primary/15 border border-primary/40"
                        : "hover:bg-accent/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                          {c.nombre
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0]?.toUpperCase())
                            .join("")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {c.nombre}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{c.vacante}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {c.ultimaHora}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground/80">
                        {ultimoMensaje?.de === "rh" ? (
                          <span className="text-primary font-medium">Tú: </span>
                        ) : null}
                        {ultimoMensaje?.texto}
                      </p>
                      {cand?.etapa && (
                        <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {cand.etapa}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Ventana de chat activa */}
          {conversacion && (
            <section className="panel flex min-h-[560px] flex-col p-4">
              {/* Encabezado del chat */}
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-primary">{conversacion.nombre}</h2>
                    {candidatoAsociado?.etapa && (
                      <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {candidatoAsociado.etapa}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      {conversacion.vacante}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {conversacion.email}
                    </span>
                    {candidatoAsociado?.telefono && (
                      <span>WhatsApp: {candidatoAsociado.telefono}</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                  <span>Match: </span>
                  <strong className="text-primary">{candidatoAsociado?.match || 90}%</strong>
                </div>
              </header>

              {/* Mensajes */}
              <div className="flex-1 space-y-3 overflow-y-auto py-4 px-1">
                {conversacion.mensajes.map((m) => {
                  const esRh = m.de === "rh";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${esRh ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm sm:max-w-[75%] ${
                          esRh
                            ? "rounded-tr-xs bg-primary text-primary-foreground font-medium"
                            : "rounded-tl-xs bg-accent text-accent-foreground border border-border"
                        }`}
                      >
                        <p>{m.texto}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            esRh ? "text-primary-foreground/75" : "text-muted-foreground"
                          }`}
                        >
                          <Clock className="h-2.5 w-2.5" />
                          <span>{m.timestamp}</span>
                          {esRh && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={finMensajesRef} />
              </div>

              {/* Plantillas de respuesta rápida */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3 pb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase mr-1">
                  Respuesta rápida:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    enviarPlantillaRapida(
                      "Hola, nos gustaría coordinar una entrevista técnica contigo para esta semana.",
                    )
                  }
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  📅 Agendar entrevista
                </button>
                <button
                  type="button"
                  onClick={() =>
                    enviarPlantillaRapida(
                      "Hola, confirmamos recepción de tu postulación y estamos revisando tu experiencia.",
                    )
                  }
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  ✅ Confirmar recepción
                </button>
                <button
                  type="button"
                  onClick={() =>
                    enviarPlantillaRapida(
                      "¡Felicidades! Tu postulación ha avanzado favorablemente a la siguiente etapa de selección.",
                    )
                  }
                  className="rounded-md border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  ⭐ Avanzar etapa
                </button>
              </div>

              {/* Formulario para enviar mensaje */}
              <form
                onSubmit={handleEnviar}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-1"
              >
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder={`Escribe un mensaje para ${conversacion.nombre}...`}
                  className="rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!texto.trim() || enviando}
                  aria-label="Enviar mensaje"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
