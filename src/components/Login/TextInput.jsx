import { FaEnvelope } from "react-icons/fa";

const TextInput = ({ name, value, onChange, placeholder, isInvalid }) => {
  return (
    <div
      className={`flex min-h-12 items-stretch overflow-hidden rounded-lg border bg-slate-950/50 transition-colors focus-within:ring-2 ${
        isInvalid
          ? "border-red-400/70 focus-within:border-red-300 focus-within:ring-red-400/30"
          : "border-white/10 hover:border-cyan-300/45 hover:bg-slate-900/80 focus-within:border-cyan-300/70 focus-within:ring-cyan-300/20"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex w-11 shrink-0 items-center justify-center border-r transition-colors ${
          isInvalid
            ? "border-red-400/25 bg-red-500/5 text-red-300"
            : "border-white/10 bg-slate-900/40 text-slate-300"
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
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-slate-100 outline-none placeholder:text-slate-300"
      />
    </div>
  );
};

export default TextInput;
