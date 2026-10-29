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
      <label className="ui-label mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt}
            className={`group flex min-h-11 items-center gap-3 rounded-lg border px-4 py-2 text-sm text-slate-100 transition ${
              value === opt
                ? "border-indigo-400/40 bg-indigo-400/10"
                : "border-slate-700 bg-slate-950/30"
            } ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-indigo-400/30 hover:bg-indigo-400/5"
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
