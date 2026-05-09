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
    <section className="page-section">
      <div className="page-stack">
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
