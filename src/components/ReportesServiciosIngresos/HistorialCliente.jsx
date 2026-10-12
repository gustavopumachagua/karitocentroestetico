import { FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto } from "./calcularMonto";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getAttentionDate } from "../../utils/attentionHistory";
import AtencionPendienteBadge from "../HistorialPacientes/AtencionPendienteBadge";

export default function HistorialCliente({ tratamientos, total, pagos = [] }) {
  return (
    <div className="ui-panel">
      <div className="ui-toolbar mb-6 border-b border-slate-700/50 pb-5">
        <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10">
          <FaClipboardList className="text-indigo-300 text-lg" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Historial de atenciones
        </h3>
        </div>
        <span className="ui-status">{tratamientos.length} registros</span>
      </div>

      {tratamientos.length > 0 ? (
        <ul className="space-y-3">
          {tratamientos.map((t, idx) => (
            <li
              key={t._id || idx}
              className="ui-card ui-card-interactive flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
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

              <div className="flex items-center gap-2 text-emerald-300 text-sm sm:text-base font-semibold">
                <FaMoneyBillWave className="text-emerald-300 text-sm sm:text-base" />
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

      <div className="ui-card mt-6 flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <span className="text-slate-300 font-medium text-sm sm:text-base">
          Total del historial:
        </span>
        <span className="text-emerald-300 font-bold text-lg sm:text-2xl flex items-center gap-2">
          <FaMoneyBillWave className="text-emerald-300" /> S/.{" "}
          {Number(total).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
