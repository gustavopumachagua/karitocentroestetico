import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto } from "./calcularMonto";

export default function TablaServicios({
  fechaFiltro,
  setFechaFiltro,
  servicios,
  buscarCliente,
  totalIngresos,
  pagos = [],
}) {
  return (
    <div className="bg-gray-800/70 rounded-2xl p-5 sm:p-8 border border-gray-700 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-indigo-400 text-lg" />
          <h3 className="text-xl font-semibold text-white">
            Reporte de Servicios del Día
          </h3>
        </div>
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base w-full sm:w-auto"
        />
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-700">
        <table className="w-full text-sm sm:text-base text-left border-collapse">
          <thead className="bg-gray-700/60 text-gray-200">
            <tr>
              <th className="p-4 border-b border-gray-600">Fecha</th>
              <th className="p-4 border-b border-gray-600">Cliente</th>
              <th className="p-4 border-b border-gray-600">Servicio</th>
              <th className="p-4 border-b border-gray-600">Rol</th>
              <th className="p-4 border-b border-gray-600">Profesional</th>
              <th className="p-4 border-b border-gray-600">Método de Pago</th>
              <th className="p-4 border-b border-gray-600 text-right">
                Monto (S/.)
              </th>
            </tr>
          </thead>
          <tbody>
            {servicios.length > 0 ? (
              servicios.map((t, idx) => (
                <tr
                  key={idx}
                  onClick={() => buscarCliente(t.nombre)}
                  className="hover:bg-gray-700/40 cursor-pointer transition-all duration-200"
                >
                  <td className="p-4 border-b border-gray-700 whitespace-nowrap">
                    {new Date(t.fecha).toLocaleDateString("es-PE")}
                  </td>
                  <td className="p-4 border-b border-gray-700">{t.nombre}</td>
                  <td className="p-4 border-b border-gray-700">
                    {Array.isArray(t.servicio)
                      ? t.servicio.join(", ")
                      : t.servicio}
                  </td>
                  <td className="p-4 border-b border-gray-700 text-indigo-300">
                    {t.rol || "—"}
                  </td>
                  <td className="p-4 border-b border-gray-700">
                    {t.profesional || "—"}
                  </td>
                  <td className="p-4 border-b border-gray-700">
                    {pagos.find(
                      (p) =>
                        p.cliente.toLowerCase() === t.nombre.toLowerCase() &&
                        new Date(p.fecha).toDateString() ===
                          new Date(t.fecha).toDateString()
                    )?.metodoPago || (
                      <span className="text-gray-500 italic">
                        No registrado
                      </span>
                    )}
                  </td>
                  <td className="p-4 border-b border-gray-700 text-right text-green-400 font-semibold whitespace-nowrap">
                    S/. {calcularMonto(t, pagos)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-400 p-5 italic bg-gray-700/20"
                >
                  No hay servicios registrados para esta fecha.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-4">
        {servicios.length > 0 ? (
          servicios.map((t, idx) => (
            <div
              key={idx}
              onClick={() => buscarCliente(t.nombre)}
              className="bg-gray-700/50 border border-gray-600 rounded-xl p-4 text-gray-200 hover:bg-gray-700/70 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  {new Date(t.fecha).toLocaleDateString("es-PE")}
                </span>
                <span className="text-green-400 font-semibold">
                  S/. {calcularMonto(t, pagos)}
                </span>
              </div>
              <p className="text-base font-medium">{t.nombre}</p>
              <p className="text-sm text-indigo-300">
                {Array.isArray(t.servicio) ? t.servicio.join(", ") : t.servicio}
              </p>
              <div className="mt-2 text-sm space-y-1">
                <p>
                  <span className="text-gray-400">Rol: </span>
                  {t.rol || "—"}
                </p>
                <p>
                  <span className="text-gray-400">Profesional: </span>
                  {t.profesional || "—"}
                </p>
                <p>
                  <span className="text-gray-400">Pago: </span>
                  {pagos.find(
                    (p) =>
                      p.cliente.toLowerCase() === t.nombre.toLowerCase() &&
                      new Date(p.fecha).toDateString() ===
                        new Date(t.fecha).toDateString()
                  )?.metodoPago || (
                    <span className="text-gray-500 italic">No registrado</span>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 italic p-5 bg-gray-700/20 rounded-xl border border-gray-600">
            No hay servicios registrados para esta fecha.
          </div>
        )}
      </div>

      <div className="mt-6 p-5 bg-gray-700/50 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 border border-gray-600 text-center sm:text-left">
        <span className="text-gray-300 font-medium text-base sm:text-lg">
          Total ingresos del día:
        </span>
        <span className="text-green-400 font-bold text-lg sm:text-2xl flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" /> S/. {totalIngresos}
        </span>
      </div>
    </div>
  );
}
