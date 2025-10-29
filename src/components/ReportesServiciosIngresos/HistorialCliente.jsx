import { FaClipboardList, FaMoneyBillWave } from "react-icons/fa";
import { calcularMonto } from "./calcularMonto";

export default function HistorialCliente({ tratamientos, total, pagos = [] }) {
  return (
    <div className="bg-gray-800/90 rounded-2xl p-5 sm:p-8 border border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-3">
        <FaClipboardList className="text-indigo-400 text-xl" />
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Historial de Tratamientos
        </h3>
      </div>

      {tratamientos.length > 0 ? (
        <ul className="divide-y divide-gray-700">
          {tratamientos.map((t, idx) => (
            <li
              key={idx}
              className="py-3 sm:py-4 rounded-lg transition-all px-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
            >
              <div className="flex-1">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {new Date(t.fecha).toLocaleDateString("es-PE")}
                </p>
                <p className="text-indigo-400 font-medium text-sm sm:text-base mt-1">
                  {Array.isArray(t.servicio)
                    ? t.servicio.join(", ")
                    : t.servicio}
                </p>
              </div>

              <div className="flex items-center gap-2 text-green-400 text-sm sm:text-base font-semibold">
                <FaMoneyBillWave className="text-green-400 text-sm sm:text-base" />
                S/. {Number(calcularMonto(t, pagos)).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 italic text-center py-6">
          No hay tratamientos registrados.
        </p>
      )}

      <div className="mt-6 bg-gray-900/60 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <span className="text-gray-300 font-medium text-sm sm:text-base">
          Total del historial:
        </span>
        <span className="text-green-400 font-bold text-lg sm:text-2xl flex items-center gap-2">
          <FaMoneyBillWave className="text-green-400" /> S/.{" "}
          {Number(total).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
