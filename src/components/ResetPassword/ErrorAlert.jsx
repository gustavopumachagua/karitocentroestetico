import { FaExclamationCircle } from "react-icons/fa";

export default function ErrorAlert({ message }) {
  return (
    <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-relaxed text-rose-200">
      <FaExclamationCircle className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      {message}
    </div>
  );
}
