export default function FechaCita({ fecha }) {
  if (!fecha) return <span className="text-gray-400">Sin fecha</span>;

  const fechaFormateada = new Date(fecha).toLocaleString("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  });

  return <span>{fechaFormateada}</span>;
}
