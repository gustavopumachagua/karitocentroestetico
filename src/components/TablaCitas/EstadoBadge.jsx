export function EstadoBadge({ estado }) {
  const baseClasses = "px-3 py-1 rounded-full text-xs font-medium inline-block";

  const estadoClasses = {
    pendiente: "bg-yellow-600/20 text-yellow-400",
    atendido: "bg-green-600/20 text-green-400",
    aplazado: "bg-blue-600/20 text-blue-400",
    cancelado: "bg-red-600/20 text-red-400",
  };

  return (
    <span className={`${baseClasses} ${estadoClasses[estado] || ""}`}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </span>
  );
}
