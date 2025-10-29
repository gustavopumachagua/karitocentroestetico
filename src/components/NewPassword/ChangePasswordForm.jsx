import PasswordInput from "./PasswordInput";

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

  const isDisabled = password.length < 6 || password !== confirmPassword;

  return (
    <div className="space-y-6">
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

      <p className="text-gray-500 text-xs text-center">
        Utiliza al menos 6 caracteres, sin espacios en blanco.
      </p>

      <button
        disabled={isDisabled}
        onClick={onSubmit}
        className={`w-full py-2.5 font-semibold rounded-lg shadow-md transition active:scale-95 ${
          !isDisabled
            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
      >
        CAMBIAR CONTRASEÑA
      </button>
    </div>
  );
};

export default ChangePasswordForm;
