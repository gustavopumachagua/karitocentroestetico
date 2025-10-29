export default function FormDateTime({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-300 mb-1">{label}</label>
      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        className="p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
      />
    </div>
  );
}
