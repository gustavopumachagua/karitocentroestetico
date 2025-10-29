export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-300 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
      >
        <option value="">Seleccione {label}</option>
        {options.map((opt, i) => {
          const key = typeof opt === "object" ? opt.value || i : opt;
          const val = typeof opt === "object" ? opt.value : opt;
          const labelText = typeof opt === "object" ? opt.label : opt;

          return (
            <option key={key} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
    </div>
  );
}
