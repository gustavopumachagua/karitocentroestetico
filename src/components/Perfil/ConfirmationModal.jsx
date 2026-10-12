import { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

export default function ConfirmationModal({
  show,
  message,
  type = "info",
  onClose,
  duration = 2500,
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const icon =
    type === "success" ? (
      <FaCheckCircle className="text-emerald-300 text-4xl sm:text-5xl" />
    ) : type === "error" ? (
      <FaTimesCircle className="text-rose-300 text-4xl sm:text-5xl" />
    ) : (
      <FaInfoCircle className="text-sky-300 text-4xl sm:text-5xl" />
    );

  return (
    <div className="ui-modal-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmación del sistema"
        aria-live="polite"
        className="ui-modal w-full max-w-md space-y-4 px-5 py-6 text-center sm:space-y-5 sm:px-8 sm:py-8"
      >
        <div className="flex justify-center">{icon}</div>
        <p className="text-slate-100 text-base sm:text-lg font-medium leading-relaxed break-words">
          {message}
        </p>
      </div>
    </div>
  );
}
