import TextInput from "./TextInput";
import PasswordInput from "./PasswordInput";
import { Link } from "react-router-dom";
import { FaExclamationCircle, FaSignInAlt } from "react-icons/fa";

const LoginForm = ({
  form,
  errors,
  showPassword,
  setShowPassword,
  onChange,
  onSubmit,
  validateEmail,
}) => {
  const isFormValid = validateEmail(form.email) && form.password.length > 5;
  const isEmailInvalid = form.email.length > 0 && !validateEmail(form.email);

  return (
    <>
      {errors.general && (
        <div className="ui-card flex items-center justify-center gap-2 border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200 animate-fade-in">
          <FaExclamationCircle />
          {errors.general}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <TextInput
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Correo electrónico"
          isInvalid={isEmailInvalid}
        />

        <PasswordInput
          value={form.password}
          onChange={onChange}
          show={showPassword}
          setShow={setShowPassword}
        />

        <button
          type="submit"
          disabled={!isFormValid}
          className={`ui-button w-full min-h-12
            ${
              isFormValid
                ? "ui-button-primary"
                : "ui-button-secondary cursor-not-allowed"
            }`}
        >
          <FaSignInAlt />
          Ingresar
        </button>
      </form>

      <div className="text-center text-sm text-slate-400">
        <Link
          to="/reset-password"
          className="font-medium text-cyan-200 transition hover:text-cyan-100 hover:underline"
        >
          ¿Has olvidado tu contraseña?
        </Link>
      </div>
    </>
  );
};

export default LoginForm;
