import { FaBan, FaTrash, FaSpinner } from "react-icons/fa";

export default function TablaUsuarios({
  usuarios,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left text-gray-300">
        <thead className="bg-gray-700">
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
              className="border-t border-gray-700 hover:bg-gray-700/50 transition"
            >
              <td className="px-4 py-3">{u.nombre}</td>
              <td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3 capitalize">{u.rol}</td>
              <td className="px-4 py-3">
                {u.activo ? (
                  <span className="text-green-400 font-medium">Activo</span>
                ) : (
                  <span className="text-red-400 font-medium">Suspendido</span>
                )}
              </td>
              <td className="px-4 py-3 flex gap-3">
                <button
                  onClick={() => suspenderUsuario(u._id)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-1 transition ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaBan />}
                  {u.activo ? "Suspender" : "Activar"}
                </button>
                <button
                  onClick={() => eliminarUsuario(u._id)}
                  disabled={loading}
                  className={`px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 transition ${
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
