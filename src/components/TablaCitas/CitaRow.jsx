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
      className="cursor-pointer bg-slate-950/20 transition hover:bg-cyan-400/5"
      onClick={() => onSeleccionarCita && onSeleccionarCita(cita)}
    >
      <td className="p-3 font-medium text-white">
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
                className="rounded-full border border-cyan-400/15 bg-cyan-300/12 px-2 py-1 text-xs font-medium text-cyan-100"
              >
                {serv}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">Sin servicios</span>
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
