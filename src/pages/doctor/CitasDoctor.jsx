import { useCallback, useEffect, useState } from "react";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import { getCitas, actualizarEstadoCita } from "../../api/citas.api";
import { useCitas } from "../../hooks/useCitas";
import { belongsToProfessionalRole } from "../../utils/professionalOwnership";
import { usePatientUpdates } from "../../hooks/usePatientUpdates";

export default function CitasDoctor() {
  const { socket } = useCitas();
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { modal, mostrarModal, cerrarModal } = useModal();

  const fetchCitas = useCallback(async () => {
    try {
      const data = await getCitas();
      const citasFiltradas = Array.isArray(data)
        ? data.filter((cita) => belongsToProfessionalRole(cita, user))
        : [];

      setCitas(citasFiltradas);
    } catch (error) {
      console.error("Error al obtener citas:", error);
    }
  }, [user]);

  useEffect(() => {
    void fetchCitas();
  }, [fetchCitas]);

  usePatientUpdates(() => void fetchCitas(), socket);

  const mostrarModalYLuegoSpinner = useCallback((mensaje) => {
    mostrarModal(mensaje);
  }, [mostrarModal]);

  const iniciarRecarga = async () => {
    setIsLoading(true);

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
    if (!socket) return undefined;

    const handleNuevaCita = (nuevaCita) => {
      if (belongsToProfessionalRole(nuevaCita, user)) {
        mostrarModalYLuegoSpinner("📅 Nueva cita asignada");
      }
    };

    const handleEstadoActualizado = () => {
      mostrarModalYLuegoSpinner("🔁 Estado de una cita fue actualizado");
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoActualizado);

    return () => {
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoActualizado);
    };
  }, [socket, user, mostrarModalYLuegoSpinner]);

  const handleModalClose = () => {
    cerrarModal();

    setTimeout(() => {
      iniciarRecarga();
    }, 400);
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoCita(id, nuevoEstado);
      mostrarModalYLuegoSpinner("✅ Estado actualizado correctamente");
    } catch (error) {
      mostrarModal("❌ " + (error.response?.data?.message || error.message), "error");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        <header className="ui-page-header mb-0">
          <div>
            <p className="ui-eyebrow">Consulta médica</p>
            <h1 className="ui-title">Agenda de citas</h1>
            <p className="ui-description">Consulta tus pacientes, servicios y horarios de atención.</p>
          </div>
        </header>
        <div className="relative">
          <CitaTable
            citas={citas}
            actualizarEstado={actualizarEstado}
            showAcciones={false}
          />
        </div>
      </div>

      <ConfirmationModal
        show={modal.show}
        message={modal.message}
        type={modal.message.includes("Error") ? "error" : "success"}
        onClose={handleModalClose}
      />
    </section>
  );
}
