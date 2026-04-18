import { formatearFechaCita } from "../../utils/citasFecha";

export default function FechaCita({ fecha }) {
  if (!fecha) return <span className="text-gray-400">Sin fecha</span>;

  const fechaFormateada = formatearFechaCita(fecha);

  return <span>{fechaFormateada}</span>;
}
