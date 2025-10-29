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
      <label className="text-sm text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
          error
            ? "focus:ring-red-500 border border-red-500"
            : "focus:ring-indigo-500"
        }`}
      />
      {error && <span className="text-red-400 text-sm mt-1">{error}</span>}
    </div>
  );
}
