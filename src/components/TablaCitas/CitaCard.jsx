import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";
import DetalleCita from "./DetalleCita";
import { getProfessionalDisplayName } from "../../utils/professionalDirectory";

export function CitaCard({
  cita,
  actualizarEstado,
  onEditarCita,
  showAcciones = true,
  professionalNamesById,
}) {
  const nombreProfesional = getProfessionalDisplayName(
    cita,
    professionalNamesById,
  );

  return (
    <div className="rounded-lg border border-slate-700/60 p-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold leading-relaxed text-slate-100 break-words">
            {typeof cita.cliente === "object"
              ? cita.cliente?.nombre
              : cita.cliente}
          </h3>
          <p className="flex items-start gap-2 text-sm text-slate-400 break-words">
            {nombreProfesional || "Sin asignar"}
          </p>
        </div>
        <EstadoBadge estado={cita.estado} />
      </div>

      <hr className="border-slate-700/70 my-3" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-5">
        <DetalleCita label="Rol" value={cita.rol} />
        <DetalleCita label="Fecha" value={<FechaCita fecha={cita.fecha} />} />
        <div className="sm:col-span-2">
          <DetalleCita
            label="Servicio(s)"
            value={
              Array.isArray(cita.servicio) && cita.servicio.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                  {cita.servicio.map((serv, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-[var(--surface-raised)] px-2 py-1 text-xs text-slate-200 break-words"
                    >
                      {serv}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">Sin servicios</span>
              )
            }
          />
        </div>
      </div>

      {showAcciones && (
        <div className="flex justify-end">
          <AccionButtons
            id={cita._id || cita.id}
            cita={cita}
            estado={cita.estado}
            actualizarEstado={actualizarEstado}
            onEditarCita={onEditarCita}
          />
        </div>
      )}
    </div>
  );
}
