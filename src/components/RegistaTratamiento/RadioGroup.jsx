import { FaVenusMars } from "react-icons/fa";
import CustomChoice from "../common/CustomChoice";

export default function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm text-slate-300">
        <FaVenusMars className="text-pink-300" /> {label}
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-slate-100 transition ${
              value === opt
                ? "border-cyan-400/40 bg-cyan-400/10"
                : "border-slate-700 bg-slate-950/30"
            } ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-cyan-400/30 hover:bg-cyan-400/5"
            }`}
          >
            <CustomChoice
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              disabled={disabled}
              ariaLabel={opt}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
