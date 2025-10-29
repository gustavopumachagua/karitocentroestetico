import { useEffect, useState } from "react";
import { useCitas } from "../../context/CitasContext";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";
import GraficoCitasPorRol from "../../components/ReportesAvanzados/GraficoCitasPorRol";
import GraficoIngresosComparativos from "../../components/ReportesAvanzados/GraficoIngresosComparativos";
import GraficoServiciosRentables from "../../components/ReportesAvanzados/GraficoServiciosRentables";

export default function ReportesAvanzados() {
  const { obtenerCitas, obtenerPagos, socket } = useCitas();
  const [citas, setCitas] = useState([]);
  const [citasPorRol, setCitasPorRol] = useState({ doctor: [], cosmiatra: [] });
  const [profesionales, setProfesionales] = useState({
    doctor: [],
    cosmiatra: [],
  });
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState({
    doctor: "",
    cosmiatra: "",
  });
  const [ingresosComparativos, setIngresosComparativos] = useState([]);
  const [serviciosRentables, setServiciosRentables] = useState({
    doctor: [],
    cosmiatra: [],
  });
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState("");

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  useEffect(() => {
    const cargarDatos = async () => {
      const citasData = await obtenerCitas();
      const pagos = await obtenerPagos();
      setCitas(citasData);
      const roles = extraerProfesionales(citasData);
      const seleccionInicial = {
        doctor: roles.doctor[0] || "",
        cosmiatra: roles.cosmiatra[0] || "",
      };
      setProfesionalSeleccionado(seleccionInicial);

      procesarCitasPorRol(citasData, seleccionInicial);

      procesarIngresos(pagos);
      procesarServiciosRentables(pagos);
    };
    cargarDatos();
  }, [filtroAnio, filtroMes]);

  useEffect(() => {
    if (!socket) return;

    socket.on("nuevaCita", (cita) => {
      setCitas((prev) => [cita, ...prev]);
      procesarCitasPorRol([cita, ...citas]);
    });

    socket.on("estadoCitaActualizado", (citaActualizada) => {
      const actualizadas = citas.map((c) =>
        c._id === citaActualizada._id ? citaActualizada : c
      );
      setCitas(actualizadas);
      procesarCitasPorRol(actualizadas);
    });

    socket.on("nuevoPago", async () => {
      const pagos = await obtenerPagos();
      procesarIngresos(pagos);
      procesarServiciosRentables(pagos);
    });

    socket.on("tratamientoActualizado", async () => {
      const citasData = await obtenerCitas();
      setCitas(citasData);
      procesarCitasPorRol(citasData);
    });

    return () => {
      socket.off("nuevaCita");
      socket.off("estadoCitaActualizado");
      socket.off("nuevoPago");
      socket.off("tratamientoActualizado");
    };
  }, [socket, citas]);

  const extraerProfesionales = (citas) => {
    const roles = { doctor: new Set(), cosmiatra: new Set() };
    citas.forEach((cita) => {
      if (cita.estado?.toLowerCase() !== "atendido") return;
      const rol = (cita.rol || cita.profesional?.rol || "").toLowerCase();
      const nombre =
        cita.profesional?.nombre || cita.profesional?.email || "Sin nombre";
      if (roles[rol]) roles[rol].add(nombre);
    });

    const result = {
      doctor: Array.from(roles.doctor),
      cosmiatra: Array.from(roles.cosmiatra),
    };

    setProfesionales(result);
    return result;
  };

  const procesarCitasPorRol = (citas, profesionalSeleccionado = {}) => {
    if (!Array.isArray(citas)) return;
    const agrupadas = { doctor: {}, cosmiatra: {} };

    citas.forEach((cita) => {
      if (cita.estado?.toLowerCase() !== "atendido") return;

      const fecha = new Date(cita.fecha);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      if (anio !== Number(filtroAnio)) return;
      if (filtroMes && mes !== Number(filtroMes)) return;

      const rol = (cita.rol || cita.profesional?.rol || "").toLowerCase();
      if (!["doctor", "cosmiatra"].includes(rol)) return;

      const nombre =
        cita.profesional?.nombre || cita.profesional?.email || "Sin nombre";

      const filtroSeleccionado = profesionalSeleccionado[rol];
      if (filtroSeleccionado && filtroSeleccionado !== nombre) return;

      if (!agrupadas[rol][nombre]) agrupadas[rol][nombre] = {};
      const servicios = Array.isArray(cita.servicio)
        ? cita.servicio
        : [cita.servicio];

      servicios.forEach((s) => {
        agrupadas[rol][nombre][s] = (agrupadas[rol][nombre][s] || 0) + 1;
      });
    });

    const parseData = (obj) =>
      Object.entries(obj).map(([nombre, servicios]) => ({
        nombre,
        ...servicios,
      }));

    setCitasPorRol({
      doctor: parseData(agrupadas.doctor),
      cosmiatra: parseData(agrupadas.cosmiatra),
    });
  };

  const procesarIngresos = (pagos) => {
    const mesesOrdenados = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sep",
      "oct",
      "nov",
      "dic",
    ];

    const actual = {};
    const anterior = {};

    pagos.forEach((p) => {
      const fecha = new Date(p.fecha);
      const anio = fecha.getFullYear();
      const mesNumero = fecha.getMonth();
      const mes = mesesOrdenados[mesNumero];

      if (
        anio === Number(filtroAnio) &&
        (!filtroMes || mesNumero + 1 === Number(filtroMes))
      ) {
        actual[mes] = (actual[mes] || 0) + p.total;
      }

      if (
        anio === Number(filtroAnio) - 1 &&
        (!filtroMes || mesNumero + 1 === Number(filtroMes))
      ) {
        anterior[mes] = (anterior[mes] || 0) + p.total;
      }
    });

    const data = mesesOrdenados.map((mes) => ({
      mes,
      [filtroAnio]: actual[mes] || 0,
      [filtroAnio - 1]: anterior[mes] || 0,
    }));

    setIngresosComparativos(data);
  };

  const procesarServiciosRentables = (pagos) => {
    const rentables = { doctor: {}, cosmiatra: {} };
    pagos.forEach((p) => {
      const fecha = new Date(p.fecha);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      if (anio !== Number(filtroAnio)) return;
      if (filtroMes && mes !== Number(filtroMes)) return;
      const rol = p.cita?.profesional?.rol?.toLowerCase() || "otro";
      (p.servicios || []).forEach((s) => {
        rentables[rol][s.nombre] =
          (rentables[rol][s.nombre] || 0) + Number(s.precio);
      });
    });
    const toData = (obj) =>
      Object.entries(obj).map(([name, value]) => ({ name, value }));
    setServiciosRentables({
      doctor: toData(rentables.doctor || {}),
      cosmiatra: toData(rentables.cosmiatra || {}),
    });
  };

  const handleSeleccionProfesional = (rol, nombre) => {
    const nuevoFiltro = { ...profesionalSeleccionado, [rol]: nombre };
    setProfesionalSeleccionado(nuevoFiltro);
    procesarCitasPorRol(citas, nuevoFiltro);
  };

  return (
    <section className="p-6 sm:p-10 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-6 sm:p-8 space-y-10">
        <FiltrosReportes
          filtroAnio={filtroAnio}
          setFiltroAnio={setFiltroAnio}
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <GraficoCitasPorRol
            rol="doctor"
            data={citasPorRol.doctor}
            colores={COLORS}
            profesionales={profesionales.doctor}
            seleccionado={profesionalSeleccionado.doctor}
            onSeleccionar={handleSeleccionProfesional}
          />
          <GraficoCitasPorRol
            rol="cosmiatra"
            data={citasPorRol.cosmiatra}
            colores={COLORS}
            profesionales={profesionales.cosmiatra}
            seleccionado={profesionalSeleccionado.cosmiatra}
            onSeleccionar={handleSeleccionProfesional}
          />
        </div>

        <GraficoIngresosComparativos
          data={ingresosComparativos}
          anio={filtroAnio}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <GraficoServiciosRentables
            rol="doctor"
            data={serviciosRentables.doctor}
            colores={COLORS}
          />
          <GraficoServiciosRentables
            rol="cosmiatra"
            data={serviciosRentables.cosmiatra}
            colores={COLORS}
          />
        </div>
      </div>
    </section>
  );
}
