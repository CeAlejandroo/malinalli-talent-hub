import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { useAtsStore } from "@/lib/atsStore";
import { useAuth } from "@/lib/auth";
import { useState, useRef } from "react";
import {
  Briefcase,
  Calendar,
  Clock,
  Upload,
  FileText,
  Loader2,
  Check,
  X,
} from "lucide-react";

export const Route = createFileRoute("/mis-postulaciones")({
  head: () => ({
    meta: [
      { title: "Mis postulaciones — Malinalli" },
      {
        name: "description",
        content:
          "Consulta el estatus de tus postulaciones en Malinalli Elite Recruitment.",
      },
      { property: "og:title", content: "Mis postulaciones — Malinalli" },
      {
        property: "og:description",
        content:
          "Sigue el avance de tus procesos de selección con Malinalli.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MisPostulaciones,
});

function MisPostulaciones() {
  const { postulaciones, candidatos, subirCV, cancelarPostulacion } =
    useAtsStore();
  const { usuario } = useAuth();

  const [modalCancelarId, setModalCancelarId] = useState<string | null>(null);
  const [cvSubiendo, setCvSubiendo] = useState<string | null>(null);
  const [cvExito, setCvExito] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubirCV = async (
    candidatoId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setCvError(candidatoId);
      setTimeout(() => setCvError(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCvError(candidatoId);
      setTimeout(() => setCvError(null), 3000);
      return;
    }

    setCvSubiendo(candidatoId);
    setCvError(null);
    setCvExito(null);

    try {
      const url = await subirCV(candidatoId, file);
      if (url) {
        setCvExito(candidatoId);
        setTimeout(() => setCvExito(null), 4000);
      } else {
        setCvError(candidatoId);
        setTimeout(() => setCvError(null), 3000);
      }
    } catch {
      setCvError(candidatoId);
      setTimeout(() => setCvError(null), 3000);
    } finally {
      setCvSubiendo(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Find the candidato matching a postulation to get CV and messaging info
  const getCandidato = (postulacion: (typeof postulaciones)[0]) => {
    return candidatos.find(
      (c) =>
        c.email === postulacion.emailCandidato ||
        c.nombre === postulacion.nombreCandidato,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">
              Mis postulaciones
            </h1>
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
            <p className="mt-3 text-sm font-semibold">
              Aún no te has postulado a ninguna vacante.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Explora el tablero y postúlate a las posiciones activas.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {postulaciones.map((p) => {
              const cand = getCandidato(p);
              const cvUrl = cand?.cv_url || null;

              return (
                <li
                  key={p.id}
                  className="panel overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Main postulation card */}
                  <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-primary">
                        {p.vacanteTitulo}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.empresa} · {p.ubicacion}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" /> Postulado:{" "}
                        {p.fecha}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <Clock className="h-3 w-3" /> {p.estatus}
                      </span>
                    </div>
                  </div>

                  {/* Action bar: CV Upload + Cancel Application */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-border bg-accent/30 px-4 py-2.5">
                    {/* CV Upload */}
                    <div className="flex items-center gap-2">
                      {cvUrl ? (
                        <a
                          href={cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-green-500/40 bg-green-500/10 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-500/20"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          CV subido ✓
                        </a>
                      ) : cvSubiendo === (cand?.id || p.id) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Subiendo CV…
                        </span>
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-primary">
                          <Upload className="h-3.5 w-3.5" />
                          Subir CV
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) =>
                              handleSubirCV(cand?.id || p.id, e)
                            }
                          />
                        </label>
                      )}

                      {cvExito === (cand?.id || p.id) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600">
                          <Check className="h-3 w-3" /> CV cargado
                          exitosamente
                        </span>
                      )}
                      {cvError === (cand?.id || p.id) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                          <X className="h-3 w-3" /> Error al subir CV
                          (PDF/DOC, máx 5MB)
                        </span>
                      )}
                    </div>

                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => setModalCancelarId(p.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-destructive/20 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 hover:text-destructive-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancelar postulación
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Link
          to="/vacantes"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          Explorar más vacantes
        </Link>
      </main>

      {/* Modal de confirmación para cancelar postulación */}
      {modalCancelarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border border-destructive/40 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: "#1C0D0A" }}
          >
            <div className="mb-4 flex items-center justify-between border-b border-destructive/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive text-destructive-foreground">
                  <X className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-destructive">Retirar Postulación</h2>
              </div>
              <button
                onClick={() => setModalCancelarId(null)}
                type="button"
                className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              ¿Estás seguro de que deseas retirar tu postulación a esta vacante? Esta acción detendrá tu proceso de selección y no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalCancelarId(null)}
                className="rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (modalCancelarId) {
                    await cancelarPostulacion(modalCancelarId);
                    setModalCancelarId(null);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:opacity-90"
              >
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
