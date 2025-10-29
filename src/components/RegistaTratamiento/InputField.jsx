export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  readOnly = false,
  min,
  max,
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
      <label className="block text-gray-300 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        min={min}
        max={max}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg bg-gray-700 text-white
             border ${error ? "border-red-500" : "border-gray-600"}
             focus:outline-none focus:ring-2
             ${error ? "focus:ring-red-500" : "focus:ring-indigo-500"}
             placeholder-gray-400`}
      />

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
