import PasswordInput from "./PasswordInput";
import { FaArrowRight, FaCheckCircle, FaKey } from "react-icons/fa";

const ChangePasswordForm = ({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
}) => {
  const passwordsDoNotMatch =
    confirmPassword.length > 0 && confirmPassword !== password;
  const hasSpaces = /\s/.test(password);
  const isLongEnough = password.length >= 6;
  const passwordScore =
    Number(isLongEnough) +
    Number(/[A-ZÁÉÍÓÚÑ]/.test(password)) +
    Number(/[0-9]/.test(password)) +
    Number(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9]/.test(password));

  const isDisabled =
    !isLongEnough || hasSpaces || password !== confirmPassword;

  const strengthLabel =
    password.length === 0
      ? "Sin contraseña"
      : passwordScore >= 3
      ? "Buena seguridad"
      : "Seguridad básica";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!isDisabled) onSubmit();
      }}
      className="space-y-5"
    >
      <PasswordInput
        label="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        placeholder="Ingresa tu nueva contraseña"
      />

      <PasswordInput
        label="Repite la nueva contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        showPassword={showConfirmPassword}
        setShowPassword={setShowConfirmPassword}
        placeholder="Repite tu nueva contraseña"
        error={passwordsDoNotMatch}
      />

      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-300">
            {strengthLabel}
          </span>
          <span className={hasSpaces ? "text-red-300" : "text-cyan-200"}>
            Sin espacios
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-1.5 rounded-full ${
                passwordScore > item
                  ? "bg-cyan-300"
                  : "bg-slate-700"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
          <FaCheckCircle className="mt-0.5 flex-shrink-0 text-cyan-300" />
          Utiliza al menos 6 caracteres. Puedes mezclar mayúsculas, números y
          símbolos para mejorarla.
        </p>
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`group flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold shadow-lg transition active:scale-[0.99] ${
          !isDisabled
            ? "bg-cyan-400 text-slate-950 shadow-cyan-950/30 hover:bg-cyan-300"
            : "bg-slate-700 text-slate-400 cursor-not-allowed"
        }`}
      >
        <FaKey />
        Cambiar contraseña
        <FaArrowRight className="text-xs transition-transform group-enabled:group-hover:translate-x-1" />
      </button>
    </form>
  );
};

export default ChangePasswordForm;
