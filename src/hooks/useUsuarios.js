import { useState, useEffect } from "react";
import {
  registerUserByAdmin,
  getAllUsers,
  suspenderUsuario as suspenderUsuarioAPI,
  eliminarUsuario as eliminarUsuarioAPI,
} from "../api/user.api";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    email: "",
    rol: "doctor",
  });

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const data = await getAllUsers(token);
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  const validarNombre = (nombre) => /^[a-zA-ZÀ-ÿ\s]{3,}$/.test(nombre.trim());
  const validarEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validarRol = (rol) => ["doctor", "cosmiatra"].includes(rol);

  const formularioValido =
    validarNombre(nuevoUsuario.nombre) &&
    validarEmail(nuevoUsuario.email) &&
    validarRol(nuevoUsuario.rol);

  const handleChange = (e) =>
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formularioValido) return;

    try {
      const token = localStorage.getItem("token");
      const usuarioData = {
        ...nuevoUsuario,
        rol: nuevoUsuario.rol.toLowerCase(),
      };
      const { usuario } = await registerUserByAdmin(usuarioData, token);

      setUsuarios([...usuarios, usuario]);
      setNuevoUsuario({ nombre: "", email: "", rol: "doctor" });
      setModalMessage("Usuario registrado correctamente 🎉");
      setModalType("success");
      setShowModal(true);
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Error al crear usuario";
      setModalMessage(message);
      setModalType("error");
      setShowModal(true);
    }
  };

  const suspenderUsuario = async (id) => {
    if (loading) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const { usuario } = await suspenderUsuarioAPI(id, token);
      setUsuarios((prev) =>
        prev.map((u) => (u._id === id ? { ...u, activo: usuario.activo } : u))
      );
      setModalMessage(
        `Usuario ${usuario.activo ? "activado" : "suspendido"} correctamente`
      );
      setModalType("success");
      setShowModal(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Error al cambiar el estado del usuario";
      setModalMessage(message);
      setModalType("error");
      setShowModal(true);
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
    const token = localStorage.getItem("token");

    try {
      await eliminarUsuarioAPI(usuarioId, token);
      setUsuarios((prev) => prev.filter((u) => u._id !== usuarioId));
      setShowDeleteModal(false);
      setModalMessage("Usuario eliminado correctamente");
      setModalType("success");
      setShowModal(true);
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al eliminar el usuario";
      setModalMessage(message);
      setModalType("error");
      setShowModal(true);
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
    showModal,
    modalMessage,
    modalType,
    setShowModal,
    busqueda,
    setBusqueda,
    loading,
  };
};
