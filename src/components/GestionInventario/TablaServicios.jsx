import { FaSpa, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaServicios({
  servicios,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (servicios.length === 0) return null;

  return (
    <section className="page-panel page-panel-pad mb-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10">
            <FaSpa className="text-violet-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Servicios – {rolSeleccionado}
          </h3>
        </div>

        <span className="w-fit rounded-lg border border-slate-700/70 bg-slate-950/30 px-3 py-1 text-sm font-medium text-slate-300">
          {servicios.length} registros
        </span>
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-700/70">
        <table className="min-w-full border-collapse text-center text-sm text-slate-300">
          <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((item) => (
              <tr
                key={item._id}
                className="border-t border-slate-700/70 bg-slate-950/20 hover:bg-cyan-400/5 transition-colors"
              >
                <td className="px-4 py-3 text-left font-medium text-white break-words">
                  {item.nombre}
                </td>
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

      <div className="sm:hidden flex flex-col gap-3">
        {servicios.map((item) => (
          <div
            key={item._id}
            className="bg-slate-950/25 rounded-lg p-3 border border-slate-700/70 flex justify-between items-center hover:bg-cyan-400/5 transition-all"
          >
            <div className="min-w-0 flex flex-col">
              <span className="font-medium text-slate-100">{item.nombre}</span>
              <span className="text-sm text-slate-400">Servicio</span>
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
