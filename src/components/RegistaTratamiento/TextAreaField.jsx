export default function TextAreaField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-gray-300 text-sm mb-2">{label}</label>
      <textarea
        rows="4"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white resize-none
                   border border-gray-600 focus:outline-none focus:ring-2
                   focus:ring-indigo-500"
      />
    </div>
  );
}
