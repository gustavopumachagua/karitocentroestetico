import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import DeleteConfirmationModal from "../../components/GestionUsuariosRoles/DeleteConfirmationModal";

export default function ModalesUsuarios({
  showModal,
  setShowModal,
  modalMessage,
  modalType,
  showDeleteModal,
  confirmarEliminacion,
  cancelarEliminacion,
  usuarioToDelete,
}) {
  return (
    <>
      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        type={modalType}
        onClose={() => setShowModal(false)}
      />

      <DeleteConfirmationModal
        show={showDeleteModal}
        onConfirm={confirmarEliminacion}
        onCancel={cancelarEliminacion}
        userName={usuarioToDelete?.nombre}
      />
    </>
  );
}
