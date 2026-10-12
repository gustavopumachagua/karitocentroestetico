import { FaCalendarAlt, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto, obtenerPagoRelacionado } from "./calcularMonto";
import DatePickerField from "../common/DatePickerField";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getProfessionalDisplayName } from "../../utils/professionalDirectory";
import { getAttentionDate } from "../../utils/attentionHistory";
import AtencionPendienteBadge from "../HistorialPacientes/AtencionPendienteBadge";

export default function TablaServicios({
  fechaFiltro,
  setFechaFiltro,
  servicios,
  buscarCliente,
  totalIngresos,
  pagos = [],
  professionalNamesById,
}) {
  return (
    <div className="ui-panel">
      <div className="ui-toolbar mb-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10">
            <FaCalendarAlt className="text-indigo-300 text-lg" />
          </div>
          <h3 className="min-w-0 text-lg font-semibold leading-relaxed text-slate-100 break-words">
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

      <div role="region" tabIndex={0} aria-label="Servicios registrados: desplazamiento horizontal disponible" className="ui-table-wrap hidden sm:block">
        <table aria-label="Servicios registrados" className="ui-table min-w-[900px]">
          <thead>
            <tr>
              <th scope="col" className="p-4 border-b border-slate-700/70">Fecha</th>
              <th scope="col" className="p-4 border-b border-slate-700/70">Cliente</th>
              <th scope="col" className="p-4 border-b border-slate-700/70 min-w-[220px]">
                Servicio
              </th>
              <th scope="col" className="p-4 border-b border-slate-700/70">Rol</th>
              <th scope="col" className="p-4 border-b border-slate-700/70">
                Profesional
              </th>
              <th scope="col" className="p-4 border-b border-slate-700/70">
                Método de Pago
              </th>
              <th scope="col" className="p-4 border-b border-slate-700/70 text-right">
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
                const nombreProfesional = getProfessionalDisplayName(
                  t,
                  professionalNamesById,
                );

                return (
                  <tr
                    key={keyFila}
                    onClick={() => buscarCliente(t)}
                    className="cursor-pointer"
                  >
                    <td className="p-4 border-b border-slate-700/70 whitespace-nowrap text-slate-300">
                      {formatearFechaCita(getAttentionDate(t))}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 font-medium text-white">
                      {t.nombre}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 max-w-[320px] whitespace-normal break-words leading-relaxed text-indigo-100">
                      {Array.isArray(t.servicio)
                        ? t.servicio.join(", ")
                        : t.servicio}
                      <AtencionPendienteBadge record={t} className="mt-1" />
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-indigo-200">
                      {t.rol || "—"}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-slate-300">
                      {nombreProfesional || "—"}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-slate-300">
                      {pagoRelacionado?.metodoPago || (
                        <span className="text-slate-400 italic">
                          No registrado
                        </span>
                      )}
                    </td>
                    <td className="p-4 border-b border-slate-700/70 text-right text-emerald-300 font-semibold tabular-nums whitespace-nowrap">
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
            const nombreProfesional = getProfessionalDisplayName(
              t,
              professionalNamesById,
            );

            return (
              <div
                key={keyFila}
                onClick={() => buscarCliente(t)}
                className="ui-card ui-card-interactive cursor-pointer text-slate-200"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-slate-400">
                    {formatearFechaCita(getAttentionDate(t))}
                  </span>
                  <span className="text-emerald-300 font-semibold">
                    S/. {monto}
                  </span>
                </div>
                <p className="text-base font-medium break-words">{t.nombre}</p>
                <p className="text-sm text-indigo-100 leading-relaxed break-words">
                  {Array.isArray(t.servicio)
                    ? t.servicio.join(", ")
                    : t.servicio}
                </p>
                <AtencionPendienteBadge record={t} className="mt-1" />
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    <span className="text-slate-400">Rol: </span>
                    {t.rol || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Profesional: </span>
                    {nombreProfesional || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Pago: </span>
                    {pagoRelacionado?.metodoPago || (
                      <span className="text-slate-400 italic">
                        No registrado
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="ui-empty-state min-h-32 text-sm italic">
            No hay servicios registrados para esta fecha.
          </div>
        )}
      </div>

      <div className="ui-card mt-6 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <span className="text-slate-300 font-medium text-base sm:text-lg">
          Total ingresos del día:
        </span>
        <span className="flex flex-wrap items-center justify-center gap-2 text-lg font-semibold tabular-nums text-emerald-300 sm:text-2xl">
          <FaMoneyBillWave className="text-emerald-300" /> S/.{" "}
          {Number(totalIngresos).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
