import { FaVenusMars } from "react-icons/fa";

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
      <label className="block text-gray-300 text-sm mb-2 flex items-center gap-2">
        <FaVenusMars /> {label}
      </label>
      <div className="flex gap-6 text-white">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              className="cursor-pointer"
              disabled={disabled}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
