import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { useModal } from "../../hooks/useModal";
import { getCitas, actualizarEstadoCita } from "../../api/citas.api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function CitasDoctor() {
  const [citas, setCitas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { nombre, rol } = useAuth();
  const { modal, mostrarModal, cerrarModal } = useModal();

  const fetchCitas = async () => {
    try {
      const data = await getCitas();
      const citasFiltradas = Array.isArray(data)
        ? data.filter((cita) => {
            const prof = cita.profesional;
            if (!prof) return false;
            const nombreCoincide =
              prof.nombre?.toLowerCase() === nombre.toLowerCase();
            const rolCoincide = prof.rol?.toLowerCase() === rol;
            return nombreCoincide && rolCoincide;
          })
        : [];

      setCitas(citasFiltradas);
    } catch (error) {
      console.error("Error al obtener citas:", error);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, [nombre, rol]);

  const mostrarModalYLuegoSpinner = async (mensaje) => {
    mostrarModal(mensaje);
  };

  const iniciarRecarga = async () => {
    setIsLoading(true);

    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {});

    socket.on("nuevaCita", (nuevaCita) => {
      if (
        nuevaCita?.profesional?.nombre?.toLowerCase() ===
          nombre.toLowerCase() &&
        nuevaCita?.profesional?.rol?.toLowerCase() === rol
      ) {
        mostrarModalYLuegoSpinner("📅 Nueva cita asignada");
      }
    });

    socket.on("estadoCitaActualizado", () => {
      mostrarModalYLuegoSpinner("🔁 Estado de una cita fue actualizado");
    });

    socket.on("disconnect", () => {});

    return () => socket.disconnect();
  }, [nombre, rol]);

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
    <section className="page-section">
      <div className="page-stack">
        <div className="page-panel page-panel-pad">
          <h2 className="section-title text-2xl">
            Citas de {nombre} ({rol})
          </h2>
          <p className="section-muted mt-1 text-sm">
            Revisa tus citas asignadas y su estado actual.
          </p>
        </div>

        <CitaTable
          citas={citas}
          actualizarEstado={actualizarEstado}
          showAcciones={false}
        />
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
