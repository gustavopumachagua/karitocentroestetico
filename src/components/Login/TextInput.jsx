import { FaEnvelope } from "react-icons/fa";

const TextInput = ({ name, value, onChange, placeholder, isInvalid }) => {
  return (
    <div className="relative">
      <FaEnvelope
        className={`absolute left-3 top-3.5 transition ${
          isInvalid ? "text-red-300" : "text-slate-500"
        }`}
      />
      <input
        type="email"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="email"
        className={`w-full rounded-lg border bg-slate-950/50 py-3 pl-10 pr-3 text-slate-100 outline-none transition placeholder:text-slate-500
          ${
            isInvalid
              ? "border-red-400/70 focus:border-red-300 focus:ring-2 focus:ring-red-400/30"
              : "border-white/10 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20"
          }`}
      />
    </div>
  );
};

export default TextInput;
