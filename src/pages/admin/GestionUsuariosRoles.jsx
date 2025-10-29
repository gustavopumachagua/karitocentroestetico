import { useUsuarios } from "../../hooks/useUsuarios";
import FormularioSection from "../../components/GestionUsuariosRoles/FormularioSection";
import UsuariosSection from "../../components/GestionUsuariosRoles/UsuariosSection";
import ModalesUsuarios from "../../components/GestionUsuariosRoles/ModalesUsuarios";

export default function GestionUsuarios() {
  const {
    usuarios,
    nuevoUsuario,
    handleChange,
    handleSubmit,
    formularioValido,
    suspenderUsuario,
    handleDeleteClick,
    confirmarEliminacion,
    cancelarEliminacion,
    usuarioToDelete,
    showDeleteModal,
    showModal,
    modalMessage,
    modalType,
    setShowModal,
    busqueda,
    setBusqueda,
    loading,
  } = useUsuarios();

  return (
    <section className="p-4 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-2 sm:p-8">
        <FormularioSection
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          nuevoUsuario={nuevoUsuario}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formularioValido={formularioValido}
        />

        <UsuariosSection
          usuarios={usuarios}
          busqueda={busqueda}
          suspenderUsuario={suspenderUsuario}
          eliminarUsuario={handleDeleteClick}
          loading={loading}
        />
      </div>

      <ModalesUsuarios
        showModal={showModal}
        setShowModal={setShowModal}
        modalMessage={modalMessage}
        modalType={modalType}
        showDeleteModal={showDeleteModal}
        confirmarEliminacion={confirmarEliminacion}
        cancelarEliminacion={cancelarEliminacion}
        usuarioToDelete={usuarioToDelete}
      />
    </section>
  );
}
