import { FaEye, FaEyeSlash } from "react-icons/fa";

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
    <div className="min-w-0">
      <p
        className={`mb-2 flex items-center gap-2 text-sm font-medium ${
          error ? "text-rose-300" : "text-slate-300"
        }`}
      >
        {label}
      </p>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          aria-label={label}
          aria-invalid={error || undefined}
          className={`ui-control min-h-12 py-3 pl-4 pr-14 ${
            error
              ? "border-rose-400/70 focus:border-rose-300 focus:ring-rose-400/30"
              : "border-slate-700 focus:border-indigo-300 focus:ring-indigo-300/20"
          }`}
        />

        {value.length > 0 && (
          <button
            type="button"
            className={`absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg transition-colors ${
              error
                ? "text-rose-300 hover:text-rose-200"
                : "text-slate-400 hover:bg-indigo-400/10 hover:text-indigo-200"
            }`}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-rose-300">
          Las contraseñas no coinciden.
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
