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
    <section className="page-panel page-panel-pad">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
          <FaPlus className="text-emerald-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-white">
          Agregar Insumo o Servicio
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        <div className="flex flex-col">
          <label className="text-slate-300 text-sm mb-2">Tipo</label>
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
            accent="emerald"
            options={[
              { value: "insumo", label: "Insumo" },
              { value: "servicio", label: "Servicio" },
            ]}
          />
        </div>

        <div className="flex flex-col relative col-span-1 sm:col-span-2">
          <label className="text-slate-300 text-sm mb-2">Nombre</label>
          <input
            type="text"
            placeholder="Ej: Crema hidratante (50ml)"
            value={nuevo.nombre}
            onChange={handleNombreChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className={`w-full rounded-lg border bg-slate-950/50 px-4 py-2.5 text-slate-200 outline-none transition placeholder:text-slate-600 ${
              nombreValido ? "border-slate-700" : "border-rose-400"
            } focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15`}
          />

          {sugerencias.length > 0 && (
            <div className="relative w-full">
              <ul className="bg-slate-950/95 border border-slate-700 rounded-lg mt-2 w-full max-h-40 overflow-y-auto shadow-lg z-10 backdrop-blur-xl">
                {sugerencias.map((nombre, index) => (
                  <li
                    key={index}
                    onClick={() => handleSeleccionSugerencia(nombre)}
                    className={`px-4 py-2 cursor-pointer text-slate-200 hover:bg-emerald-400/10 hover:text-white ${
                      index === indexSeleccionado ? "bg-emerald-400/10" : ""
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
            <div className="flex flex-col">
              <label className="text-slate-300 text-sm mb-2">Stock</label>
              <input
                type="number"
                placeholder="0"
                value={nuevo.stock}
                onChange={handleStockChange}
                min="0"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-center text-slate-200 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
              />
              {nuevo.stock && Number(nuevo.stock) > 0 && (
                <p className="text-sm text-slate-400 mt-2">
                  Stock actual:{" "}
                  <span className="text-cyan-300 font-semibold">
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

            <div className="flex flex-col">
              <label className="text-slate-300 text-sm mb-2">Umbral</label>
              <input
                type="number"
                placeholder="0"
                value={nuevo.umbral}
                onChange={handleUmbralChange}
                min="0"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-2.5 text-center text-slate-200 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
              />
            </div>
          </>
        )}

        <div className="flex flex-col justify-end sm:col-span-2 lg:col-span-1">
          <button
            disabled={deshabilitar}
            onClick={handleAgregar}
            className={`w-full py-2.5 rounded-lg font-semibold transition-transform duration-200 ${
              deshabilitar
                ? "bg-slate-700 cursor-not-allowed text-slate-400"
                : "bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white cursor-pointer shadow-md shadow-emerald-950/30"
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </section>
  );
}
