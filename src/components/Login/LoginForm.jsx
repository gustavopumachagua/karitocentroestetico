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
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm leading-relaxed text-rose-200">
          <FaExclamationCircle className="mt-0.5 shrink-0" aria-hidden="true" />
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

      <div className="mt-5 text-center text-sm text-slate-400">
        <Link
          to="/reset-password"
          className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium text-indigo-300 transition-colors hover:text-indigo-200 hover:underline"
        >
          ¿Has olvidado tu contraseña?
        </Link>
      </div>
    </>
  );
};

export default LoginForm;
