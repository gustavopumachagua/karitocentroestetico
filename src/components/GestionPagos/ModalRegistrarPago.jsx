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
    <div className="ui-modal-backdrop z-[1000]">
      <div role="dialog" aria-modal="true" aria-label="Registrar pago" className="ui-modal relative max-w-lg p-5 sm:p-7">
        <button
          onClick={onCancelar}
          className="ui-icon-button absolute right-4 top-4"
          aria-label="Cerrar"
        >
          <FaTimes size={18} />
        </button>

        <h3 className="mb-6 pr-12 text-xl font-semibold text-slate-100 break-words sm:text-2xl">
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
                aria-label={`Precio de ${serv.nombre} en soles`}
                min="0"
                step="0.01"
                value={serv.precio}
                onChange={(e) => onPrecioChange(index, e.target.value)}
                placeholder="Precio (S/)"
                className="ui-control tabular-nums sm:w-36 sm:shrink-0"
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
            ariaLabel="Método de pago"
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
          <span className="flex flex-wrap items-center justify-center gap-2 text-2xl font-semibold tabular-nums text-emerald-300 sm:text-3xl">
            <FaMoneyBillWave />
            S/ {Number(total || 0).toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancelar}
            className="ui-button ui-button-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={onRegistrarPago}
            disabled={!todosPreciosValidos() || !metodoPago}
            className={`ui-button w-full sm:w-auto ${
              !todosPreciosValidos() || !metodoPago
                ? "ui-button-secondary cursor-not-allowed"
                : "ui-button-primary"
            }`}
          >
            Registrar Pago
          </button>
        </div>
      </div>
    </div>
  );
}
