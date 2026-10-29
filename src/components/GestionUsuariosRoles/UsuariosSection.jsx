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
    <section className="ui-panel">
      <div className="ui-toolbar mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-white">
            Usuarios registrados
          </h3>
        </div>

        <span className="text-xs tabular-nums text-slate-400">
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
        <p className="ui-empty-state text-sm">
          No hay usuarios registrados con esos criterios.
        </p>
      )}
    </section>
  );
}
