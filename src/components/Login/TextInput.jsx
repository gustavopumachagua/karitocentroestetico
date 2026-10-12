import { FaEnvelope } from "react-icons/fa";

const TextInput = ({ name, value, onChange, placeholder, isInvalid }) => {
  return (
    <div
      className={`flex min-h-12 items-stretch overflow-hidden rounded-xl border bg-slate-950/40 transition-colors focus-within:ring-2 ${
        isInvalid
          ? "border-rose-400/70 focus-within:border-rose-300 focus-within:ring-rose-400/25"
          : "border-slate-700 hover:border-slate-500 focus-within:border-indigo-300 focus-within:ring-indigo-300/20"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex w-11 shrink-0 items-center justify-center border-r transition-colors ${
          isInvalid
            ? "border-rose-400/25 text-rose-300"
            : "border-slate-700 text-slate-400"
        }`}
      >
        <FaEnvelope />
      </span>
      <input
        type="email"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="email"
        aria-label="Correo electrónico"
        aria-invalid={isInvalid || undefined}
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
      />
    </div>
  );
};

export default TextInput;
