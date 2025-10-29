import { FaTimes, FaMoneyBillWave } from "react-icons/fa";

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
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-700 p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] transition-all duration-300">
        <button
          onClick={onCancelar}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          aria-label="Cerrar"
        >
          <FaTimes size={18} />
        </button>

        <h3 className="text-xl sm:text-2xl font-bold text-green-400 mb-6 text-center sm:text-left">
          Registrar Pago de {citaSeleccionada.cliente}
        </h3>

        <div className="space-y-4 mb-6">
          <p className="text-gray-300 text-sm sm:text-base font-medium border-b border-gray-700 pb-2">
            Servicios realizados:
          </p>
          {serviciosConPrecio.map((serv, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 bg-gray-800/50 rounded-lg p-3 border border-gray-700"
            >
              <span className="text-white truncate text-sm sm:text-base font-medium">
                {serv.nombre}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={serv.precio}
                onChange={(e) => onPrecioChange(index, e.target.value)}
                placeholder="Precio (S/)"
                className="w-full sm:w-36 bg-gray-700 p-2 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium text-sm sm:text-base">
            Método de Pago
          </label>
          <select
            value={metodoPago}
            onChange={(e) => onMetodoPagoChange(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
          >
            <option value="">Seleccionar...</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="yape">Yape</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-8 text-center sm:text-left">
          <span className="font-semibold text-gray-200 text-lg sm:text-xl">
            Monto Total:
          </span>
          <span className="text-green-400 font-bold text-2xl sm:text-3xl flex items-center justify-center gap-2">
            <FaMoneyBillWave />
            S/ {Number(total || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancelar}
            className="w-full sm:w-auto bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition text-white font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onRegistrarPago}
            disabled={!todosPreciosValidos() || !metodoPago}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
              !todosPreciosValidos() || !metodoPago
                ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
}
