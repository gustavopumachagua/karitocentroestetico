import { calcularMonto } from "./calcularMonto";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getAttentionDate } from "../../utils/attentionHistory";
import AtencionPendienteBadge from "../HistorialPacientes/AtencionPendienteBadge";

export default function HistorialCliente({ tratamientos, total, pagos = [] }) {
  return (
    <div className="ui-panel">
      <div className="ui-toolbar mb-6 border-b border-slate-700/50 pb-5">
        <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-white">
          Historial de atenciones
        </h3>
        </div>
        <span className="ui-status">{tratamientos.length} registros</span>
      </div>

      {tratamientos.length > 0 ? (
        <ul className="divide-y divide-slate-700/50">
          {tratamientos.map((t, idx) => (
            <li
              key={t._id || idx}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-slate-400 text-xs sm:text-sm">
                  {formatearFechaCita(getAttentionDate(t))}
                </p>
                <AtencionPendienteBadge record={t} className="mt-1" />
                <p className="text-indigo-100 font-medium text-sm sm:text-base mt-1 leading-relaxed break-words">
                  {Array.isArray(t.servicio)
                    ? t.servicio.join(", ")
                    : t.servicio}
                </p>
              </div>

              <div className="text-slate-100 text-sm font-medium tabular-nums whitespace-nowrap">
                S/. {Number(calcularMonto(t, pagos)).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400 italic text-center py-6">
          No hay tratamientos registrados.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/60 pt-5">
        <span className="text-slate-300 font-medium text-sm sm:text-base">
          Total del historial:
        </span>
        <span className="text-slate-100 font-semibold tabular-nums text-2xl">
          S/.{" "}
          {Number(total).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
