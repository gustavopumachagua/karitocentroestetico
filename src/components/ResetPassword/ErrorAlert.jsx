import { FaExclamationCircle } from "react-icons/fa";

export default function ErrorAlert({ message }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200 animate-fade-in">
      <FaExclamationCircle className="flex-shrink-0" />
      {message}
    </div>
  );
}
