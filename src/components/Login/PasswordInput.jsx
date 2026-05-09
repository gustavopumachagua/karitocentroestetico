import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, show, setShow }) => {
  return (
    <div className="relative">
      <FaLock className="absolute left-3 top-3.5 text-slate-500" />
      <input
        type={show ? "text" : "password"}
        name="password"
        placeholder="Contraseña"
        value={value}
        onChange={onChange}
        autoComplete="current-password"
        className="w-full rounded-lg border border-white/10 bg-slate-950/50 py-3 pl-10 pr-10 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3.5 text-slate-500 transition hover:text-cyan-200"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
