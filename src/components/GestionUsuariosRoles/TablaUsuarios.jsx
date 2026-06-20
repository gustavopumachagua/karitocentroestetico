import { FaBan, FaTrash, FaSpinner } from "react-icons/fa";

export default function TablaUsuarios({
  usuarios,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-700/70">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Correo</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr
              key={u._id}
              className="border-t border-slate-700/70 bg-slate-950/20 transition hover:bg-cyan-400/5"
            >
              <td className="px-4 py-3 font-medium text-white">{u.nombre}</td>
              <td className="px-4 py-3 break-all">{u.email}</td>
              <td className="px-4 py-3 capitalize text-cyan-100">{u.rol}</td>
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
                  className={`inline-flex items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/25 ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaBan />}
                  {u.activo ? "Suspender" : "Activar"}
                </button>
                <button
                  onClick={() => eliminarUsuario(u._id)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/25 ${
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
