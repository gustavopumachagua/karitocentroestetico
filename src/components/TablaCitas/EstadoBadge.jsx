export function EstadoBadge({ estado }) {
  const baseClasses =
    "px-3 py-1 rounded-full border text-xs font-semibold inline-block";

  const estadoClasses = {
    pendiente: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    atendido: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    aplazado: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    cancelado: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  };

  return (
    <span className={`${baseClasses} ${estadoClasses[estado] || ""}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}
