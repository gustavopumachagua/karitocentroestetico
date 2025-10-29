import { FaBan, FaTrash, FaSpinner, FaUserCircle } from "react-icons/fa";

export default function UsuarioCard({
  usuario,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  const estadoColor = usuario.activo ? "text-green-400" : "text-red-400";
  const estadoTexto = usuario.activo ? "Activo" : "Suspendido";

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <FaUserCircle className="text-5xl text-gray-500 hidden sm:block" />
        <div>
          <p className="text-lg font-semibold text-white">{usuario.nombre}</p>
          <p className="text-gray-400 text-sm">{usuario.email}</p>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
            <p>
              <span className="font-semibold text-gray-300">Rol: </span>
              <span className="capitalize text-gray-200">{usuario.rol}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-300">Estado: </span>
              <span className={`${estadoColor} font-medium`}>
                {estadoTexto}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button
          onClick={() => suspenderUsuario(usuario._id)}
          disabled={loading}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
            usuario.activo
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-green-600 hover:bg-green-700"
          } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaBan className="text-sm" />
          )}
          {usuario.activo ? "Suspender" : "Activar"}
        </button>

        <button
          onClick={() => eliminarUsuario(usuario._id)}
          disabled={loading}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
          }`}
        >
          {loading ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaTrash className="text-sm" />
          )}
          Eliminar
        </button>
      </div>
    </div>
  );
}
