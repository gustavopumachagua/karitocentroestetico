import { FaSpa, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaServicios({
  servicios,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (servicios.length === 0) return null;

  return (
    <section className="bg-gray-800/60 rounded-2xl p-4 sm:p-6 border border-gray-700 shadow-md hover:shadow-xl transition-all duration-300 mb-6">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-400">
        <FaSpa className="text-indigo-400" /> Servicios – {rolSeleccionado}
      </h3>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full border-collapse text-gray-300 text-center">
          <thead className="bg-gray-700/70 text-gray-100 uppercase text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((item) => (
              <tr
                key={item._id}
                className="border-t border-gray-700 bg-gray-800/40 hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3 text-left font-medium">
                  {item.nombre}
                </td>
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

      <div className="sm:hidden flex flex-col gap-3">
        {servicios.map((item) => (
          <div
            key={item._id}
            className="bg-gray-700/40 rounded-lg p-3 border border-gray-600 flex justify-between items-center hover:bg-gray-700/60 transition-all"
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-100">{item.nombre}</span>
              <span className="text-sm text-gray-400">Servicio</span>
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
