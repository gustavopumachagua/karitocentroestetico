export default function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop">
      <div role="dialog" aria-modal="true" aria-label={title} className="ui-modal max-w-sm p-6 text-center">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">{title}</h2>
        <p className="text-slate-200 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="ui-button ui-button-primary"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
