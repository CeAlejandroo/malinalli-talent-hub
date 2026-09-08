import { X, Trash2, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface ModalConfirmacionEliminarProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ModalConfirmacionEliminar({ open, onClose, onConfirm }: ModalConfirmacionEliminarProps) {
  const [guardando, setGuardando] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setGuardando(true);
    try {
      await onConfirm();
    } finally {
      setGuardando(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl border border-[#F5B800]/40 p-6 shadow-2xl"
        style={{ backgroundColor: "#1C0D0A" }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#F5B800]/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F5B800] text-[#1C0D0A]">
              <Trash2 className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-[#F5B800]">Eliminar Vacante</h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-white/80 mb-4">
          ¿Estás seguro de que deseas eliminar esta vacante? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg border border-[#F5B800]/30 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={guardando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F5B800] px-4 py-2 text-xs font-bold text-[#1C0D0A] hover:opacity-90"
          >
            {guardando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
