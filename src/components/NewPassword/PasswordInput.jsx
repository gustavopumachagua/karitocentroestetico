import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

const PasswordInput = ({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  placeholder,
  error,
}) => {
  return (
    <div className="relative">
      <label
        className={`mb-2 flex items-center gap-2 text-sm font-medium ${
          error ? "text-rose-300" : "text-slate-300"
        }`}
      >
        <FaLock className={error ? "text-rose-300" : "text-cyan-300"} />
        {label}
      </label>

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`ui-control py-3 pl-4 pr-11 ${
          error
            ? "border-rose-400/70 focus:border-rose-300 focus:ring-rose-400/30"
            : "border-white/10 focus:border-cyan-300/70 focus:ring-cyan-300/20"
        }`}
      />

      {value.length > 0 && (
        <button
          type="button"
          className={`ui-icon-button absolute right-2 top-8 ${
            error
              ? "text-rose-300 hover:text-rose-200"
              : "text-slate-500 hover:text-cyan-200"
          }`}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-rose-300">
          Las contraseñas no coinciden.
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
