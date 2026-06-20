import { FaTimes, FaMoneyBillWave } from "react-icons/fa";
import CustomSelect from "../common/CustomSelect";

export default function ModalRegistrarPago({
  citaSeleccionada,
  serviciosConPrecio,
  metodoPago,
  total,
  onPrecioChange,
  onMetodoPagoChange,
  onCancelar,
  onRegistrarPago,
  todosPreciosValidos,
}) {
  if (!citaSeleccionada) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="page-panel w-full max-w-lg rounded-xl shadow-2xl p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] transition-all duration-300">
        <button
          onClick={onCancelar}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="Cerrar"
        >
          <FaTimes size={18} />
        </button>

        <h3 className="text-xl sm:text-2xl font-bold text-emerald-300 mb-6 text-center sm:text-left">
          Registrar Pago de {citaSeleccionada.cliente}
        </h3>

        <div className="space-y-4 mb-6">
          <p className="text-slate-300 text-sm sm:text-base font-medium border-b border-slate-700/70 pb-2">
            Servicios realizados:
          </p>
          {serviciosConPrecio.map((serv, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-lg border border-slate-700/70 bg-slate-950/30 p-3"
            >
              <span className="text-white text-sm sm:text-base font-medium leading-relaxed break-words">
                {serv.nombre}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={serv.precio}
                onChange={(e) => onPrecioChange(index, e.target.value)}
                placeholder="Precio (S/)"
                className="w-full sm:w-36 rounded-lg border border-slate-700 bg-slate-950/50 p-2 text-white text-sm outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-slate-300 mb-2 font-medium text-sm sm:text-base">
            Método de Pago
          </label>
          <CustomSelect
            value={metodoPago}
            onValueChange={onMetodoPagoChange}
            accent="emerald"
            placeholder="Seleccionar..."
            options={[
              { value: "", label: "Seleccionar..." },
              { value: "efectivo", label: "Efectivo" },
              { value: "tarjeta", label: "Tarjeta" },
              { value: "yape/BCP", label: "Yape/BCP" },
              { value: "plin/BBVA", label: "Plin/BBVA" },
            ]}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-8 text-center sm:text-left">
          <span className="font-semibold text-slate-200 text-lg sm:text-xl">
            Monto Total:
          </span>
          <span className="text-emerald-300 font-bold text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <FaMoneyBillWave />
            S/ {Number(total || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancelar}
            className="w-full sm:w-auto rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-2 hover:bg-slate-700 transition text-white font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onRegistrarPago}
            disabled={!todosPreciosValidos() || !metodoPago}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              !todosPreciosValidos() || !metodoPago
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
}
