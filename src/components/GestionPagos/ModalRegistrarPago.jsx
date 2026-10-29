import { FaTimes } from "react-icons/fa";
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

        <h3 className="pr-12 text-lg font-semibold text-slate-100">
          Registrar pago
        </h3>
        <p className="mb-6 mt-1 pr-12 text-sm text-slate-400 break-words">{citaSeleccionada.cliente}</p>

        <div className="space-y-4 mb-6">
          <p className="text-slate-300 text-sm sm:text-base font-medium border-b border-slate-700/70 pb-2">
            Servicios realizados:
          </p>
          {serviciosConPrecio.map((serv, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border-b border-slate-700/50 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[var(--surface-raised)] p-4">
          <span className="font-medium text-slate-300 text-sm">
            Monto Total:
          </span>
          <span className="text-2xl font-semibold tabular-nums text-slate-100">
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
