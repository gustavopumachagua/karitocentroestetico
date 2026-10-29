import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";
import { getProfessionalDisplayName } from "../../utils/professionalDirectory";

export function CitaRow({
  cita,
  actualizarEstado,
  showAcciones = true,
  onEditarCita,
  professionalNamesById,
}) {
  const nombreProfesional = getProfessionalDisplayName(
    cita,
    professionalNamesById,
  );

  return (
    <tr key={cita.id} className="bg-slate-950/10">
      <td className="p-3 min-w-44 font-medium text-white">
        {typeof cita.cliente === "object" ? cita.cliente?.nombre : cita.cliente}
      </td>
      <td className="p-3 text-slate-400 capitalize">{cita.rol}</td>
      <td className="p-3 text-slate-300">
        {nombreProfesional || "Sin asignar"}
      </td>
      <td className="p-3">
        {Array.isArray(cita.servicio) && cita.servicio.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cita.servicio.map((serv, idx) => (
              <span
                key={idx}
                className="rounded-md bg-[var(--surface-raised)] px-2 py-1 text-xs text-slate-200"
              >
                {serv}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">Sin servicios</span>
        )}
      </td>

      <td className="p-3 whitespace-nowrap tabular-nums text-slate-300">
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
