import { EstadoBadge } from "./EstadoBadge";
import { AccionButtons } from "./AccionButtons";
import FechaCita from "./FechaCita";
import DetalleCita from "./DetalleCita";

export function CitaCard({
  cita,
  actualizarEstado,
  onSeleccionarCita,
  showAcciones = true,
}) {
  return (
    <div
      className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900
                 rounded-2xl border border-gray-700 shadow-lg hover:shadow-indigo-500/20
                 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]
                 p-5 cursor-pointer"
      onClick={() => onSeleccionarCita && onSeleccionarCita(cita)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white tracking-wide">
            {typeof cita.cliente === "object"
              ? cita.cliente?.nombre
              : cita.cliente}
          </h3>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            👩‍⚕️ {cita.profesional?.nombre || "Sin asignar"}
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
            estado={cita.estado}
            actualizarEstado={actualizarEstado}
          />
        </div>
      )}
    </div>
  );
}
