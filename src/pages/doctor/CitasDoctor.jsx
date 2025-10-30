import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function CitasDoctor() {
  const [citas, setCitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const nombre = user?.nombre || "";
  const rol = user?.rol?.toLowerCase() || "";

  const fetchCitas = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
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
    setModalMessage(mensaje);
    setShowModal(true);
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
    setShowModal(false);

    setTimeout(() => {
      iniciarRecarga();
    }, 400);
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

      mostrarModalYLuegoSpinner("✅ Estado actualizado correctamente");
    } catch (error) {
      setModalMessage("❌ " + error.message);
      setShowModal(true);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 sm:p-8 space-y-8">
        <h2 className="text-2xl font-bold text-white">
          Citas de {nombre} ({rol})
        </h2>

        <CitaTable
          citas={citas}
          actualizarEstado={actualizarEstado}
          showAcciones={false}
        />
      </div>

      <ConfirmationModal
        show={showModal}
        message={modalMessage}
        type={modalMessage.includes("Error") ? "error" : "success"}
        onClose={handleModalClose}
      />
    </section>
  );
}
