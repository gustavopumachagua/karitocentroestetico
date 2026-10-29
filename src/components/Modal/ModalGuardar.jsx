export default function Modal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-backdrop">
      <div role="dialog" aria-modal="true" aria-label={title} className="ui-modal max-w-sm p-6">
        <h2 className="mb-3 text-base font-semibold text-slate-100">{title}</h2>
        <p className="text-sm leading-relaxed text-slate-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="ui-button ui-button-primary w-full"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
