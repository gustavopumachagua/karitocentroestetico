import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, show, setShow }) => {
  return (
    <div className="ui-field">
      <label htmlFor="login-password" className="ui-label">Contraseña</label>
      <div className="auth-input-shell">
      <input
        id="login-password"
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
    </div>
  );
};

export default PasswordInput;
