import { FaUser } from "react-icons/fa";
import TablaUsuarios from "../../components/GestionUsuariosRoles/TablaUsuarios";
import UsuarioCard from "../../components/GestionUsuariosRoles/UsuarioCard";
import { normalizarTexto } from "./utils";

export default function UsuariosSection({
  usuarios,
  busqueda,
  suspenderUsuario,
  eliminarUsuario,
  loading,
}) {
  const usuariosFiltrados = usuarios
    .filter((u) => u.rol !== "administrador")
    .filter(
      (u) =>
        normalizarTexto(u.nombre).includes(normalizarTexto(busqueda)) ||
        normalizarTexto(u.email).includes(normalizarTexto(busqueda)) ||
        normalizarTexto(u.rol).includes(normalizarTexto(busqueda))
    );

  return (
    <section className="page-panel page-panel-pad">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10">
            <FaUser className="text-violet-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Usuarios Registrados
          </h3>
        </div>

        <span className="w-fit rounded-lg border border-slate-700/70 bg-slate-950/30 px-3 py-1 text-sm font-medium text-slate-300">
          {usuariosFiltrados.length} usuarios
        </span>
      </div>

      <TablaUsuarios
        usuarios={usuariosFiltrados}
        suspenderUsuario={suspenderUsuario}
        eliminarUsuario={eliminarUsuario}
        loading={loading}
      />

      <div className="md:hidden space-y-4">
        {usuariosFiltrados.map((u) => (
          <UsuarioCard
            key={u._id}
            usuario={u}
            suspenderUsuario={suspenderUsuario}
            eliminarUsuario={eliminarUsuario}
            loading={loading}
          />
        ))}
      </div>

      {usuariosFiltrados.length === 0 && (
        <p className="rounded-xl border border-slate-700/60 bg-slate-950/25 p-5 text-center text-sm italic text-slate-400">
          No hay usuarios registrados con esos criterios.
        </p>
      )}
    </section>
  );
}
