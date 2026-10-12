import { FaClipboardList, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaInsumos({
  insumos,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (insumos.length === 0) return null;

  return (
    <section className="ui-panel">
      <div className="ui-toolbar mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10">
            <FaClipboardList className="text-indigo-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Insumos – {rolSeleccionado}
          </h3>
        </div>

        <span className="ui-status">
          {insumos.length} registros
        </span>
      </div>

      <div role="region" tabIndex={0} aria-label="Insumos del catálogo: desplazamiento horizontal disponible" className="ui-table-wrap hidden sm:block">
        <table aria-label="Insumos del catálogo" className="ui-table min-w-full text-center">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Nombre</th>
              <th scope="col" className="px-4 py-3">Stock</th>
              <th scope="col" className="px-4 py-3">Umbral</th>
              <th scope="col" className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((item) => (
              <tr
                key={item._id}
                className={`border-t border-slate-700/70 transition-colors ${
                  item.stock === 0
                    ? "bg-rose-950/45 hover:bg-rose-950/65 text-rose-100"
                    : "bg-slate-950/20 hover:bg-indigo-400/5"
                }`}
              >
                <td className="px-4 py-3 text-left font-medium text-white break-words">
                  {item.nombre}
                </td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3">{item.umbral}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => onEditar(item)}
                      className="ui-icon-button"
                      title="Editar"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => onEliminar(item)}
                      className="ui-icon-button ui-button-danger"
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
            className={`ui-card flex min-w-0 flex-col items-start gap-3 ${
              item.stock <= item.umbral
                ? "border-rose-400/40 bg-rose-950/25"
                : "border-slate-700/70 bg-slate-950/25"
            }`}
          >
            <div className="min-w-0 flex flex-col gap-1">
              <span className="font-medium text-slate-100 break-words">{item.nombre}</span>
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
            <div className="flex w-full items-center justify-end gap-2">
              <button
                onClick={() => onEditar(item)}
                className="ui-icon-button"
                title="Editar"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => onEliminar(item)}
                className="ui-icon-button ui-button-danger"
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
