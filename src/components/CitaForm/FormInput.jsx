export default function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="ui-field min-w-0">
      <label className="ui-label" htmlFor={`appointment-${name}`}>{label}</label>
      <input
        id={`appointment-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`ui-control ${
          error
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
            : "border-slate-700 focus:border-indigo-300 focus:ring-indigo-400/20"
        }`}
      />
      {error && <span className="text-rose-300 text-sm mt-1">{error}</span>}
    </div>
  );
}
