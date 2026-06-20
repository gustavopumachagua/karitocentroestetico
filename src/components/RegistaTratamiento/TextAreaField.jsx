export default function TextAreaField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm mb-2">{label}</label>
      <textarea
        rows="4"
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-slate-100 outline-none transition resize-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/15"
      />
    </div>
  );
}
