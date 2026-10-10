import { useCallback, useEffect, useRef, useState } from "react";
import { useCitas } from "../../hooks/useCitas";
import { useAuth } from "../../hooks/useAuth";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";
import GraficoCitasEvolucion from "../../components/DashboardDoctor/GraficoCitasEvolucion";
import GraficoTratamientos from "../../components/DashboardDoctor/GraficoTratamientos";
import GraficoCitasPorEstado from "../../components/DashboardDoctor/GraficoCitasPorEstado";
import GraficoInsumos from "../../components/DashboardDoctor/GraficoInsumos";
import { belongsToProfessionalRole } from "../../utils/professionalOwnership";

const toTextList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function MisReportes() {
  const { citas, tratamientos, obtenerCitas, obtenerTratamientos, socket } =
    useCitas();
  const { rol, user } = useAuth();

  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState("");
  const [citasEvolucion, setCitasEvolucion] = useState([]);
  const [tratamientosDistribucion, setTratamientosDistribucion] = useState([]);
  const [citasPorEstado, setCitasPorEstado] = useState([]);
  const [insumosMasUsados, setInsumosMasUsados] = useState([]);
  const obtenerCitasRef = useRef(obtenerCitas);
  const obtenerTratamientosRef = useRef(obtenerTratamientos);

  useEffect(() => {
    obtenerCitasRef.current = obtenerCitas;
  }, [obtenerCitas]);

  useEffect(() => {
    obtenerTratamientosRef.current = obtenerTratamientos;
  }, [obtenerTratamientos]);

  const recargarCitas = useCallback(() => obtenerCitasRef.current(), []);
  const recargarTratamientos = useCallback(
    () => obtenerTratamientosRef.current(),
    [],
  );

  const COLORS = ["#34D399", "#FBBF24", "#EF4444", "#60A5FA", "#8B5CF6"];

  useEffect(() => {
    void recargarCitas();
    void recargarTratamientos();
  }, [recargarCitas, recargarTratamientos]);

  useEffect(() => {
    if (!socket) return;

    const handleNuevaCita = () => {
      void recargarCitas();
    };

    const handleEstadoCitaActualizado = () => {
      void recargarCitas();
    };

    const handleTratamientoActualizado = () => {
      void recargarTratamientos();
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoCitaActualizado);
    socket.on("tratamientoActualizado", handleTratamientoActualizado);

    return () => {
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoCitaActualizado);
      socket.off("tratamientoActualizado", handleTratamientoActualizado);
    };
  }, [socket, recargarCitas, recargarTratamientos]);

  useEffect(() => {
    if (!rol || !user) {
      setCitasEvolucion([]);
      setTratamientosDistribucion([]);
      setCitasPorEstado([]);
      setInsumosMasUsados([]);
      return;
    }

    const anioSeleccionado = Number(filtroAnio);
    const mesSeleccionado = filtroMes ? Number(filtroMes) : null;
    const obtenerFecha = (valor) => {
      const fecha = new Date(
        typeof valor === "string" ? valor.replace(" ", "T") : valor,
      );
      return Number.isNaN(fecha.getTime()) ? null : fecha;
    };
    const esMiRegistro = (registro) =>
      belongsToProfessionalRole(registro, user);
    const estaEnPeriodo = (registro, incluirAnioAnterior = false) => {
      const fecha = obtenerFecha(registro?.fecha);
      if (!fecha) return false;

      const anioValido = incluirAnioAnterior
        ? [anioSeleccionado, anioSeleccionado - 1].includes(
            fecha.getFullYear(),
          )
        : fecha.getFullYear() === anioSeleccionado;

      return (
        anioValido &&
        (!mesSeleccionado || fecha.getMonth() + 1 === mesSeleccionado)
      );
    };

    const citasFiltradas = citas.filter(
      (cita) => esMiRegistro(cita) && estaEnPeriodo(cita, true),
    );

    const citasAtendidas = citasFiltradas.filter(
      (cita) => cita.estado?.toLowerCase() === "atendido",
    );

    const acumulado = {};
    citasAtendidas.forEach((cita) => {
      const fecha = obtenerFecha(cita.fecha);
      if (!fecha) return;

      const anio = fecha.getFullYear();
      const mes = fecha.toLocaleString("es-ES", { month: "short" });
      if (!acumulado[mes]) acumulado[mes] = {};
      acumulado[mes][anio] = (acumulado[mes][anio] || 0) + 1;
    });

    const ordenMeses = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sept",
      "oct",
      "nov",
      "dic",
    ];
    const dataEvo = Object.entries(acumulado)
      .map(([mes, val]) => ({
        mes,
        [anioSeleccionado]: val[anioSeleccionado] || 0,
        [anioSeleccionado - 1]: val[anioSeleccionado - 1] || 0,
      }))
      .sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));

    setCitasEvolucion(dataEvo);

    const tratamientosFiltrados = tratamientos.filter(
      (tratamiento) =>
        esMiRegistro(tratamiento) && estaEnPeriodo(tratamiento),
    );

    const porServicio = {};
    tratamientosFiltrados.forEach((t) => {
      toTextList(t.servicio).forEach((s) => {
        porServicio[s] = (porServicio[s] || 0) + 1;
      });
    });
    setTratamientosDistribucion(
      Object.entries(porServicio).map(([name, value]) => ({ name, value }))
    );

    const citasPorEstadoFiltradas = citas.filter(
      (cita) => esMiRegistro(cita) && estaEnPeriodo(cita),
    );

    const estados = {};
    citasPorEstadoFiltradas.forEach((c) => {
      const estado = c.estado || "Sin estado";
      estados[estado] = (estados[estado] || 0) + 1;
    });

    setCitasPorEstado(
      Object.entries(estados).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    );

    const insumos = {};
    tratamientosFiltrados.forEach((t) => {
      toTextList(t.insumos).forEach((i) => {
        insumos[i] = (insumos[i] || 0) + 1;
      });
    });
    setInsumosMasUsados(
      Object.entries(insumos)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    );
  }, [filtroAnio, filtroMes, citas, tratamientos, rol, user]);

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        <div className="ui-panel p-2 sm:p-3">
          <FiltrosReportes
            filtroAnio={filtroAnio}
            setFiltroAnio={setFiltroAnio}
            filtroMes={filtroMes}
            setFiltroMes={setFiltroMes}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
          <GraficoCitasEvolucion data={citasEvolucion} anio={filtroAnio} />
          <GraficoTratamientos
            data={tratamientosDistribucion}
            colors={COLORS}
          />
          <GraficoCitasPorEstado data={citasPorEstado} />
          <GraficoInsumos data={insumosMasUsados} />
        </div>
      </div>
    </section>
  );
}
