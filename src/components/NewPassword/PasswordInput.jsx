import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

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
        className={`block mb-2 ${error ? "text-red-500" : "text-gray-300"}`}
      >
        {label}
      </label>

      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 ${
          error
            ? "border border-red-500 focus:ring-red-500"
            : "border border-gray-700 focus:ring-indigo-500"
        }`}
      />

      {value.length > 0 && (
        <button
          type="button"
          className={`absolute right-3 top-10 transition ${
            error
              ? "text-red-500 hover:text-red-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <AiFillEyeInvisible size={20} />
          ) : (
            <AiFillEye size={20} />
          )}
        </button>
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">
          Las contraseñas no coinciden.
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
