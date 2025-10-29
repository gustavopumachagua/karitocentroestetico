import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({ value, onChange, show, setShow }) => {
  return (
    <div className="relative">
      <FaLock className="absolute top-3.5 left-3 text-gray-500" />
      <input
        type={show ? "text" : "password"}
        name="password"
        placeholder="Contraseña"
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2.5 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg outline-none transition focus:ring-indigo-500 focus:border-indigo-500"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute top-3.5 right-3 text-gray-500 hover:text-gray-300 transition"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
};

export default PasswordInput;
