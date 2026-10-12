import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCitas } from "../../hooks/useCitas";
import { useAuth } from "../../hooks/useAuth";
import { buscarCitas } from "../../api/citas.api";
import { getHistorialAtenciones } from "../../api/tratamientos.api";
import BuscadorPacientes from "../../components/HistorialPacientes/BuscadorPacientes";
import ListaTratamientos from "../../components/HistorialPacientes/ListaTratamientos";
import DetallePaciente from "../../components/HistorialPacientes/DetallePaciente";
import { FaSearch } from "react-icons/fa";
import { belongsToProfessionalRole } from "../../utils/professionalOwnership";
import { usePatientUpdates } from "../../hooks/usePatientUpdates";
import { findSelectedAttention } from "../../utils/attentionHistory";

const getRecordId = (record) => {
  if (record && typeof record === "object") {
    return String(record._id || record.id || "").trim();
  }

  return String(record || "").trim();
};

const getCitaId = (record) =>
  getRecordId(record?.cita) || getRecordId(record?.citaId);

const getNombreCita = (cita) => {
  const cliente = cita?.cliente;
  const nombre =
    typeof cliente === "object" ? cliente?.nombre : cliente || cita?.nombre;

  return String(nombre || "").trim();
};

const perteneceACita = (record, cita) => {
  const citaId = getRecordId(cita);
  if (!citaId || !record) return false;

  if (getCitaId(record) === citaId) return true;

  // This fallback keeps the selected view coherent if it was opened from an
  // appointment snapshot rather than a treatment record.
  return Boolean(record?.cliente && getRecordId(record) === citaId);
};

const aplicarActualizacionCita = (record, cita) => {
  if (!perteneceACita(record, cita)) return record;

  const nombre = getNombreCita(cita);
  const citaActual =
    record?.cita && typeof record.cita === "object"
      ? { ...record.cita, ...cita }
      : record?.cita;

  return {
    ...record,
    ...(nombre ? { nombre } : {}),
    ...(citaActual ? { cita: citaActual } : {}),
  };
};

