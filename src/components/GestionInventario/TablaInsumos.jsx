import { FaClipboardList, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaInsumos({
  insumos,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (insumos.length === 0) return null;

  return (
    <section className="page-panel page-panel-pad">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10">
            <FaClipboardList className="text-emerald-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Insumos – {rolSeleccionado}
          </h3>
        </div>

        <span className="w-fit rounded-lg border border-slate-700/70 bg-slate-950/30 px-3 py-1 text-sm font-medium text-slate-300">
          {insumos.length} registros
        </span>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-700/70">
        <table className="min-w-full border-collapse text-center text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
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
                className={`border-t border-slate-700/70 transition-colors ${
                  item.stock === 0
                    ? "bg-rose-950/45 hover:bg-rose-950/65 text-rose-100"
                    : "bg-slate-950/20 hover:bg-cyan-400/5"
                }`}
              >
                <td className="px-4 py-3 text-left font-medium text-white break-words">
                  {item.nombre}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.umbral}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center items-center gap-5 sm:gap-6 flex-wrap">
                    <button
                      onClick={() => onEditar(item)}
                      className="text-cyan-300 hover:text-cyan-200 transition-transform hover:scale-110 cursor-pointer"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onEliminar(item)}
                      className="text-rose-300 hover:text-rose-200 transition-transform hover:scale-110 cursor-pointer"
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
                ? "border-rose-400/40 bg-rose-950/25"
                : "border-slate-700/70 bg-slate-950/25"
            } flex justify-between items-center hover:bg-cyan-400/5 transition-all`}
          >
            <div className="min-w-0 flex flex-col gap-1">
              <span className="text-slate-100 font-medium">{item.nombre}</span>
              <span className="text-sm text-slate-400">
                Stock:{" "}
                <span
                  className={`font-semibold ${
                    item.stock <= item.umbral
                      ? "text-rose-300"
                      : "text-emerald-300"
                  }`}
                >
                  {item.stock}
                </span>{" "}
                / Umbral: <span className="text-slate-300">{item.umbral}</span>
              </span>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => onEditar(item)}
                className="text-cyan-300 hover:text-cyan-200 transition-transform hover:scale-110 cursor-pointer"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onEliminar(item)}
                className="text-rose-300 hover:text-rose-200 transition-transform hover:scale-110 cursor-pointer"
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
