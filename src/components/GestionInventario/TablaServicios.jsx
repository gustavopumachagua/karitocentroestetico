import { FaSpa, FaTrash, FaEdit } from "react-icons/fa";

export default function TablaServicios({
  servicios,
  rolSeleccionado,
  onEliminar,
  onEditar,
}) {
  if (servicios.length === 0) return null;

  return (
    <section className="ui-panel mb-6">
      <div className="ui-toolbar mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10">
            <FaSpa className="text-indigo-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Servicios – {rolSeleccionado}
          </h3>
        </div>

        <span className="ui-status">
          {servicios.length} registros
        </span>
      </div>

      <div role="region" tabIndex={0} aria-label="Servicios registrados: desplazamiento horizontal disponible" className="ui-table-wrap hidden sm:block">
        <table aria-label="Servicios registrados" className="ui-table min-w-full text-center">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left">Nombre</th>
              <th scope="col" className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((item) => (
              <tr
                key={item._id}
                className="border-t border-slate-700/70 bg-slate-950/20 hover:bg-indigo-400/5 transition-colors"
              >
                <td className="px-4 py-3 text-left font-medium text-white break-words">
                  {item.nombre}
                </td>
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

      <div className="sm:hidden flex flex-col gap-3">
        {servicios.map((item) => (
          <div
            key={item._id}
            className="ui-card ui-card-interactive flex min-w-0 flex-col items-start gap-3"
          >
            <div className="min-w-0 flex flex-col">
              <span className="font-medium text-slate-100 break-words">{item.nombre}</span>
              <span className="text-sm text-slate-400">Servicio</span>
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
