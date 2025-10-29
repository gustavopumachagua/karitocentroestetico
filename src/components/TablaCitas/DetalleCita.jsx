export default function DetalleCita({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm font-medium w-20">{label}:</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}
