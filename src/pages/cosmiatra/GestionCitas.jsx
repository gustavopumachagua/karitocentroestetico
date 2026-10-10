import { useCallback, useEffect, useRef, useState } from "react";
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
} from "../../api/citas.api";
import { convertirFechaCitaAISOString } from "../../utils/citasFecha";
import { CLINICAL_HISTORY_UPDATED_EVENT } from "../../utils/clinicalHistoryStorage";
import { useCitas } from "../../hooks/useCitas";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";
import { usePatientUpdates } from "../../hooks/usePatientUpdates";

function obtenerIdCita(cita) {
  return cita?._id || cita?.id;
}

function obtenerNombreCliente(cita) {
  return typeof cita?.cliente === "object"
    ? cita.cliente?.nombre
    : cita?.cliente;
}

export default function GestionCitas() {
  const { socket } = useCitas();
  const { professionals: usuarios = [] } = useProfessionalDirectory();
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const registroCitaEnCursoRef = useRef(false);
  const { modal, mostrarModal, cerrarModal } = useModal();

  useEffect(() => {
    if (!socket) return undefined;

    const handleNuevaCita = (cita) => {
      setCitas((prev) =>
        prev.some((c) => obtenerIdCita(c) === obtenerIdCita(cita))
          ? prev
          : [...prev, cita]
      );
    };

    const handleEstadoActualizado = (citaActualizada) => {
      setCitas((prev) =>
        prev.map((c) =>
          obtenerIdCita(c) === obtenerIdCita(citaActualizada)
            ? citaActualizada
            : c
        )
      );
    };

    const handleCitaActualizada = (citaActualizada) => {
      setCitas((prev) =>
        prev.map((c) =>
          obtenerIdCita(c) === obtenerIdCita(citaActualizada)
            ? citaActualizada
            : c
        )
      );
    };

    const handleCitaEliminada = ({ _id }) => {
      setCitas((prev) => prev.filter((c) => obtenerIdCita(c) !== _id));
    };

    const handleHistoriaFinalizada = () => {
      // The Topbar popup reacts to this event and refreshes immediately.
      window.dispatchEvent(new CustomEvent(CLINICAL_HISTORY_UPDATED_EVENT));
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoActualizado);
    socket.on("citaActualizada", handleCitaActualizada);
    socket.on("citaEliminada", handleCitaEliminada);
    socket.on("historiaClinicaFinalizada", handleHistoriaFinalizada);

    return () => {
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoActualizado);
      socket.off("citaActualizada", handleCitaActualizada);
      socket.off("citaEliminada", handleCitaEliminada);
      socket.off("historiaClinicaFinalizada", handleHistoriaFinalizada);
    };
  }, [socket]);

  const fetchCitas = useCallback(async () => {
    try {
      const data = await getCitas();
      const actualizadas = Array.isArray(data) ? data : [];
      setCitas(actualizadas);
      return actualizadas;
    } catch (err) {
      console.error("Error al obtener citas:", err);
      return [];
    }
  }, []);

  usePatientUpdates(() => {
    void fetchCitas().then((actualizadas) => {
      setCitaEditando((current) => {
        if (!current) return null;
        const actualizada = actualizadas.find((cita) => obtenerIdCita(cita) === obtenerIdCita(current));
        return actualizada
          ? { ...current, cliente: actualizada.cliente, pacienteId: actualizada.pacienteId }
          : current;
      });
    });
  }, socket);

  useEffect(() => {
    fetchCitas();
  }, [fetchCitas]);

  const registrarCita = useCallback(async (nuevaCita) => {
    if (registroCitaEnCursoRef.current) return false;

    registroCitaEnCursoRef.current = true;

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
    } finally {
      registroCitaEnCursoRef.current = false;
    }
  }, [mostrarModal]);

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
    <section className="page-section ui-page">
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
