import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";

export function CitaRow({
  cita,
  actualizarEstado,
  showAcciones = true,
  onSeleccionarCita,
  onEditarCita,
}) {
  return (
    <tr
      key={cita.id}
      className="cursor-pointer transition hover:bg-white/[0.04]"
      onClick={() => onSeleccionarCita && onSeleccionarCita(cita)}
    >
      <td className="p-3 text-slate-100">
        {typeof cita.cliente === "object" ? cita.cliente?.nombre : cita.cliente}
      </td>
      <td className="p-3 text-slate-300">{cita.rol}</td>
      <td className="p-3 text-slate-300">
        {cita.profesional?.nombre || "Sin asignar"}
      </td>
      <td className="p-3">
        {Array.isArray(cita.servicio) && cita.servicio.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cita.servicio.map((serv, idx) => (
              <span
                key={idx}
                className="rounded-full bg-cyan-300/12 px-2 py-1 text-xs font-medium text-cyan-100"
              >
                {serv}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Sin servicios</span>
        )}
      </td>

      <td className="p-3 text-slate-300">
        <FechaCita fecha={cita.fecha} />
      </td>
      <td className="p-3">
        <EstadoBadge estado={cita.estado} />
      </td>
      {showAcciones && (
        <td className="p-3">
          <AccionButtons
            id={cita._id || cita.id}
            cita={cita}
            estado={cita.estado}
            actualizarEstado={actualizarEstado}
            onEditarCita={onEditarCita}
          />
        </td>
      )}
    </tr>
  );
}
