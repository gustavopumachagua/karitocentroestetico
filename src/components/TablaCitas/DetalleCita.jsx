export default function DetalleCita({ label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <span className="w-20 shrink-0 text-sm font-medium text-slate-400">{label}:</span>
      <span className="min-w-0 text-sm leading-relaxed text-slate-100 break-words">{value}</span>
    </div>
  );
}
