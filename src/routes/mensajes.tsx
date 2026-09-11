import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { Send, User, Briefcase, MessageSquare, CheckCheck, Clock } from "lucide-react";
import { useAtsStore } from "@/lib/atsStore";
import { useAuth } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/mensajes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mis mensajes — Malinalli" },
      {
        name: "description",
        content: "Bandeja de mensajes de tus postulaciones.",
      },
    ],
  }),
  component: MensajesPage,
});

function MensajesPage() {
  const { usuario, cargando } = useAuth();
  const navigate = useNavigate();
  const { conversaciones, candidatos, enviarMensaje } = useAtsStore();
  const [activaId, setActivaId] = useState<string>("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finMensajesRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (cargando) return;
    if (!usuario) {
      navigate({ to: "/login", replace: true });
    }
  }, [usuario, cargando, navigate]);

  // Filtrar las conversaciones del candidato autenticado por su correo o nombre
  const misConversaciones = useMemo(() => {
    if (!usuario) return [];
    return conversaciones.filter(
      (c) =>
        c.email?.toLowerCase() === usuario.email?.toLowerCase() ||
        c.nombre?.toLowerCase() === usuario.nombre?.toLowerCase(),
    );
  }, [conversaciones, usuario]);

  // Asegurar selección de conversación activa válida
  const conversacion = useMemo(() => {
    if (misConversaciones.length === 0) return null;
    const encontrada = misConversaciones.find((c) => c.id === activaId);
    return encontrada || misConversaciones[0];
  }, [misConversaciones, activaId]);

  // Candidato asociado para obtener datos adicionales si es necesario
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
        de: "candidato",
      });
    } catch (err) {
      console.error("Error enviando mensaje:", err);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando || !usuario) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Verificando acceso...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">Mis Mensajes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comunicación directa con el equipo de reclutamiento de Malinalli Elite.
          </p>
        </header>

        {misConversaciones.length === 0 ? (
          <div className="panel p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-base font-semibold">No tienes conversaciones activas</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Las conversaciones se generarán automáticamente cuando te postules a alguna vacante activa.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Lista de conversaciones */}
            <aside className="panel flex flex-col p-2">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Mis procesos ({misConversaciones.length})
                </p>
              </div>
              <div className="space-y-1 overflow-y-auto max-h-[600px]">
                {misConversaciones.map((c) => {
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
                            M
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {c.vacante}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">Malinalli Elite</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {c.ultimaHora}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="truncate text-xs text-muted-foreground/80">
                          {ultimoMensaje?.de === "candidato" ? (
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
              <section className="panel flex min-h-[520px] flex-col p-4">
                {/* Encabezado del chat */}
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-primary">{conversacion.vacante}</h2>
                      {candidatoAsociado?.etapa && (
                        <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                          {candidatoAsociado.etapa}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        Malinalli Elite
                      </span>
                    </div>
                  </div>
                </header>

                {/* Mensajes */}
                <div className="flex-1 space-y-3 overflow-y-auto py-4 px-1">
                  {conversacion.mensajes.map((m) => {
                    const esCandidato = m.de === "candidato";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${esCandidato ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm sm:max-w-[75%] ${
                            esCandidato
                              ? "rounded-tr-xs bg-primary text-primary-foreground font-medium"
                              : "rounded-tl-xs bg-accent text-accent-foreground border border-border"
                          }`}
                        >
                          {!esCandidato && (
                            <p className="mb-0.5 text-[10px] font-bold text-primary opacity-80">
                              Administración
                            </p>
                          )}
                          <p>{m.texto}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              esCandidato ? "text-primary-foreground/75" : "text-muted-foreground"
                            }`}
                          >
                            <Clock className="h-2.5 w-2.5" />
                            <span>{m.timestamp}</span>
                            {esCandidato && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={finMensajesRef} />
                </div>

                {/* Formulario para enviar mensaje */}
                <form
                  onSubmit={handleEnviar}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 pt-1 border-t border-border mt-2"
                >
                  <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un mensaje para Administración..."
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
    </div>
  );
}
