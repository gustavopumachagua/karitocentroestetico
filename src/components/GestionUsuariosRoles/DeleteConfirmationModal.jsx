import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function DeleteConfirmationModal({
  show,
  onConfirm,
  onCancel,
  userName,
  title = "Confirmar Eliminación",
  message,
  warningText = "Todos los datos asociados serán eliminados permanentemente.",
  confirmText = "Eliminar Usuario",
}) {
  if (!show) return null;

  return (
    <div className="ui-modal-backdrop">
      <div role="dialog" aria-modal="true" aria-label={title} className="ui-modal max-w-md">
        <div className="flex items-start justify-between gap-3 border-b border-slate-700/60 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-rose-400/20 bg-rose-500/12 flex items-center justify-center">
              <FaExclamationTriangle className="text-rose-300 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cerrar confirmación"
            className="ui-icon-button shrink-0"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <p className="text-slate-300 text-base leading-relaxed">
            {message || (
              <>
                ¿Estás seguro de que deseas eliminar a{" "}
                <span className="font-semibold text-white">{userName}</span>?
              </>
            )}
          </p>
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
            <p className="text-rose-300 text-sm flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <span>
                <strong>Esta acción no se puede deshacer.</strong>{" "}
                {warningText}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-700/60 p-4 sm:flex-row sm:p-6">
          <button
            onClick={onCancel}
            className="ui-button ui-button-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="ui-button ui-button-danger flex-1"
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
