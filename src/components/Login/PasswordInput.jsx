import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, show, setShow }) => {
  return (
    <div className="flex min-h-12 items-stretch overflow-hidden rounded-lg border border-white/10 bg-slate-950/50 transition-colors hover:border-cyan-300/45 hover:bg-slate-900/80 focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/20">
      <span
        aria-hidden="true"
        className="flex w-11 shrink-0 items-center justify-center border-r border-white/10 bg-slate-900/40 text-slate-300"
      >
        <FaLock />
      </span>
      <input
        type={show ? "text" : "password"}
        name="password"
        placeholder="Contraseña"
        value={value}
        onChange={onChange}
        autoComplete="current-password"
        aria-label="Contraseña"
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-slate-100 outline-none placeholder:text-slate-300"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="my-1.5 mr-1.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-600/70 bg-slate-900/90 text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
