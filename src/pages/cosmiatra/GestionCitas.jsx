import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import CitaForm from "../../components/AgendaCitas/CitaForm";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import DeleteConfirmationModal from "../../components/GestionUsuariosRoles/DeleteConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { convertirFechaCitaAISOString } from "../../utils/citasFecha";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

function obtenerIdCita(cita) {
  return cita?._id || cita?.id;
}

function obtenerNombreCliente(cita) {
  return typeof cita?.cliente === "object"
    ? cita.cliente?.nombre
    : cita?.cliente;
}

export default function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  const mostrarModal = (message, type = "success") => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {});

    socket.on("nuevaCita", (cita) => {
      setCitas((prev) =>
        prev.some((c) => obtenerIdCita(c) === obtenerIdCita(cita))
          ? prev
          : [...prev, cita]
      );
    });

    socket.on("estadoCitaActualizado", (citaActualizada) => {
      setCitas((prev) =>
        prev.map((c) =>
          obtenerIdCita(c) === obtenerIdCita(citaActualizada)
            ? citaActualizada
            : c
        )
      );
    });

    socket.on("citaActualizada", (citaActualizada) => {
      setCitas((prev) =>
        prev.map((c) =>
          obtenerIdCita(c) === obtenerIdCita(citaActualizada)
            ? citaActualizada
            : c
        )
      );
    });

    socket.on("citaEliminada", ({ _id }) => {
      setCitas((prev) => prev.filter((c) => obtenerIdCita(c) !== _id));
    });

    socket.on("disconnect", () => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/profesionales`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al obtener usuarios:", err));
  }, []);

  const fetchCitas = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const registrarCita = async (nuevaCita) => {
    try {
      const token = localStorage.getItem("token");
      const citaPayload = {
        ...nuevaCita,
        fecha: convertirFechaCitaAISOString(nuevaCita.fecha),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(citaPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar cita");

      setCitas((prev) =>
        prev.some((c) => obtenerIdCita(c) === obtenerIdCita(data.cita))
          ? prev
          : [...prev, data.cita]
      );
      mostrarModal("✅ Cita registrada correctamente");
      return true;
    } catch {
      mostrarModal("❌ Error al registrar la cita", "error");
      return false;
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/citas/${id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al actualizar estado");

      setCitas((prev) =>
        prev.map((c) => (obtenerIdCita(c) === id ? data.cita : c))
      );
      mostrarModal("✅ Estado actualizado correctamente");
      return true;
    } catch (error) {
      mostrarModal("❌ " + error.message, "error");
      return false;
    }
  };

  const seleccionarCitaParaEditar = (cita) => {
    setCitaEditando(cita);
    setShowDeleteModal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setCitaEditando(null);
    setShowDeleteModal(false);
  };

  const actualizarCita = async (citaEditada) => {
    const { _id, id, ...datosCita } = citaEditada;
    const citaId = _id || id || obtenerIdCita(citaEditando);

    if (!citaId) {
      mostrarModal("❌ Error al identificar la cita", "error");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const citaPayload = {
        ...datosCita,
        fecha: convertirFechaCitaAISOString(datosCita.fecha),
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/citas/${citaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(citaPayload),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error al actualizar la cita");

      setCitas((prev) =>
        prev.map((c) => (obtenerIdCita(c) === citaId ? data.cita : c))
      );
      setCitaEditando(null);
      mostrarModal("✅ Cita actualizada correctamente");
      return true;
    } catch (error) {
      mostrarModal("❌ " + error.message, "error");
      return false;
    }
  };

  const eliminarCita = async () => {
    const citaId = obtenerIdCita(citaEditando);

    if (!citaId) {
      mostrarModal("❌ Error al identificar la cita", "error");
      return false;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/citas/${citaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al eliminar la cita");

      setCitas((prev) => prev.filter((c) => obtenerIdCita(c) !== citaId));
      setCitaEditando(null);
      setShowDeleteModal(false);
      mostrarModal("✅ Cita eliminada correctamente");
      return true;
    } catch (error) {
      setShowDeleteModal(false);
      mostrarModal("❌ " + error.message, "error");
      return false;
    }
  };

  const handleModalClose = () => {
    setShowModal(false);

    if (modalMessage.includes("✅")) {
      setTimeout(() => {
        setIsLoading(true);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }, 300);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="p-4 sm:p-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl p-4 sm:p-8 space-y-8">
        <CitaForm
          usuarios={usuarios}
          onRegistrarCita={registrarCita}
          citaEditando={citaEditando}
          onActualizarCita={actualizarCita}
          onEliminarCita={() => setShowDeleteModal(true)}
          onCancelarEdicion={cancelarEdicion}
        />

        <CitaTable
          citas={citas}
          actualizarEstado={actualizarEstado}
          onEditarCita={seleccionarCitaParaEditar}
        />
      </div>

      <DeleteConfirmationModal
        show={showDeleteModal}
        title="Eliminar cita"
        userName={obtenerNombreCliente(citaEditando)}
        message={
          <>
            ¿Estás seguro de que deseas eliminar la cita de{" "}
            <span className="font-semibold text-white">
              {obtenerNombreCliente(citaEditando)}
            </span>
            ?
          </>
        }
        warningText="La cita se eliminará permanentemente."
        confirmText="Eliminar cita"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={eliminarCita}
      />

      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        type={modalType}
        onClose={handleModalClose}
      />
    </section>
  );
}
