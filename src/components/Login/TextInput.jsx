import { FaEnvelope } from "react-icons/fa";

const TextInput = ({ name, value, onChange, placeholder, isInvalid }) => {
  return (
    <div className="relative">
      <FaEnvelope
        className={`absolute top-3.5 left-3 transition ${
          isInvalid ? "text-red-500" : "text-gray-500"
        }`}
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2.5 bg-gray-800 text-gray-100 border rounded-lg outline-none transition
          ${
            isInvalid
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
          }`}
      />
    </div>
  );
};

export default TextInput;
