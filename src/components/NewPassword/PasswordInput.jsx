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
          error ? "text-red-300" : "text-gray-300"
        }`}
      >
        <FaLock className={error ? "text-red-300" : "text-cyan-300"} />
        {label}
      </label>

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`w-full rounded-lg border bg-slate-950/50 py-3 pl-4 pr-11 text-slate-100 outline-none transition placeholder:text-slate-500 focus:ring-2 ${
          error
            ? "border-red-400/70 focus:border-red-300 focus:ring-red-400/30"
            : "border-white/10 focus:border-cyan-300/70 focus:ring-cyan-300/20"
        }`}
      />

      {value.length > 0 && (
        <button
          type="button"
          className={`absolute right-3 top-10 transition ${
            error
              ? "text-red-300 hover:text-red-200"
              : "text-slate-500 hover:text-cyan-200"
          }`}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
        </button>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-300">
          Las contraseñas no coinciden.
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
