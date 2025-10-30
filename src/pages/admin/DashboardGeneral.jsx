import { useEffect, useState } from "react";
import { useCitas } from "../../context/CitasContext";
import ResumenCitas from "../../components/DashboardGeneral/ResumenCitas";
import IngresosMensuales from "../../components/DashboardGeneral/IngresosMensuales";
import MetodosPagoChart from "../../components/DashboardGeneral/MetodosPagoChart";
import InventarioTable from "../../components/DashboardGeneral/InventarioTable";
import FiltrosInventario from "../../components/DashboardGeneral/FiltrosInventario";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";

export default function DashboardGeneral() {
  const { obtenerCitas, obtenerPagos, obtenerInventario, socket } = useCitas();
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [todosLosPagos, setTodosLosPagos] = useState([]);
  const [stockInventario, setStockInventario] = useState([]);
  const [resumenCitas, setResumenCitas] = useState([]);
  const [ingresosFacturacion, setIngresosFacturacion] = useState({});
  const [metodosPago, setMetodosPago] = useState([]);
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [mostrarSoloBajos, setMostrarSoloBajos] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const citasData = await obtenerCitasDesdeContext();
        setTodasLasCitas(citasData);

        const pagosData = await obtenerPagos();
        setTodosLosPagos(pagosData);

        const inventarioData = await obtenerInventario("cosmiatra");
        procesarInventario(inventarioData);
      } catch (err) {
        console.error("Error al cargar dashboard:", err);
      }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("nuevaCita", (cita) => {
      setTodasLasCitas((prev) => [cita, ...prev]);
    });

    socket.on("estadoCitaActualizado", (citaActualizada) => {
      setTodasLasCitas((prev) =>
        prev.map((c) => (c._id === citaActualizada._id ? citaActualizada : c))
      );
    });

    socket.on("nuevoPago", (pago) => {
      setTodosLosPagos((prev) => [pago, ...prev]);
    });

    socket.on("inventarioActualizado", (data) => {
      if (data.action === "agregar") {
        setStockInventario((prev) => [...prev, data.item]);
      } else if (data.action === "eliminar") {
        setStockInventario((prev) =>
          prev.filter((item) => item._id !== data.item._id)
        );
      }
    });

    return () => {
      socket.off("nuevaCita");
      socket.off("estadoCitaActualizado");
      socket.off("nuevoPago");
      socket.off("inventarioActualizado");
    };
  }, [socket]);

  const obtenerCitasDesdeContext = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/citas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok ? await res.json() : [];
  };

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
      }))
    );
  };

  const procesarInventario = (inventario) => {
    setStockInventario(
      inventario.map((item) => ({
        insumo: item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1),
        cantidad: item.stock,
        umbral: item.umbral,
      }))
    );
  };

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <FiltrosReportes
        filtroAnio={filtroAnio}
        setFiltroAnio={setFiltroAnio}
        filtroMes={filtroMes}
        setFiltroMes={setFiltroMes}
      />

      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <ResumenCitas data={resumenCitas} />
          <IngresosMensuales
            data={ingresosFacturacion}
            filtroAnio={filtroAnio}
            filtroMes={filtroMes}
          />

          <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <MetodosPagoChart data={metodosPago} />

            <div className="flex flex-col gap-6">
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
