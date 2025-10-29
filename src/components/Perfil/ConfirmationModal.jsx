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
      <FaCheckCircle className="text-green-400 text-4xl sm:text-5xl" />
    ) : type === "error" ? (
      <FaTimesCircle className="text-red-400 text-4xl sm:text-5xl" />
    ) : (
      <FaInfoCircle className="text-blue-400 text-4xl sm:text-5xl" />
    );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="
          bg-gray-900
          px-5 py-6 sm:px-8 sm:py-8
          rounded-2xl
          border border-gray-700
          shadow-2xl
          text-center
          max-w-xs sm:max-w-md w-[90%] sm:w-full
          space-y-4 sm:space-y-5
          transform transition-all
          animate-fadeInUp
        "
      >
        <div className="flex justify-center">{icon}</div>
        <p className="text-gray-100 text-base sm:text-lg font-medium leading-relaxed break-words">
          {message}
        </p>
      </div>
    </div>
  );
}
