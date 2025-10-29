import { useState, useEffect } from "react";
import { useCitas } from "../../context/CitasContext";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";
import GraficoCitasEvolucion from "../../components/DashboardDoctor/GraficoCitasEvolucion";
import GraficoTratamientos from "../../components/DashboardDoctor/GraficoTratamientos";
import GraficoCitasPorEstado from "../../components/DashboardDoctor/GraficoCitasPorEstado";
import GraficoInsumos from "../../components/DashboardDoctor/GraficoInsumos";

export default function MisReportes() {
  const { citas, tratamientos, obtenerCitas, obtenerTratamientos, socket } =
    useCitas();

  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState("");
  const [citasEvolucion, setCitasEvolucion] = useState([]);
  const [tratamientosDistribucion, setTratamientosDistribucion] = useState([]);
  const [citasPorEstado, setCitasPorEstado] = useState([]);
  const [insumosMasUsados, setInsumosMasUsados] = useState([]);

  const COLORS = ["#34D399", "#FBBF24", "#EF4444", "#60A5FA", "#8B5CF6"];

  useEffect(() => {
    obtenerCitas();
    obtenerTratamientos();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("nuevaCita", (nuevaCita) => {
      obtenerCitas();
    });

    socket.on("estadoCitaActualizado", (citaActualizada) => {
      obtenerCitas();
    });

    socket.on("tratamientoActualizado", (data) => {
      obtenerTratamientos();
    });

    return () => {
      socket.off("nuevaCita");
      socket.off("estadoCitaActualizado");
      socket.off("tratamientoActualizado");
    };
  }, [socket]);

  useEffect(() => {
    if (!citas.length || !tratamientos.length) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const rol = user?.rol?.toLowerCase();
    const nombre = user?.nombre?.toLowerCase();
    if (!rol || !nombre) return;

    const citasFiltradas = citas.filter((c) => {
      const fechaCita = new Date(c.fecha.replace(" ", "T"));
      const anioCita = fechaCita.getFullYear();
      const mesCita = fechaCita.getMonth() + 1;

      const nombreProfesional =
        typeof c.profesional === "string"
          ? c.profesional.toLowerCase()
          : c.profesional?.nombre?.toLowerCase() || "";

      return (
        c.rol?.toLowerCase() === rol &&
        nombreProfesional === nombre &&
        [Number(filtroAnio), Number(filtroAnio) - 1].includes(anioCita) &&
        (!filtroMes || mesCita === Number(filtroMes))
      );
    });

    const citasAtendidas = citasFiltradas.filter(
      (c) => c.estado?.toLowerCase() === "atendido"
    );

    const acumulado = {};
    citasAtendidas.forEach((c) => {
      const f = new Date(c.fecha);
      const anio = f.getFullYear();
      const mes = f.toLocaleString("es-ES", { month: "short" });
      if (![filtroAnio, filtroAnio - 1].includes(anio)) return;
      if (filtroMes && f.getMonth() + 1 !== filtroMes) return;
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
        [filtroAnio]: val[filtroAnio] || 0,
        [filtroAnio - 1]: val[filtroAnio - 1] || 0,
      }))
      .sort((a, b) => ordenMeses.indexOf(a.mes) - ordenMeses.indexOf(b.mes));

    setCitasEvolucion(dataEvo);

    const idsCitasAtendidas = new Set(citasAtendidas.map((c) => c._id));

    const tratamientosFiltrados = tratamientos.filter(
      (t) =>
        t.rol?.toLowerCase() === rol &&
        t.profesional?.toLowerCase() === nombre &&
        new Date(t.fecha).getFullYear() === Number(filtroAnio) &&
        (!filtroMes || new Date(t.fecha).getMonth() + 1 === Number(filtroMes))
    );

    const porServicio = {};
    tratamientosFiltrados.forEach((t) => {
      (t.servicio || []).forEach((s) => {
        porServicio[s] = (porServicio[s] || 0) + 1;
      });
    });
    setTratamientosDistribucion(
      Object.entries(porServicio).map(([name, value]) => ({ name, value }))
    );

    const citasPorEstadoFiltradas = citas.filter((c) => {
      const fechaCita = new Date(c.fecha.replace(" ", "T"));
      const anioCita = fechaCita.getFullYear();
      const mesCita = fechaCita.getMonth() + 1;

      const nombreProfesional =
        typeof c.profesional === "string"
          ? c.profesional.toLowerCase()
          : c.profesional?.nombre?.toLowerCase() || "";

      return (
        c.rol?.toLowerCase() === rol &&
        nombreProfesional === nombre &&
        anioCita === Number(filtroAnio) &&
        (!filtroMes || mesCita === Number(filtroMes))
      );
    });

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
      (t.insumos || []).forEach((i) => {
        insumos[i] = (insumos[i] || 0) + 1;
      });
    });
    setInsumosMasUsados(
      Object.entries(insumos)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    );
  }, [filtroAnio, filtroMes, citas, tratamientos]);

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <FiltrosReportes
        filtroAnio={filtroAnio}
        setFiltroAnio={setFiltroAnio}
        filtroMes={filtroMes}
        setFiltroMes={setFiltroMes}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GraficoCitasEvolucion data={citasEvolucion} anio={filtroAnio} />
        <GraficoTratamientos data={tratamientosDistribucion} colors={COLORS} />
        <GraficoCitasPorEstado data={citasPorEstado} />
        <GraficoInsumos data={insumosMasUsados} />
      </div>
    </section>
  );
}
