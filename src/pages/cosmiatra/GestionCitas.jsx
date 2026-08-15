import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import CitaForm from "../../components/AgendaCitas/CitaForm";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import DeleteConfirmationModal from "../../components/GestionUsuariosRoles/DeleteConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useModal } from "../../hooks/useModal";
import {
  getCitas,
  registrarCita as registrarCitaAPI,
  actualizarCita as actualizarCitaAPI,
  actualizarEstadoCita,
  eliminarCita as eliminarCitaAPI,
  getProfesionales,
} from "../../api/citas.api";
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
  const [isLoading, setIsLoading] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { modal, mostrarModal, cerrarModal } = useModal();

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
    const fetchUsuarios = async () => {
      try {
        const data = await getProfesionales();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    fetchUsuarios();
  }, []);

  const fetchCitas = useCallback(async () => {
    try {
      const data = await getCitas();
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
      const citaPayload = {
        ...nuevaCita,
        fecha: convertirFechaCitaAISOString(nuevaCita.fecha),
      };

      const data = await registrarCitaAPI(citaPayload);

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
      const data = await actualizarEstadoCita(id, nuevoEstado);

      setCitas((prev) =>
        prev.map((c) => (obtenerIdCita(c) === id ? data.cita : c))
      );
      mostrarModal("✅ Estado actualizado correctamente");
      return true;
    } catch (error) {
      mostrarModal("❌ " + (error.response?.data?.message || error.message), "error");
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
      const citaPayload = {
        ...datosCita,
        fecha: convertirFechaCitaAISOString(datosCita.fecha),
      };

      const data = await actualizarCitaAPI(citaId, citaPayload);

      setCitas((prev) =>
        prev.map((c) => (obtenerIdCita(c) === citaId ? data.cita : c))
      );
      setCitaEditando(null);
      mostrarModal("✅ Cita actualizada correctamente");
      return true;
    } catch (error) {
      mostrarModal("❌ " + (error.response?.data?.message || error.message), "error");
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
      await eliminarCitaAPI(citaId);

      setCitas((prev) => prev.filter((c) => obtenerIdCita(c) !== citaId));
      setCitaEditando(null);
      setShowDeleteModal(false);
      mostrarModal("✅ Cita eliminada correctamente");
      return true;
    } catch (error) {
      setShowDeleteModal(false);
      mostrarModal("❌ " + (error.response?.data?.message || error.message), "error");
      return false;
    }
  };

  const handleModalClose = () => {
    cerrarModal();

    if (modal.message.includes("✅")) {
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
    <section className="page-section">
      <div className="page-stack">
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
        show={modal.show}
        message={modal.message}
        type={modal.type}
        onClose={handleModalClose}
      />
    </section>
  );
}
