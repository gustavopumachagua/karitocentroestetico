import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";
import DetalleCita from "./DetalleCita";
import { FaUserMd } from "react-icons/fa";

export function CitaCard({
  cita,
  actualizarEstado,
  onSeleccionarCita,
  onEditarCita,
  showAcciones = true,
}) {
  return (
    <div
      className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950
                 rounded-lg border border-white/10 shadow-lg hover:border-cyan-300/30 hover:shadow-cyan-950/30
                 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]
                 p-5 cursor-pointer"
      onClick={() => onSeleccionarCita && onSeleccionarCita(cita)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">
            {typeof cita.cliente === "object"
              ? cita.cliente?.nombre
              : cita.cliente}
          </h3>
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <FaUserMd className="text-cyan-300" />
            {cita.profesional?.nombre || "Sin asignar"}
          </p>
        </div>
        <EstadoBadge estado={cita.estado} />
      </div>

      <hr className="border-gray-700 my-3" />

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
                      className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {serv}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">Sin servicios</span>
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
