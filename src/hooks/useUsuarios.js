import { useState, useEffect, useCallback } from "react";
import {
  registerUserByAdmin,
  getAllUsers,
  suspenderUsuario as suspenderUsuarioAPI,
  eliminarUsuario as eliminarUsuarioAPI,
} from "../api/user.api";
import { useModal } from "./useModal";
import { isValidName, isValidEmail, isValidRole } from "../utils/validators";
import { useCitas } from "./useCitas";

export const useUsuarios = () => {
  const { socket } = useCitas();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const { modal: confirmModal, mostrarModal, cerrarModal } = useModal();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    rol: "doctor",
  });

  const [busqueda, setBusqueda] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
    window.addEventListener("focus", fetchUsers);
    socket?.on("profesionalActualizado", fetchUsers);
    socket?.on("connect", fetchUsers);

    return () => {
      window.removeEventListener("focus", fetchUsers);
      socket?.off("profesionalActualizado", fetchUsers);
      socket?.off("connect", fetchUsers);
    };
  }, [fetchUsers, socket]);

  const formularioValido =
    isValidName(nuevoUsuario.nombre) &&
    isValidEmail(nuevoUsuario.email) &&
    isValidRole(nuevoUsuario.rol);

  const handleChange = (e) =>
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formularioValido) return;

    try {
      const usuarioData = {
        ...nuevoUsuario,
        rol: nuevoUsuario.rol.toLowerCase(),
      };
      const { usuario } = await registerUserByAdmin(usuarioData);

      setUsuarios([...usuarios, usuario]);
      setNuevoUsuario({ nombre: "", email: "", rol: "doctor" });
      mostrarModal("Usuario registrado correctamente 🎉");
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Error al crear usuario";
      mostrarModal(message, "error");
    }
  };

  const suspenderUsuario = async (id) => {
    if (loading) return;
    setLoading(true);

    try {
      const { usuario } = await suspenderUsuarioAPI(id);
      setUsuarios((prev) =>
        prev.map((u) => (u._id === id ? { ...u, activo: usuario.activo } : u))
      );
      mostrarModal(
        `Usuario ${usuario.activo ? "activado" : "suspendido"} correctamente`
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error al cambiar el estado del usuario";
      mostrarModal(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (usuarioId) => {
    const usuario = usuarios.find((u) => u._id === usuarioId);
    if (usuario) {
      setUsuarioToDelete(usuario);
      setShowDeleteModal(true);
    }
  };

  const confirmarEliminacion = async () => {
    if (!usuarioToDelete || loading) return;
    const usuarioId = usuarioToDelete._id;
    setLoading(true);

    try {
      await eliminarUsuarioAPI(usuarioId);
      setUsuarios((prev) => prev.filter((u) => u._id !== usuarioId));
      setShowDeleteModal(false);
      mostrarModal("Usuario eliminado correctamente");
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al eliminar el usuario";
      mostrarModal(message, "error");
    } finally {
      setLoading(false);
      setUsuarioToDelete(null);
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteModal(false);
    setUsuarioToDelete(null);
  };

  return {
    usuarios,
    setUsuarios,
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
    showModal: confirmModal.show,
    modalMessage: confirmModal.message,
    modalType: confirmModal.type,
    setShowModal: cerrarModal,
    busqueda,
    setBusqueda,
    loading,
  };
};
