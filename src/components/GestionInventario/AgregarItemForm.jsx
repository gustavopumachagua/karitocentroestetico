import { FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import CustomSelect from "../common/CustomSelect";

export default function AgregarItemForm({
  nuevo,
  setNuevo,
  sugerencias,
  indexSeleccionado,
  handleNombreChange,
  handleKeyDown,
  handleSeleccionSugerencia,
  handleStockChange,
  handleUmbralChange,
  handleAgregar,
  nombreValido,
  stockExistente = 0,
}) {
  const [nuevoTotal, setNuevoTotal] = useState(stockExistente);

  useEffect(() => {
    const incremento = Number(nuevo.stock) || 0;
    setNuevoTotal(stockExistente + incremento);
  }, [nuevo.stock, stockExistente]);

  const deshabilitar =
    !nuevo.nombre.trim() ||
    !nombreValido ||
    (nuevo.tipo === "insumo" &&
      (nuevo.stock.trim() === "" || nuevo.umbral.trim() === ""));

  return (
    <section className="ui-panel">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10">
          <FaPlus className="text-indigo-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Agregar Insumo o Servicio
        </h3>
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ui-field">
          <label className="ui-label">Tipo</label>
          <CustomSelect
            value={nuevo.tipo}
            onValueChange={(value) =>
              setNuevo({
                ...nuevo,
                tipo: value,
                stock: "",
                umbral: "",
              })
            }
            accent="indigo"
            ariaLabel="Tipo de ítem"
            options={[
              { value: "insumo", label: "Insumo" },
              { value: "servicio", label: "Servicio" },
            ]}
          />
        </div>

        <div className="ui-field relative col-span-1 sm:col-span-2">
          <label className="ui-label">Nombre</label>
          <input
            type="text"
            aria-label="Nombre del insumo o servicio"
            aria-invalid={!nombreValido}
            placeholder="Ej: Crema hidratante (50ml)"
            value={nuevo.nombre}
            onChange={handleNombreChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className={`ui-control ${
              nombreValido ? "border-slate-700" : "border-rose-400"
            } focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/15`}
          />

          {sugerencias.length > 0 && (
            <div className="relative w-full">
              <ul className="search-suggestion-list relative mt-2">
                {sugerencias.map((nombre, index) => (
                  <li
                    key={index}
                    onClick={() => handleSeleccionSugerencia(nombre)}
                    className={`search-suggestion-item ${
                      index === indexSeleccionado ? "bg-indigo-400/10" : ""
                    }`}
                  >
                    {nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {nuevo.tipo === "insumo" && (
          <>
            <div className="ui-field">
              <label className="ui-label">Stock</label>
              <input
                type="number"
                aria-label="Stock que se añadirá"
                placeholder="0"
                value={nuevo.stock}
                onChange={handleStockChange}
                min="0"
                className="ui-control text-center focus:border-indigo-400/60 focus:ring-indigo-400/15"
              />
              {nuevo.stock && Number(nuevo.stock) > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  Stock actual:{" "}
                  <span className="text-indigo-300 font-semibold">
                    {stockExistente}
                  </span>{" "}
                  + Añadir:{" "}
                  <span className="text-amber-300 font-semibold">
                    {nuevo.stock}
                  </span>{" "}
                  =
                  <span className="text-emerald-300 font-semibold">
                    {" "}
                    {nuevoTotal}
                  </span>{" "}
                  total
                </p>
              )}
            </div>

            <div className="ui-field">
              <label className="ui-label">Umbral</label>
              <input
                type="number"
                aria-label="Umbral de stock"
                placeholder="0"
                value={nuevo.umbral}
                onChange={handleUmbralChange}
                min="0"
                className="ui-control text-center focus:border-indigo-400/60 focus:ring-indigo-400/15"
              />
            </div>
          </>
        )}

        <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
          <button
            disabled={deshabilitar}
            onClick={handleAgregar}
            className={`ui-button w-full ${
              deshabilitar
                ? "ui-button-secondary cursor-not-allowed"
                : "ui-button-primary"
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </section>
  );
}
