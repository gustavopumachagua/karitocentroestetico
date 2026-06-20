import { FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto } from "./calcularMonto";

export default function HistorialCliente({ tratamientos, total, pagos = [] }) {
  return (
    <div className="page-panel page-panel-pad">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10">
          <FaClipboardList className="text-violet-300 text-lg" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Historial de Tratamientos
        </h3>
      </div>

      {tratamientos.length > 0 ? (
        <ul className="space-y-3">
          {tratamientos.map((t, idx) => (
            <li
              key={idx}
              className="rounded-xl border border-slate-700/70 bg-slate-950/25 p-4 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <div className="flex-1">
                <p className="text-slate-400 text-xs sm:text-sm">
                  {new Date(t.fecha).toLocaleDateString("es-PE")}
                </p>
                <p className="text-cyan-100 font-medium text-sm sm:text-base mt-1 leading-relaxed break-words">
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

      <div className="mt-6 bg-slate-950/30 border border-slate-700/70 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
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
