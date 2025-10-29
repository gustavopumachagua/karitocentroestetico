import { FaClipboardList, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaInsumos({
  insumos,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (insumos.length === 0) return null;

  return (
    <section className="bg-gray-800/60 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-md hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-green-400">
        <FaClipboardList className="text-green-400" /> Insumos –{" "}
        {rolSeleccionado}
      </h3>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border-collapse text-gray-300 text-center">
          <thead className="bg-gray-700/70 text-gray-100 uppercase text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Umbral</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((item) => (
              <tr
                key={item._id}
                className={`border-t border-gray-700 transition-colors ${
                  item.stock === 0
                    ? "bg-red-900/50 hover:bg-red-800/60 text-red-200"
                    : "bg-gray-800/40 hover:bg-gray-700/50"
                }`}
              >
                <td className="px-4 py-3 text-left font-medium">
                  {item.nombre}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.umbral}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center items-center gap-5 sm:gap-6 flex-wrap">
                    <button
                      onClick={() => onEditar(item)}
                      className="text-blue-400 hover:text-blue-600 transition-transform hover:scale-110 cursor-pointer"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onEliminar(item)}
                      className="text-red-400 hover:text-red-600 transition-transform hover:scale-110 cursor-pointer"
                      title="Eliminar"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden flex flex-col gap-3 mt-3">
        {insumos.map((item) => (
          <div
            key={item._id}
            className={`rounded-lg p-3 border ${
              item.stock <= item.umbral
                ? "border-red-500/40 bg-red-900/20"
                : "border-gray-600 bg-gray-700/40"
            } flex justify-between items-center hover:bg-gray-700/60 transition-all`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-gray-100 font-medium">{item.nombre}</span>
              <span className="text-sm text-gray-400">
                Stock:{" "}
                <span
                  className={`font-semibold ${
                    item.stock <= item.umbral
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {item.stock}
                </span>{" "}
                / Umbral: <span className="text-gray-300">{item.umbral}</span>
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => onEditar(item)}
                className="text-blue-400 hover:text-blue-600 transition-transform hover:scale-110 cursor-pointer"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onEliminar(item)}
                className="text-red-400 hover:text-red-600 transition-transform hover:scale-110 cursor-pointer"
                title="Eliminar"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
