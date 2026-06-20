import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto, obtenerPagoRelacionado } from "./calcularMonto";
import DatePickerField from "../common/DatePickerField";

export default function TablaServicios({
  fechaFiltro,
  setFechaFiltro,
  servicios,
  buscarCliente,
  totalIngresos,
  pagos = [],
}) {
  return (
    <div className="page-panel page-panel-pad">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
            <FaCalendarAlt className="text-cyan-300 text-lg" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Reporte de Servicios del Día
          </h3>
        </div>
        <DatePickerField
          value={fechaFiltro}
          onValueChange={setFechaFiltro}
          placeholder="dd/mm/aaaa"
          className="w-full sm:w-52"
        />
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-700/70">
        <table className="w-full text-sm sm:text-base text-left border-collapse">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="p-4 border-b border-slate-700/70">Fecha</th>
              <th className="p-4 border-b border-slate-700/70">Cliente</th>
              <th className="p-4 border-b border-slate-700/70 min-w-[220px]">
                Servicio
              </th>
              <th className="p-4 border-b border-slate-700/70">Rol</th>
              <th className="p-4 border-b border-slate-700/70">
                Profesional
              </th>
              <th className="p-4 border-b border-slate-700/70">
                Método de Pago
              </th>
              <th className="p-4 border-b border-slate-700/70 text-right">
                Monto (S/.)
              </th>
            </tr>
          </thead>
          <tbody>
            {servicios.length > 0 ? (
              servicios.map((t, idx) => {
                const pagoRelacionado = obtenerPagoRelacionado(t, pagos);
                const monto = Number(calcularMonto(t, pagos)).toFixed(2);
                const keyFila = t._id || `${t.nombre}-${t.fecha}-${idx}`;

                return (
                  <tr
                    key={keyFila}
                    onClick={() => buscarCliente(t.nombre)}
                    className="bg-slate-950/20 hover:bg-cyan-400/5 cursor-pointer transition-all duration-200"
                  >
                    <td className="p-4 border-b border-slate-700/70 whitespace-nowrap text-slate-300">
                      {new Date(t.fecha).toLocaleDateString("es-PE")}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 font-medium text-white">
                      {t.nombre}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 max-w-[320px] whitespace-normal break-words leading-relaxed text-cyan-100">
                      {Array.isArray(t.servicio)
                        ? t.servicio.join(", ")
                        : t.servicio}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-violet-200">
                      {t.rol || "—"}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-slate-300">
                      {t.profesional || "—"}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-slate-300">
                      {pagoRelacionado?.metodoPago || (
                        <span className="text-slate-500 italic">
                          No registrado
                        </span>
                      )}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-right text-emerald-300 font-semibold whitespace-nowrap">
                      S/. {monto}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-slate-400 p-5 italic bg-slate-950/20"
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
          servicios.map((t, idx) => {
            const pagoRelacionado = obtenerPagoRelacionado(t, pagos);
            const monto = Number(calcularMonto(t, pagos)).toFixed(2);
            const keyFila = t._id || `${t.nombre}-${t.fecha}-${idx}`;

            return (
              <div
                key={keyFila}
                onClick={() => buscarCliente(t.nombre)}
                className="glass-card p-4 text-slate-200 cursor-pointer"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">
                    {new Date(t.fecha).toLocaleDateString("es-PE")}
                  </span>
                  <span className="text-emerald-300 font-semibold">
                    S/. {monto}
                  </span>
                </div>
                <p className="text-base font-medium">{t.nombre}</p>
                <p className="text-sm text-cyan-100 leading-relaxed break-words">
                  {Array.isArray(t.servicio)
                    ? t.servicio.join(", ")
                    : t.servicio}
                </p>
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <span className="text-slate-400">Rol: </span>
                    {t.rol || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Profesional: </span>
                    {t.profesional || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Pago: </span>
                    {pagoRelacionado?.metodoPago || (
                      <span className="text-slate-500 italic">
                        No registrado
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-slate-400 italic p-5 bg-slate-950/25 rounded-xl border border-slate-700/70">
            No hay servicios registrados para esta fecha.
          </div>
        )}
      </div>

      <div className="mt-6 p-5 bg-slate-950/30 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 border border-slate-700/70 text-center sm:text-left">
        <span className="text-slate-300 font-medium text-base sm:text-lg">
          Total ingresos del día:
        </span>
        <span className="text-emerald-300 font-bold text-lg sm:text-2xl flex items-center gap-2">
          <FaMoneyBillWave className="text-emerald-300" /> S/.{" "}
          {Number(totalIngresos).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
