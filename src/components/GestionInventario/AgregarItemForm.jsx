import { FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";

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
    <section className="bg-gray-800/70 border border-gray-700 rounded-2xl p-5 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg sm:text-xl font-semibold mb-5 flex items-center gap-2 text-green-400">
        <FaPlus className="text-green-400" /> Agregar Insumo o Servicio
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        <div className="flex flex-col">
          <label className="text-gray-300 text-sm mb-1">Tipo</label>
          <select
            value={nuevo.tipo}
            onChange={(e) =>
              setNuevo({
                ...nuevo,
                tipo: e.target.value,
                stock: "",
                umbral: "",
              })
            }
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-600 text-gray-200 cursor-pointer focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none transition"
          >
            <option value="insumo">Insumo</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>

        <div className="flex flex-col relative col-span-1 sm:col-span-2">
          <label className="text-gray-300 text-sm mb-1">Nombre</label>
          <input
            type="text"
            placeholder="Ej: Crema hidratante (50ml)"
            value={nuevo.nombre}
            onChange={handleNombreChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            className={`w-full px-4 py-2 rounded-lg bg-gray-900 border ${
              nombreValido ? "border-gray-600" : "border-red-500"
            } text-gray-200 focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none transition`}
          />

          {sugerencias.length > 0 && (
            <div className="relative w-full">
              <ul className="bg-gray-900 border border-gray-700 rounded-lg mt-2 w-full max-h-40 overflow-y-auto shadow-lg z-10">
                {sugerencias.map((nombre, index) => (
                  <li
                    key={index}
                    onClick={() => handleSeleccionSugerencia(nombre)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-700/70 ${
                      index === indexSeleccionado ? "bg-gray-700" : ""
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
              <label className="text-gray-300 text-sm mb-1">Stock</label>
              <input
                type="number"
                placeholder="0"
                value={nuevo.stock}
                onChange={handleStockChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-600 text-gray-200 text-center focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none transition"
              />
              {nuevo.stock && Number(nuevo.stock) > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Stock actual:{" "}
                  <span className="text-blue-300 font-semibold">
                    {stockExistente}
                  </span>{" "}
                  + Añadir:{" "}
                  <span className="text-yellow-300 font-semibold">
                    {nuevo.stock}
                  </span>{" "}
                  =
                  <span className="text-green-300 font-semibold">
                    {" "}
                    {nuevoTotal}
                  </span>{" "}
                  total
                </p>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-300 text-sm mb-1">Umbral</label>
              <input
                type="number"
                placeholder="0"
                value={nuevo.umbral}
                onChange={handleUmbralChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-600 text-gray-200 text-center focus:border-green-500 focus:ring focus:ring-green-500/30 outline-none transition"
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
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-green-600 hover:bg-green-700 hover:scale-105 text-white cursor-pointer"
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </section>
  );
}
