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
    <div className="glass-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 sm:flex">
          <FaUserCircle className="text-2xl text-cyan-300" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white">{usuario.nombre}</p>
          <p className="break-all text-slate-400 text-sm">{usuario.email}</p>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
            <p>
              <span className="font-semibold text-slate-300">Rol: </span>
              <span className="capitalize text-cyan-100">{usuario.rol}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-300">Estado: </span>
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
              ? "border border-amber-400/20 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
              : "border border-emerald-400/20 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25"
          } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}`}
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
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg border border-rose-400/20 bg-rose-500/15 text-rose-100 font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:bg-rose-500/25 ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"
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
