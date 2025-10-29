export default function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl w-96 text-center border border-gray-700">
        <h2 className="text-lg font-bold text-indigo-400 mb-4">{title}</h2>
        <p className="text-gray-200 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
