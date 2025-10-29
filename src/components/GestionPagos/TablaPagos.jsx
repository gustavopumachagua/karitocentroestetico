import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

export default function TablaPagos({ citas, pagoPorCita, onSeleccionCita }) {
  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-700 shadow-md">
        <table className="min-w-full border-collapse text-sm lg:text-base">
          <thead className="bg-gray-700 text-gray-300 uppercase text-xs sm:text-sm">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Profesional</th>
              <th className="p-3 text-left">Rol</th>
              <th className="p-3 text-left">Servicios</th>
              <th className="p-3 text-left">Método</th>
              <th className="p-3 text-left">Monto</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => {
              const pago = pagoPorCita(cita._id);
              const bloqueado = pago?.estadoPago === "pagado";

              return (
                <tr
                  key={cita._id}
                  className={`border-b border-gray-700 ${
                    bloqueado
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-gray-700/40 cursor-pointer"
                  } transition`}
                  onClick={() => !bloqueado && onSeleccionCita(cita)}
                >
                  <td className="p-3 font-medium text-white truncate">
                    {cita.cliente}
                  </td>
                  <td className="p-3 text-gray-300 truncate">
                    {cita.profesional?.nombre || "—"}
                  </td>
                  <td className="p-3 text-gray-300 truncate capitalize">
                    {cita.profesional?.rol || "—"}
                  </td>
                  <td className="p-3 text-gray-300 truncate max-w-[250px]">
                    {pago
                      ? pago.servicios.map((s) => s.nombre).join(", ")
                      : "—"}
                  </td>
                  <td className="p-3 capitalize text-gray-300">
                    {pago ? pago.metodoPago : "—"}
                  </td>
                  <td className="p-3 font-semibold text-green-400">
                    S/ {pago ? pago.total.toFixed(2) : "0.00"}
                  </td>
                  <td className="p-3 text-gray-400 whitespace-nowrap">
                    {new Date(cita.fecha).toLocaleDateString("es-PE")}
                  </td>
                  <td className="p-3">
                    {pago?.estadoPago === "pagado" ? (
                      <span className="flex items-center gap-1 text-green-400 font-semibold">
                        <FaCheckCircle /> Pagado
                      </span>
                    ) : pago?.estadoPago === "cancelado" ? (
                      <span className="flex items-center gap-1 text-red-400 font-semibold">
                        <FaTimesCircle /> Cancelado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                        <FaClock /> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {citas.map((cita) => {
          const pago = pagoPorCita(cita._id);
          const bloqueado = pago?.estadoPago === "pagado";

          return (
            <div
              key={cita._id}
              onClick={() => !bloqueado && onSeleccionCita(cita)}
              className={`p-4 bg-gray-700/60 rounded-xl border border-gray-600 shadow-md transition ${
                bloqueado
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-indigo-400 hover:bg-gray-700/80 cursor-pointer"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-white text-sm">
                  {cita.cliente}
                </h3>
                <span className="text-gray-400 text-xs">
                  {new Date(cita.fecha).toLocaleDateString("es-PE")}
                </span>
              </div>

              <p className="text-gray-300 text-sm">
                <span className="font-medium text-indigo-400">
                  {cita.profesional?.nombre || "—"}
                </span>{" "}
                ({cita.profesional?.rol || "—"})
              </p>

              <p className="text-gray-400 text-xs mt-1 truncate">
                {pago ? pago.servicios.map((s) => s.nombre).join(", ") : "—"}
              </p>

              <div className="flex justify-between items-center mt-3">
                <span className="text-green-400 font-semibold text-sm">
                  S/ {pago ? pago.total.toFixed(2) : "0.00"}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  {pago?.estadoPago === "pagado" ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <FaCheckCircle /> Pagado
                    </span>
                  ) : pago?.estadoPago === "cancelado" ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <FaTimesCircle /> Cancelado
                    </span>
                  ) : (
                    <span className="text-yellow-400 flex items-center gap-1">
                      <FaClock /> Pendiente
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