export default function HistorialPacientes() {
  const location = useLocation();
  const {
    tratamientos: tratamientosClinicos,
    setTratamientos: setTratamientosClinicos,
    socket,
    obtenerTratamientos,
  } =
    useCitas();
  const { rol, user } = useAuth();
  const professionalId = getRecordId(user);
  const esHistorialCosmiatra = rol === "cosmiatra";
  const [atenciones, setAtenciones] = useState([]);
  const tratamientos = esHistorialCosmiatra ? atenciones : tratamientosClinicos;
  const setTratamientos = esHistorialCosmiatra ? setAtenciones : setTratamientosClinicos;
  const atencionesRequestRef = useRef(0);

  const [busqueda, setBusqueda] = useState("");
  // The clinical form returns the same patient snapshot in route state. This
  // keeps the clinician in the selected-patient view instead of dropping
  // them back into the entire list after pressing "Volver".
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(
    () => location.state?.paciente || null,
  );
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrandoSugerencias, setMostrandoSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const obtenerTratamientosRef = useRef(obtenerTratamientos);

  useEffect(() => {
    obtenerTratamientosRef.current = obtenerTratamientos;
  }, [obtenerTratamientos]);

  const recargarTratamientos = useCallback(async () => {
    if (!esHistorialCosmiatra) return obtenerTratamientosRef.current();

    const requestId = ++atencionesRequestRef.current;
    try {
      const data = await getHistorialAtenciones();
      const records = Array.isArray(data) ? data : [];
      if (requestId !== atencionesRequestRef.current) return [];
      setAtenciones(records);
      return records;
    } catch (error) {
      if (requestId !== atencionesRequestRef.current) return [];
      console.error("Error al obtener el historial de atenciones:", error);
      setAtenciones([]);
      return [];
    }
  }, [esHistorialCosmiatra]);

  useEffect(() => {
    let isActive = true;
    const cargarTratamientos = async () => {
      setLoadingInicial(true);
      await recargarTratamientos();
      if (isActive) setLoadingInicial(false);
    };
    void cargarTratamientos();
    return () => {
      isActive = false;
      atencionesRequestRef.current += 1;
    };
  }, [recargarTratamientos, professionalId]);

  useEffect(() => {
    // A selected treatment is a snapshot. Keep its identity and details in
    // sync when the API refreshes after a patient/professional profile edit.
    setPacienteSeleccionado((currentPatient) => {
      return findSelectedAttention(tratamientos, currentPatient);
    });
  }, [tratamientos]);

  useEffect(() => {
    if (!busqueda.trim()) {
      setSugerencias([]);
      return;
    }

    const obtenerSugerencias = async () => {
      try {
        setCargando(true);
        const data = await buscarCitas(busqueda);
        setSugerencias(data);
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
      (t) =>
        belongsToProfessionalRole(t, user) &&
        t.nombre?.toLowerCase() === nombre.toLowerCase(),
    );
    setPacienteSeleccionado(encontrado || null);
  };

  const handleSeleccionarTratamiento = (tratamiento) => {
    setPacienteSeleccionado(tratamiento);
  };

  const handleVolver = () => {
    setPacienteSeleccionado(null);
  };

  usePatientUpdates((patient) => {
    if (patient?.nombreAnterior && patient?.nombre) {
      setBusqueda((current) =>
        current.trim().toLocaleLowerCase("es-PE") === patient.nombreAnterior.trim().toLocaleLowerCase("es-PE")
          ? patient.nombre
          : current,
      );
    }
    setSugerencias([]);
    setMostrandoSugerencias(false);
    if (esHistorialCosmiatra) void recargarTratamientos();
  }, socket);

  useEffect(() => {
    if (!socket) return;

    let isActive = true;

    const handleRefresh = () => {
      // Reload the authorized read model instead of inserting socket payloads
      // into either the clinical list or the cosmiatra attendance history.
      void recargarTratamientos();
    };

    const handleCitaActualizada = (payload) => {
      const citaActualizada = payload?.cita || payload;
      if (!getRecordId(citaActualizada)) return;

      // Apply the corrected name immediately, then obtain the authoritative
      // treatment data. This avoids leaving the selected patient stale while
      // the request is in flight.
      setTratamientos((prev) =>
        prev.map((tratamiento) =>
          aplicarActualizacionCita(tratamiento, citaActualizada),
        ),
      );
      setPacienteSeleccionado((paciente) =>
        aplicarActualizacionCita(paciente, citaActualizada),
      );

      void recargarTratamientos().then((tratamientosActualizados) => {
        if (!isActive || !Array.isArray(tratamientosActualizados)) return;

        const tratamientoActualizado = tratamientosActualizados.find(
          (tratamiento) => perteneceACita(tratamiento, citaActualizada),
        );
        if (!tratamientoActualizado) return;

        // Do not overwrite the selection if the clinician switched to a
        // different patient while the refresh was pending.
        setPacienteSeleccionado((paciente) =>
          perteneceACita(paciente, citaActualizada)
            ? tratamientoActualizado
            : paciente,
        );
      });
    };

    socket.on("nuevaCita", handleRefresh);
    socket.on("estadoCitaActualizado", handleRefresh);
    socket.on("tratamientoActualizado", handleRefresh);
    socket.on("profesionalActualizado", handleRefresh);
    socket.on("citaActualizada", handleCitaActualizada);

    return () => {
      isActive = false;
      socket.off("nuevaCita", handleRefresh);
      socket.off("estadoCitaActualizado", handleRefresh);
      socket.off("tratamientoActualizado", handleRefresh);
      socket.off("profesionalActualizado", handleRefresh);
      socket.off("citaActualizada", handleCitaActualizada);
    };
  }, [socket, setTratamientos, recargarTratamientos]);

  const tratamientosFiltrados = tratamientos.filter((tratamiento) => {
    if (!tratamiento) return false;

    switch (rol) {
      case "doctor":
      case "cosmiatra":
        return belongsToProfessionalRole(tratamiento, user);
      case "administrador":
      case "admin":
        return true;
      default:
        return false;
    }
  });

  if (loadingInicial) {
    return (
      <section className="page-section ui-page">
        <div className="ui-empty-state flex min-h-[280px] items-center justify-center text-slate-300">
          <span className="animate-pulse">Cargando historial de pacientes...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        {!pacienteSeleccionado && (
          <div className="ui-panel px-4 py-4 sm:px-6">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <FaSearch className="text-indigo-300/80" /> Busca por nombre para abrir una historia específica.
            </div>
            <BuscadorPacientes
              busqueda={busqueda}
              setBusqueda={setBusqueda}
              sugerencias={sugerencias}
              cargando={cargando}
              mostrandoSugerencias={mostrandoSugerencias}
              setMostrandoSugerencias={setMostrandoSugerencias}
              onSeleccionar={handleSeleccionarSugerencia}
            />
          </div>
        )}

        {pacienteSeleccionado ? (
          <DetallePaciente
            paciente={pacienteSeleccionado}
            tratamientos={tratamientosFiltrados}
            onSeleccionar={handleSeleccionarTratamiento}
            onVolver={handleVolver}
            mostrarAtenciones={esHistorialCosmiatra}
          />
        ) : (
          <ListaTratamientos
            tratamientos={tratamientosFiltrados}
            onSeleccionar={setPacienteSeleccionado}
            mostrarAtenciones={esHistorialCosmiatra}
          />
        )}
      </div>
    </section>
  );
}
