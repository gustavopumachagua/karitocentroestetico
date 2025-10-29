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
    <>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaUser className="text-indigo-400" /> Usuarios Registrados
      </h3>

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
    </>
  );
}
