export default function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`ui-control ${
          error
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
            : "border-slate-700 focus:border-cyan-400/60 focus:ring-cyan-400/15"
        }`}
      />
      {error && <span className="text-rose-300 text-sm mt-1">{error}</span>}
    </div>
  );
}
