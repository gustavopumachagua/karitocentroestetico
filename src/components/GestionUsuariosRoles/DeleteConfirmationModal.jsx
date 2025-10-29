import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function DeleteConfirmationModal({
  show,
  onConfirm,
  onCancel,
  userName,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full transform animate-scaleIn">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <FaExclamationTriangle className="text-red-500 text-xl" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Confirmar Eliminación
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-300 text-base leading-relaxed">
            ¿Estás seguro de que deseas eliminar a{" "}
            <span className="font-semibold text-white">{userName}</span>?
          </p>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm flex items-start gap-2">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <span>
                <strong>Esta acción no se puede deshacer.</strong> Todos los
                datos asociados serán eliminados permanentemente.
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-red-500/30 cursor-pointer"
          >
            Eliminar Usuario
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
