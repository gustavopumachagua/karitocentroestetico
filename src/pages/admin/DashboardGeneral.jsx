import { useEffect, useRef, useState } from "react";
import { useCitas } from "../../hooks/useCitas";
import { getCitas } from "../../api/citas.api";
import ResumenCitas from "../../components/DashboardGeneral/ResumenCitas";
import IngresosMensuales from "../../components/DashboardGeneral/IngresosMensuales";
import MetodosPagoChart from "../../components/DashboardGeneral/MetodosPagoChart";
import InventarioTable from "../../components/DashboardGeneral/InventarioTable";
import FiltrosInventario from "../../components/DashboardGeneral/FiltrosInventario";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";
import { DashboardSkeleton } from "../../components/common/SkeletonLayouts";

export default function DashboardGeneral() {
  const { obtenerPagos, obtenerInventario, socket } = useCitas();
  const obtenerPagosRef = useRef(obtenerPagos);
  const obtenerInventarioRef = useRef(obtenerInventario);
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [todosLosPagos, setTodosLosPagos] = useState([]);
  const [stockInventario, setStockInventario] = useState([]);
  const [resumenCitas, setResumenCitas] = useState([]);
  const [ingresosFacturacion, setIngresosFacturacion] = useState({});
  const [metodosPago, setMetodosPago] = useState([]);
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [mostrarSoloBajos, setMostrarSoloBajos] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerPagosRef.current = obtenerPagos;
    obtenerInventarioRef.current = obtenerInventario;
  }, [obtenerInventario, obtenerPagos]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const citasData = await getCitas();
        setTodasLasCitas(Array.isArray(citasData) ? citasData : []);

        const pagosData = await obtenerPagosRef.current();
        setTodosLosPagos(pagosData);

        const inventarioData = await obtenerInventarioRef.current("cosmiatra");
        procesarInventario(inventarioData);
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNuevaCita = (cita) => {
      setTodasLasCitas((prev) => [cita, ...prev]);
    };

    const handleEstadoActualizado = (citaActualizada) => {
      setTodasLasCitas((prev) =>
        prev.map((c) => (c._id === citaActualizada._id ? citaActualizada : c)),
      );
    };

    const handleNuevoPago = (pago) => {
      setTodosLosPagos((prev) => [pago, ...prev]);
    };

    const handleInventarioActualizado = (data) => {
      if (data.action === "agregar") {
        setStockInventario((prev) => [...prev, data.item]);
      } else if (data.action === "eliminar") {
        setStockInventario((prev) =>
          prev.filter((item) => item._id !== data.item._id),
        );
      }
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoActualizado);
    socket.on("nuevoPago", handleNuevoPago);
    socket.on("inventarioActualizado", handleInventarioActualizado);

    return () => {
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoActualizado);
      socket.off("nuevoPago", handleNuevoPago);
      socket.off("inventarioActualizado", handleInventarioActualizado);
    };
  }, [socket]);

  useEffect(() => {
    if (todasLasCitas.length === 0 && todosLosPagos.length === 0) return;

    const pagosFiltrados = todosLosPagos.filter((p) => {
      const fecha = new Date(p.fecha);
      const mismoAño = fecha.getFullYear() === filtroAnio;
      const mismoMes = filtroMes ? fecha.getMonth() + 1 === filtroMes : true;
      return mismoAño && mismoMes;
    });

    const citasFiltradas = todasLasCitas.filter((c) => {
      const fecha = new Date(c.fecha);
      const mismoAño = fecha.getFullYear() === filtroAnio;
      const mismoMes = filtroMes ? fecha.getMonth() + 1 === filtroMes : true;
      return mismoAño && mismoMes;
    });

    procesarResumenCitas(citasFiltradas);
    procesarIngresos(todosLosPagos);
    procesarMetodosPago(pagosFiltrados);
  }, [todasLasCitas, todosLosPagos, filtroMes, filtroAnio]);

  const procesarResumenCitas = (citas) => {
    const conteo = { pendiente: 0, atendido: 0, cancelado: 0, aplazado: 0 };
    citas.forEach((cita) => {
      conteo[cita.estado] = (conteo[cita.estado] || 0) + 1;
    });
    setResumenCitas([
      { name: "Atendidas", value: conteo.atendido },
      { name: "Canceladas", value: conteo.cancelado },
      { name: "Aplazadas", value: conteo.aplazado },
    ]);
  };

  const procesarIngresos = (pagos) => {
    const ingresosPorAñoMes = {};
    pagos.forEach((pago) => {
      const fecha = new Date(pago.fecha);
      const año = fecha.getFullYear();
      const mes = fecha.toLocaleString("es-ES", { month: "long" });
      if (!ingresosPorAñoMes[año]) ingresosPorAñoMes[año] = {};
      ingresosPorAñoMes[año][mes] =
        (ingresosPorAñoMes[año][mes] || 0) + pago.total;
    });
    setIngresosFacturacion(ingresosPorAñoMes);
  };

  const procesarMetodosPago = (pagos) => {
    const conteo = {};
    pagos.forEach((pago) => {
      const metodo = pago.metodoPago || "Desconocido";
      conteo[metodo] = (conteo[metodo] || 0) + 1;
    });
    setMetodosPago(
      Object.keys(conteo).map((m) => ({
        name: m.charAt(0).toUpperCase() + m.slice(1),
        value: conteo[m],
      })),
    );
  };

  const procesarInventario = (inventario) => {
    setStockInventario(
      inventario.map((item) => ({
        insumo: item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1),
        cantidad: item.stock,
        umbral: item.umbral,
      })),
    );
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="page-stack">
          <DashboardSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="page-section ui-page">
      <div className="page-stack animate-fade-in">
        <FiltrosReportes
          filtroAnio={filtroAnio}
          setFiltroAnio={setFiltroAnio}
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
        />

        <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
          <ResumenCitas data={resumenCitas} />
          <IngresosMensuales
            data={ingresosFacturacion}
            filtroAnio={filtroAnio}
            filtroMes={filtroMes}
          />

          <div className="grid min-w-0 grid-cols-1 gap-5 xl:col-span-2 xl:grid-cols-2 xl:gap-6">
            <MetodosPagoChart data={metodosPago} />

            <div className="flex min-w-0 flex-col gap-5 xl:gap-6">
              <FiltrosInventario
                mostrarSoloBajos={mostrarSoloBajos}
                setMostrarSoloBajos={setMostrarSoloBajos}
              />
              <InventarioTable
                data={stockInventario}
                mostrarSoloBajos={mostrarSoloBajos}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
