import { useState, useEffect } from "react";
import { X, Send, CheckCircle2, User, Mail, Phone, Link2 } from "lucide-react";
import { useAtsStore } from "@/lib/atsStore";
import { useAuth } from "@/lib/auth";
import type { Vacante } from "@/types/database";

interface ModalPostularseProps {
  vacante: Vacante | null;
  open: boolean;
  onClose: () => void;
}

export function ModalPostularse({ vacante, open, onClose }: ModalPostularseProps) {
  const { postularseAVacante } = useAtsStore();
  const { usuario } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && usuario) {
      setNombre(usuario.nombre || "");
      setEmail(usuario.email || "");
      if (usuario.telefono) setTelefono(usuario.telefono);
    }
  }, [open, usuario]);

  if (!open || !vacante) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      setError("Por favor completa tu nombre y correo de contacto.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      await postularseAVacante({
        vacanteId: vacante.id,
        vacanteTitulo: vacante.titulo,
        departamento: vacante.departamento,
        ubicacion: vacante.ubicacion,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        linkedin: linkedin.trim(),
        notas: notas.trim(),
      });

      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al enviar tu postulación. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl border border-[#F5B800]/40 p-6 shadow-2xl"
        style={{ backgroundColor: "#1C0D0A" }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#F5B800]/20 pb-3">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#F5B800] uppercase">
              POSTULACIÓN DE CANDIDATO
            </span>
            <h2 className="text-base font-bold text-white">{vacante.titulo}</h2>
            <p className="text-xs text-[#F5B800]/80">
              {vacante.departamento} · {vacante.ubicacion} · {vacante.tipo_jornada}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {enviado ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#F5B800] animate-bounce" />
            <h3 className="mt-3 text-lg font-bold text-[#F5B800]">¡Postulación enviada con éxito!</h3>
            <p className="mt-1 text-xs text-white/70">
              Tu perfil ha ingresado a la etapa <strong>Postulado</strong> en el tablero del equipo de RH.
              Puedes monitorear tu estatus en <strong>Mis postulaciones</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4 w-4 text-[#F5B800]/60" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="ej. Sofía Valdés"
                    required
                    className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-3 h-4 w-4 text-[#F5B800]/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidato@malinalli.mx"
                    required
                    className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute top-2.5 left-3 h-4 w-4 text-[#F5B800]/60" />
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+52 55 0000 0000"
                    className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                  LinkedIn o Portafolio
                </label>
                <div className="relative">
                  <Link2 className="absolute top-2.5 left-3 h-4 w-4 text-[#F5B800]/60" />
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-[#F5B800]/30 bg-[#2A1612] py-2 pr-3 pl-9 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#F5B800]">
                Breve mensaje o resumen de experiencia
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Cuéntanos brevemente sobre tu trayectoria relevante..."
                className="w-full resize-none rounded-lg border border-[#F5B800]/30 bg-[#2A1612] px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#F5B800]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={enviando}
                className="rounded-lg border border-[#F5B800]/30 px-4 py-2 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5B800] px-5 py-2 text-xs font-bold text-[#1C0D0A] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {enviando ? "Enviando..." : "Confirmar Postulación"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
