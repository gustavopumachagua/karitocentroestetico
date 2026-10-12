import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useCitas } from "../../hooks/useCitas";
import { getTratamientosParaReporteServicios } from "../../api/tratamientos.api";
import { FaArrowLeft } from "react-icons/fa";

import BuscadorClientes from "../../components/ReportesServiciosIngresos/BuscadorClientes";
import ClienteCard from "../../components/ReportesServiciosIngresos/ClienteCard";
import HistorialCliente from "../../components/ReportesServiciosIngresos/HistorialCliente";
import TablaServicios from "../../components/ReportesServiciosIngresos/TablaServicios";
import { calcularTotalAtenciones } from "../../components/ReportesServiciosIngresos/calcularMonto";
import { obtenerFechaCitaEnLima } from "../../utils/citasFecha";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";
import { usePatientUpdates } from "../../hooks/usePatientUpdates";
import { getPatientKey, getPatientName, isSamePatient } from "../../utils/patientIdentity";
import { buildServiceReportPatient, getServiceReportDay } from "../../utils/serviceReport";

export default function ReportesServiciosIngresos() {
  const { pagos, socket, obtenerPagos } = useCitas();
  const { professionalNamesById } = useProfessionalDirectory();
  const obtenerPagosRef = useRef(obtenerPagos);

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tratamientosReporte, setTratamientosReporte] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState(() =>
    obtenerFechaCitaEnLima(new Date()),
  );
  const [loading, setLoading] = useState(true);
  const tratamientosCliente = useMemo(
    () => clienteSeleccionado
      ? tratamientosReporte.filter((tratamiento) => isSamePatient(tratamiento, clienteSeleccionado))
      : [],
    [clienteSeleccionado, tratamientosReporte],
  );

  useEffect(() => {
    obtenerPagosRef.current = obtenerPagos;
  }, [obtenerPagos]);

  const obtenerReporteServicios = useCallback(async () => {
    try {
      const data = await getTratamientosParaReporteServicios();
      const normalized = Array.isArray(data) ? data : [];
      setTratamientosReporte(normalized);
      return normalized;
    } catch (error) {
      // The daily report remains isolated from the clinical-history endpoint:
      // an authorization failure here must not accidentally render another
      // professional's cached treatment list.
      console.error("Error al obtener el reporte de servicios:", error);
      setTratamientosReporte([]);
      return [];
    }
  }, []);

  const obtenerDatosActualizados = (tratamientosCliente) => {
    return buildServiceReportPatient(tratamientosCliente, tratamientosCliente?.[0]);
  };

  useEffect(() => {
    setClienteSeleccionado((current) => {
      if (!current) return null;
      const historial = tratamientosReporte.filter((t) => isSamePatient(t, current));
      return historial.length > 0
        ? { ...current, ...obtenerDatosActualizados(historial) }
        : current;
    });
  }, [tratamientosReporte]);

  usePatientUpdates((patient) => {
    if (patient?.nombreAnterior && patient?.nombre) {
      setBusqueda((current) =>
        current.trim().toLocaleLowerCase("es-PE") === patient.nombreAnterior.trim().toLocaleLowerCase("es-PE")
          ? patient.nombre
          : current,
      );
    }
    setSugerencias([]);
    void obtenerReporteServicios();
  }, socket);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await Promise.all([
        obtenerReporteServicios(),
        obtenerPagosRef.current(),
      ]);
      setLoading(false);
    };
    void cargarDatos();
  }, [obtenerReporteServicios]);

  useEffect(() => {
    if (busqueda.trim() === "") {
      setSugerencias([]);
      return;
    }

    const pacientes = new Map();
    tratamientosReporte.filter((record) =>
      getPatientName(record).toLocaleLowerCase("es-PE").includes(busqueda.trim().toLocaleLowerCase("es-PE")),
    ).forEach((record) => {
      const key = getPatientKey(record);
      if (!pacientes.has(key)) pacientes.set(key, record);
    });
    setSugerencias([...pacientes.values()]);
  }, [busqueda, tratamientosReporte]);

  const serviciosFiltrados = useMemo(
    () =>
      (Array.isArray(tratamientosReporte) ? tratamientosReporte : []).filter(
        (tratamiento) =>
          getServiceReportDay(tratamiento) === fechaFiltro,
      ),
    [fechaFiltro, tratamientosReporte],
  );

  const buscarCliente = (patient) => {
    const nombre = getPatientName(patient);
    const anchor = typeof patient === "object"
      ? patient
      : tratamientosReporte.find((t) =>
          getPatientName(t).toLocaleLowerCase("es-PE") === nombre.toLocaleLowerCase("es-PE"),
        ) || { nombre };
    const historial = tratamientosReporte.filter((record) => isSamePatient(record, anchor));
    setClienteSeleccionado(historial.length ? buildServiceReportPatient(historial, anchor) : null);

    setSugerencias([]);
    setBusqueda("");
  };

  const totalIngresos = calcularTotalAtenciones(serviciosFiltrados, pagos);
  const totalHistorial = calcularTotalAtenciones(tratamientosCliente, pagos);

  const irACita = (tratamiento) => {
    const historial = tratamientosReporte.filter(
      (t) => isSamePatient(t, tratamiento),
    );

    const datosActualizados = obtenerDatosActualizados(historial);

    setClienteSeleccionado({
      nombre: tratamiento.nombre,
      ...datosActualizados,
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleNuevoPago = () => {
      obtenerPagosRef.current();
      void obtenerReporteServicios();
    };

    const handleTratamientoActualizado = () => {
      void obtenerReporteServicios();
    };

    socket.on("nuevoPago", handleNuevoPago);
    socket.on("tratamientoActualizado", handleTratamientoActualizado);
    socket.on("estadoCitaActualizado", handleTratamientoActualizado);
    socket.on("citaActualizada", handleTratamientoActualizado);
    socket.on("citaEliminada", handleTratamientoActualizado);
    socket.on("profesionalActualizado", handleTratamientoActualizado);

    return () => {
      socket.off("nuevoPago", handleNuevoPago);
      socket.off("tratamientoActualizado", handleTratamientoActualizado);
      socket.off("estadoCitaActualizado", handleTratamientoActualizado);
      socket.off("citaActualizada", handleTratamientoActualizado);
      socket.off("citaEliminada", handleTratamientoActualizado);
      socket.off("profesionalActualizado", handleTratamientoActualizado);
    };
  }, [socket, obtenerReporteServicios]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        <span>Cargando información...</span>
      </div>
    );
  }

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        <BuscadorClientes
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          sugerencias={sugerencias}
          buscarCliente={buscarCliente}
        />

        {clienteSeleccionado ? (
          <div className="space-y-4">
            <button
              onClick={() => setClienteSeleccionado(null)}
              className="ui-button ui-button-secondary w-full sm:w-auto"
            >
              <FaArrowLeft /> Volver al reporte
            </button>

            <ClienteCard cliente={clienteSeleccionado} />
            <HistorialCliente
              tratamientos={tratamientosCliente}
              total={totalHistorial}
              pagos={pagos}
              irACita={irACita}
            />
          </div>
        ) : (
          <TablaServicios
            fechaFiltro={fechaFiltro}
            setFechaFiltro={setFechaFiltro}
            servicios={serviciosFiltrados}
            buscarCliente={buscarCliente}
            totalIngresos={totalIngresos}
            pagos={pagos}
            professionalNamesById={professionalNamesById}
          />
        )}
      </div>
    </section>
  );
}
