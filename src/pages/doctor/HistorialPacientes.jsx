import { useState, useEffect } from "react";
import axios from "axios";
import { useCitas } from "../../context/CitasContext";
import BuscadorPacientes from "../../components/HistorialPacientes/BuscadorPacientes";
import ListaTratamientos from "../../components/HistorialPacientes/ListaTratamientos";
import DetallePaciente from "../../components/HistorialPacientes/DetallePaciente";

export default function HistorialPacientes() {
  const { tratamientos, setTratamientos, socket, obtenerTratamientos } =
    useCitas();

  const [busqueda, setBusqueda] = useState("");
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);

  useEffect(() => {
    const cargarTratamientos = async () => {
      setLoadingInicial(true);
      await obtenerTratamientos();
      setLoadingInicial(false);
    };
    cargarTratamientos();
  }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setSugerencias([]);
      return;
    }

    const obtenerSugerencias = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/citas/buscar?nombre=${busqueda}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSugerencias(response.data);
      } catch (error) {
        console.error("Error al autocompletar:", error);
      } finally {
        setCargando(false);
      }
    };

    const delay = setTimeout(obtenerSugerencias, 300);
    return () => clearTimeout(delay);
  }, [busqueda]);

  const handleSeleccionarSugerencia = (nombre) => {
    setBusqueda(nombre);
    setMostrandoSugerencias(false);
    const encontrado = tratamientos.find(
      (t) => t.nombre?.toLowerCase() === nombre.toLowerCase()
    );
    setPacienteSeleccionado(encontrado || null);
  };

  const handleSeleccionarTratamiento = (tratamiento) => {
    setPacienteSeleccionado(tratamiento);
  };

  const handleVolver = () => {
    setPacienteSeleccionado(null);
  };

  useEffect(() => {
    if (!socket) return;

    const handleNuevaCita = (nuevaCita) => {
      setTratamientos((prev) => {
        const existe = prev.some((t) => t.cliente === nuevaCita.cliente);
        if (existe) return prev;
        return [nuevaCita, ...prev];
      });
    };

    const handleEstadoActualizado = (citaActualizada) => {
      setTratamientos((prev) =>
        prev.map((t) => (t._id === citaActualizada._id ? citaActualizada : t))
      );
    };

    const handleTratamientoActualizado = (data) => {
      obtenerTratamientos();
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoActualizado);
    socket.on("tratamientoActualizado", handleTratamientoActualizado);

    return () => {
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoActualizado);
      socket.off("tratamientoActualizado", handleTratamientoActualizado);
    };
  }, [socket, setTratamientos]);

  const user = JSON.parse(localStorage.getItem("user"));
  const rol = user?.rol?.toLowerCase();
  const nombre = user?.nombre?.toLowerCase();

  const tratamientosFiltrados = tratamientos.filter((tratamiento) => {
    if (!tratamiento) return false;

    switch (rol) {
      case "doctor":
      case "cosmiatra":
        return (
          tratamiento.profesional?.toLowerCase() === nombre &&
          tratamiento.rol?.toLowerCase() === rol
        );
      case "admin":
        return true;
      default:
        return false;
    }
  });

  if (loadingInicial) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-300">
        <span>Cargando historial de pacientes...</span>
      </div>
    );
  }

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 sm:p-8 max-w-6xl mx-auto">
        <BuscadorPacientes
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          sugerencias={sugerencias}
          cargando={cargando}
          mostrandoSugerencias={mostrandoSugerencias}
          setMostrandoSugerencias={setMostrandoSugerencias}
          onSeleccionar={handleSeleccionarSugerencia}
        />

        {pacienteSeleccionado ? (
          <DetallePaciente
            paciente={pacienteSeleccionado}
            tratamientos={tratamientosFiltrados}
            onSeleccionar={handleSeleccionarTratamiento}
            onVolver={handleVolver}
          />
        ) : (
          <ListaTratamientos
            tratamientos={tratamientosFiltrados}
            onSeleccionar={setPacienteSeleccionado}
          />
        )}
      </div>
    </section>
  );
}
