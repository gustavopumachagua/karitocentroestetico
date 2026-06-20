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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="page-panel rounded-xl shadow-2xl max-w-md w-full transform animate-scaleIn">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl border border-rose-400/20 bg-rose-500/12 flex items-center justify-center">
              <FaExclamationTriangle className="text-rose-300 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
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

        <div className="flex gap-3 p-6 border-t border-slate-700/70">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-white font-medium transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg border border-rose-400/20 bg-rose-600 hover:bg-rose-500 text-white font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-rose-950/30 cursor-pointer"
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
