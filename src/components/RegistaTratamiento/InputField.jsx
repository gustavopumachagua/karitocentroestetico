export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  min,
  max,
  maxLength,
  placeholder = "",
  error = "",
}) {
  const handleKeyDown = (e) => {
    if (type === "number") {
      if (["e", "E", "+", "-", "."].includes(e.key)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div>
      <label className="block text-slate-300 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        min={min}
        max={max}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-slate-950/50 px-4 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-600 ${
          readOnly ? "cursor-default text-slate-300" : ""
        } ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : "border-slate-700 focus:border-cyan-400/60 focus:ring-cyan-400/15"} focus:ring-2`}
      />

      {error && <p className="text-rose-300 text-sm mt-1">{error}</p>}
    </div>
  );
}
