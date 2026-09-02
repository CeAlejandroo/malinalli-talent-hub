import { useState } from "react";
import { X, Briefcase, Plus, CheckCircle2 } from "lucide-react";
import { useAtsStore } from "@/lib/atsStore";
import type { EstadoVacante } from "@/types/database";

const DEPARTAMENTOS = [
  "Tecnología",
  "Diseño",
  "Marketing",
  "Recursos Humanos",
  "Operaciones",
  "Finanzas",
  "Ventas",
];

const JORNADAS = ["Tiempo completo", "Medio tiempo", "Híbrido", "Por proyecto"];

interface ModalCrearVacanteProps {
  open: boolean;
  onClose: () => void;
}

export function ModalCrearVacante({ open, onClose }: ModalCrearVacanteProps) {
  const { crearVacante } = useAtsStore();
  const [titulo, setTitulo] = useState("");
  const [departamento, setDepartamento] = useState("Tecnología");
  const [ubicacion, setUbicacion] = useState("Remoto (México)");
  const [tipoJornada, setTipoJornada] = useState("Tiempo completo");
  const [estado, setEstado] = useState<EstadoVacante>("abierta");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) {
      setError("Por favor completa el título y la descripción de la vacante.");
      return;
    }

    setError("");
    setGuardando(true);

    try {
      await crearVacante({
        titulo: titulo.trim(),
        departamento,
        ubicacion: ubicacion.trim(),
        tipo_jornada: tipoJornada,
        estado,
        descripcion: descripcion.trim(),
      });

      setExito(true);
      setTimeout(() => {
        setExito(false);
        setTitulo("");
        setDescripcion("");
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un problema al registrar la vacante.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border border-[#F5B800]/40 p-6 shadow-2xl"
        style={{ backgroundColor: "#1C0D0A" }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#F5B800]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F5B800] text-[#1C0D0A]">
              <Briefcase className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#F5B800]">Subir Nueva Vacante</h2>
              <p className="text-xs text-white/60">Equipo de Recursos Humanos y Selección</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {exito ? (
          <div className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#F5B800] animate-bounce" />
            <h3 className="mt-3 text-lg font-bold text-[#F5B800]">¡Vacante publicada con éxito!</h3>
            <p className="mt-1 text-xs text-white/70">
              Ya está disponible en el tablero general y accesible para candidatos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                {error}
              </p>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                Título del puesto *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="ej. Senior Cloud Infrastructure Lead"
                required
                className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Departamento
                </label>
                <select
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B800]"
                >
                  {DEPARTAMENTOS.map((dep) => (
                    <option key={dep} value={dep} className="bg-[#1C0D0A] text-white">
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Tipo de Jornada
                </label>
                <select
                  value={tipoJornada}
                  onChange={(e) => setTipoJornada(e.target.value)}
                  className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B800]"
                >
                  {JORNADAS.map((jor) => (
                    <option key={jor} value={jor} className="bg-[#1C0D0A] text-white">
                      {jor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="ej. Remoto (México) / Híbrido CDMX"
                  required
                  className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Estado Inicial
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as EstadoVacante)}
                  className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white outline-none focus:border-[#F5B800]"
                >
                  <option value="abierta" className="bg-[#1C0D0A] text-white">
                    Abierta (Visible y activa)
                  </option>
                  <option value="cerrada" className="bg-[#1C0D0A] text-white">
                    Cerrada (Histórico/Cubierta)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                Descripción del puesto y requerimientos *
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Describe las responsabilidades principales, tecnologías o perfil requerido..."
                required
                className="w-full resize-none rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="rounded-lg border border-[#F5B800]/30 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5B800] px-5 py-2 text-xs font-bold text-[#1C0D0A] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {guardando ? "Guardando..." : "Publicar Vacante"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
