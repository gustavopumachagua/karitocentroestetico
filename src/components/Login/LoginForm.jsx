import TextInput from "./TextInput";
import PasswordInput from "./PasswordInput";
import { Link } from "react-router-dom";

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
        <div className="p-3 text-sm text-red-400 bg-red-900/40 border border-red-500/40 rounded-lg text-center animate-fadeIn">
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
          className={`w-full py-2.5 font-semibold text-white rounded-lg shadow-md transition active:scale-95
            ${
              isFormValid
                ? "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                : "bg-gray-600 cursor-not-allowed"
            }`}
        >
          Ingresar
        </button>
      </form>

      <div className="text-sm text-center text-gray-400">
        <Link
          to="/reset-password"
          className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition"
        >
          ¿Has olvidado tu contraseña?
        </Link>
      </div>
    </>
  );
};

export default LoginForm;
