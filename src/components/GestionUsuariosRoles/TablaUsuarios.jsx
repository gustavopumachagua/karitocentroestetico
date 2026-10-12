import { FaBan, FaTrash, FaSpinner } from "react-icons/fa";

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
              <td className="px-4 py-3 capitalize text-indigo-100">{u.rol}</td>
              <td className="px-4 py-3">
                {u.activo ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    Activo
                  </span>
                ) : (
                  <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-xs font-semibold text-rose-300">
                    Suspendido
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => suspenderUsuario(u._id)}
                  disabled={loading}
                  className={`ui-button border-amber-400/20 bg-amber-400/10 text-amber-200 hover:bg-amber-400/15 ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaBan />}
                  {u.activo ? "Suspender" : "Activar"}
                </button>
                <button
                  onClick={() => eliminarUsuario(u._id)}
                  disabled={loading}
                  className={`ui-button ui-button-danger ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrash />
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
