import { FaSpinner } from "react-icons/fa";

export default function UsuarioCard({
  usuario,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  const estadoColor = usuario.activo ? "text-emerald-300" : "text-rose-300";
  const estadoTexto = usuario.activo ? "Activo" : "Suspendido";

  return (
    <div className="ui-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-100 break-words">{usuario.nombre}</p>
          <p className="break-all text-slate-400 text-sm">{usuario.email}</p>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm">
            <p>
              <span className="font-semibold text-slate-300">Rol: </span>
              <span className="capitalize text-slate-300">{usuario.rol}</span>
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

      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          onClick={() => suspenderUsuario(usuario._id)}
          disabled={loading}
          className={`ui-button ui-button-secondary flex-1 sm:flex-none ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer "}`}
        >
          {loading && (
            <FaSpinner className="animate-spin" />
          )}
          {usuario.activo ? "Suspender" : "Activar"}
        </button>

        <button
          onClick={() => eliminarUsuario(usuario._id)}
          disabled={loading}
          className={`ui-button ui-button-danger flex-1 sm:flex-none ${
            loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer "
          }`}
        >
          {loading && (
            <FaSpinner className="animate-spin" />
          )}
          Eliminar
        </button>
      </div>
    </div>
  );
}
