export default function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-slate-300 mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-lg border bg-slate-950/50 p-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:ring-2 ${
          error
            ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
            : "border-slate-700 focus:border-cyan-400/60 focus:ring-cyan-400/15"
        }`}
      />
      {error && <span className="text-rose-300 text-sm mt-1">{error}</span>}
    </div>
  );
}
