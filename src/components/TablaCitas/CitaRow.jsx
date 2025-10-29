import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";

export function CitaRow({
  cita,
  actualizarEstado,
  showAcciones = true,
  onSeleccionarCita,
}) {
  return (
    <tr
      key={cita.id}
      className="hover:bg-gray-800 transition cursor-pointer"
      onClick={() => onSeleccionarCita && onSeleccionarCita(cita)}
    >
      <td className="p-3 border border-gray-600">
        {typeof cita.cliente === "object" ? cita.cliente?.nombre : cita.cliente}
      </td>
      <td className="p-3 border border-gray-600">{cita.rol}</td>
      <td className="p-3 border border-gray-600">
        {cita.profesional?.nombre || "Sin asignar"}
      </td>
      <td className="p-3 border border-gray-600">
        {Array.isArray(cita.servicio) && cita.servicio.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cita.servicio.map((serv, idx) => (
              <span
                key={idx}
                className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs"
              >
                {serv}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Sin servicios</span>
        )}
      </td>

      <td className="p-3 border border-gray-600">
        <FechaCita fecha={cita.fecha} />
      </td>
      <td className="p-3 border border-gray-600">
        <EstadoBadge estado={cita.estado} />
      </td>
      {showAcciones && (
        <td className="p-3 border border-gray-600">
          <AccionButtons
            id={cita._id || cita.id}
            estado={cita.estado}
            actualizarEstado={actualizarEstado}
          />
        </td>
      )}
    </tr>
  );
}
