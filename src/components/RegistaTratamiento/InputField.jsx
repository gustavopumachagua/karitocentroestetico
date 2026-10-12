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
    <div className="ui-field">
      <label className="ui-label">{label}</label>
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
        aria-label={label}
        aria-invalid={Boolean(error)}
        className={`ui-control ${
          readOnly ? "cursor-default text-slate-300" : ""
        } ${error ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20" : ""}`}
      />

      {error && <p className="text-rose-300 text-sm mt-1">{error}</p>}
    </div>
  );
}
