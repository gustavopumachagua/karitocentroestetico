import { FaSpinner } from "react-icons/fa";

export default function TablaUsuarios({
  usuarios,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  return (
    <div role="region" tabIndex={0} aria-label="Usuarios registrados: desplazamiento horizontal disponible" className="ui-table-wrap hidden md:block">
      <table aria-label="Usuarios registrados" className="ui-table min-w-[720px] text-left">
        <thead>
          <tr>
            <th scope="col" className="px-4 py-3">Nombre</th>
            <th scope="col" className="px-4 py-3">Correo</th>
            <th scope="col" className="px-4 py-3">Rol</th>
            <th scope="col" className="px-4 py-3">Estado</th>
            <th scope="col" className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr
              key={u._id}
              className="border-t border-slate-700/70 bg-slate-950/20 transition hover:bg-indigo-400/5"
            >
              <td className="px-4 py-3 font-medium text-white">{u.nombre}</td>
              <td className="px-4 py-3 break-all">{u.email}</td>
              <td className="px-4 py-3 capitalize text-slate-300">{u.rol}</td>
              <td className="px-4 py-3">
                {u.activo ? (
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-slate-300">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-rose-300">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                    Suspendido
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => suspenderUsuario(u._id)}
                  disabled={loading}
                  className={`ui-button ui-button-secondary ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  {u.activo ? "Suspender" : "Activar"}
                </button>
                <button
                  onClick={() => eliminarUsuario(u._id)}
                  disabled={loading}
                  className={`ui-button ui-button-danger ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading && (
                    <FaSpinner className="animate-spin" />
                  )}
                  Eliminar
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
