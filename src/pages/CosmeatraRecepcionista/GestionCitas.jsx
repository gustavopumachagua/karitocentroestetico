import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import CitaForm from "../../components/AgendaCitas/CitaForm";
import CitaTable from "../../components/AgendaCitas/CitaTable";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {});

    socket.on("nuevaCita", (cita) => {
      setCitas((prev) => [...prev, cita]);
    });

    socket.on("estadoCitaActualizado", (citaActualizada) => {
      setCitas((prev) =>
        prev.map((c) => (c._id === citaActualizada._id ? citaActualizada : c))
      );
    });

    socket.on("disconnect", () => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/usuarios/profesionales`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error al obtener usuarios:", err));
  }, []);

  const fetchCitas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      setCitas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const registrarCita = async (nuevaCita) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaCita),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar cita");

      setCitas([...citas, data.cita]);
      setModalMessage("✅ Cita registrada correctamente");
      setShowModal(true);
    } catch (error) {
      setModalMessage("❌ Error al registrar la cita");
      setShowModal(true);
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/citas/${id}/estado`,
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

      setCitas((prev) => prev.map((c) => (c._id === id ? data.cita : c)));
      setModalMessage("✅ Estado actualizado correctamente");
      setShowModal(true);
    } catch (error) {
      setModalMessage("❌ " + error.message);
      setShowModal(true);
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
          clientes={citas.map((c) =>
            typeof c.cliente === "object" ? c.cliente.nombre : c.cliente
          )}
        />

        <CitaTable citas={citas} actualizarEstado={actualizarEstado} />
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
