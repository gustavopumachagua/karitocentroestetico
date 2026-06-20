export default function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="page-panel p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
        <h2 className="text-lg font-bold text-cyan-300 mb-4">{title}</h2>
        <p className="text-slate-200 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
