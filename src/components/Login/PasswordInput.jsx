import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, show, setShow }) => {
  return (
    <div className="flex min-h-12 items-stretch overflow-hidden rounded-xl border border-slate-700 bg-slate-950/40 transition-colors hover:border-slate-500 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-300/20">
      <span
        aria-hidden="true"
        className="flex w-11 shrink-0 items-center justify-center border-r border-slate-700 text-slate-400"
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
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-400"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="m-0.5 inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-indigo-400/10 hover:text-indigo-200"
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
