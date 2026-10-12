import { useCallback, useEffect, useRef, useState } from "react";
import { useCitas } from "../../hooks/useCitas";
import FiltrosReportes from "../../components/DashboardDoctor/FiltrosReportes";
import GraficoCitasPorRol from "../../components/ReportesAvanzados/GraficoCitasPorRol";
import GraficoIngresosComparativos from "../../components/ReportesAvanzados/GraficoIngresosComparativos";
import GraficoServiciosRentables from "../../components/ReportesAvanzados/GraficoServiciosRentables";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";
import { CHART_COLORS } from "../../components/DashboardDoctor/chartTheme";
import {
  getProfessionalDisplayName,
  getProfessionalId,
  getProfessionalRole,
} from "../../utils/professionalDirectory";

const normalizarNombre = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("es-PE");

function obtenerIdentidadProfesional(cita, professionalNamesById) {
  const id = getProfessionalId(cita);
  const nombre =
    getProfessionalDisplayName(cita, professionalNamesById) || "Sin nombre";

  return {
    // The id is the grouping and filter key. A legacy row without it keeps a
    // separate, explicit fallback until the server can reconcile it safely.
    clave: id || `legacy:${normalizarNombre(nombre) || "sin-nombre"}`,
    nombre,
  };
}

function conservarSeleccion(profesionales, seleccionActual) {
  return Object.fromEntries(
    Object.entries(profesionales).map(([rol, opciones]) => [
      rol,
      opciones.some((opcion) => opcion.value === seleccionActual[rol])
        ? seleccionActual[rol]
        : opciones[0]?.value || "",
    ]),
  );
}

export default function ReportesAvanzados() {
  const { obtenerCitas, obtenerPagos, socket } = useCitas();
  const { professionalNamesById } = useProfessionalDirectory();
  const obtenerCitasRef = useRef(obtenerCitas);
  const obtenerPagosRef = useRef(obtenerPagos);
  const citasRef = useRef([]);
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
  const seleccionRef = useRef(profesionalSeleccionado);
  const [ingresosComparativos, setIngresosComparativos] = useState([]);
  const [serviciosRentables, setServiciosRentables] = useState({
    doctor: [],
    cosmiatra: [],
  });
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState("");

  const COLORS = CHART_COLORS;

  useEffect(() => {
    obtenerCitasRef.current = obtenerCitas;
    obtenerPagosRef.current = obtenerPagos;
  }, [obtenerCitas, obtenerPagos]);

  useEffect(() => {
    citasRef.current = citas;
  }, [citas]);

  useEffect(() => {
    seleccionRef.current = profesionalSeleccionado;
  }, [profesionalSeleccionado]);

  const extraerProfesionales = useCallback((citas) => {
    const roles = { doctor: new Map(), cosmiatra: new Map() };
    citas.forEach((cita) => {
      if (cita.estado?.toLowerCase() !== "atendido") return;
      const rol = getProfessionalRole(cita);
      if (!roles[rol]) return;

      const profesional = obtenerIdentidadProfesional(
        cita,
        professionalNamesById,
      );
      roles[rol].set(profesional.clave, {
        value: profesional.clave,
        label: profesional.nombre,
      });
    });

    const result = {
      doctor: Array.from(roles.doctor.values()),
      cosmiatra: Array.from(roles.cosmiatra.values()),
    };

    setProfesionales(result);
    return result;
  }, [professionalNamesById]);

  const procesarCitasPorRol = useCallback((citas, profesionalSeleccionado = {}) => {
    if (!Array.isArray(citas)) return;
    const agrupadas = { doctor: new Map(), cosmiatra: new Map() };

    citas.forEach((cita) => {
      if (cita.estado?.toLowerCase() !== "atendido") return;

      const fecha = new Date(cita.fecha);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      if (anio !== Number(filtroAnio)) return;
      if (filtroMes && mes !== Number(filtroMes)) return;

      const rol = getProfessionalRole(cita);
      if (!["doctor", "cosmiatra"].includes(rol)) return;

      const profesional = obtenerIdentidadProfesional(
        cita,
        professionalNamesById,
      );

      const filtroSeleccionado = profesionalSeleccionado[rol];
      if (
        filtroSeleccionado &&
        filtroSeleccionado !== profesional.clave
      ) {
        return;
      }

      if (!agrupadas[rol].has(profesional.clave)) {
        agrupadas[rol].set(profesional.clave, {
          nombre: profesional.nombre,
          servicios: {},
        });
      }

      const serviciosPorProfesional = agrupadas[rol].get(profesional.clave);
      const servicios = Array.isArray(cita.servicio)
        ? cita.servicio
        : [cita.servicio];

      servicios.forEach((s) => {
        if (!s) return;
        serviciosPorProfesional.servicios[s] =
          (serviciosPorProfesional.servicios[s] || 0) + 1;
      });
    });

    const parseData = (obj) =>
      Array.from(obj.values()).map(({ nombre, servicios }) => ({
        nombre,
        ...servicios,
      }));

    setCitasPorRol({
      doctor: parseData(agrupadas.doctor),
      cosmiatra: parseData(agrupadas.cosmiatra),
    });
  }, [filtroAnio, filtroMes, professionalNamesById]);

  const procesarIngresos = useCallback((pagos) => {
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
  }, [filtroAnio, filtroMes]);

  const procesarServiciosRentables = useCallback((pagos) => {
    const rentables = { doctor: {}, cosmiatra: {} };
    pagos.forEach((p) => {
      const fecha = new Date(p.fecha);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      if (anio !== Number(filtroAnio)) return;
      if (filtroMes && mes !== Number(filtroMes)) return;
      const rol = getProfessionalRole(p.cita || p);
      if (!rentables[rol]) return;
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
  }, [filtroAnio, filtroMes]);

  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      const [citasData, pagos] = await Promise.all([
        obtenerCitasRef.current(),
        obtenerPagosRef.current(),
      ]);

      if (!activo) return;

      citasRef.current = citasData;
      setCitas(citasData);
      const roles = extraerProfesionales(citasData);
      const seleccionInicial = conservarSeleccion(roles, seleccionRef.current);
      seleccionRef.current = seleccionInicial;
      setProfesionalSeleccionado(seleccionInicial);

      procesarCitasPorRol(citasData, seleccionInicial);
      procesarIngresos(pagos);
      procesarServiciosRentables(pagos);
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [
    extraerProfesionales,
    procesarCitasPorRol,
    procesarIngresos,
    procesarServiciosRentables,
  ]);

  useEffect(() => {
    if (!socket) return undefined;

    let activo = true;
    const actualizarCitas = (citasActualizadas) => {
      citasRef.current = citasActualizadas;
      setCitas(citasActualizadas);
      const roles = extraerProfesionales(citasActualizadas);
      const siguienteSeleccion = conservarSeleccion(roles, seleccionRef.current);
      seleccionRef.current = siguienteSeleccion;
      setProfesionalSeleccionado(siguienteSeleccion);
      procesarCitasPorRol(citasActualizadas, siguienteSeleccion);
    };

    const handleNuevaCita = (cita) => {
      actualizarCitas([cita, ...citasRef.current]);
    };

    const handleEstadoCitaActualizado = (citaActualizada) => {
      const actualizadas = citasRef.current.map((cita) =>
        cita._id === citaActualizada._id ? citaActualizada : cita,
      );
      actualizarCitas(actualizadas);
    };

    const handleNuevoPago = async () => {
      const pagos = await obtenerPagosRef.current();
      if (!activo) return;

      procesarIngresos(pagos);
      procesarServiciosRentables(pagos);
    };

    const handleTratamientoActualizado = async () => {
      const citasData = await obtenerCitasRef.current();
      if (!activo) return;

      actualizarCitas(citasData);
    };

    socket.on("nuevaCita", handleNuevaCita);
    socket.on("estadoCitaActualizado", handleEstadoCitaActualizado);
    socket.on("nuevoPago", handleNuevoPago);
    socket.on("tratamientoActualizado", handleTratamientoActualizado);

    return () => {
      activo = false;
      socket.off("nuevaCita", handleNuevaCita);
      socket.off("estadoCitaActualizado", handleEstadoCitaActualizado);
      socket.off("nuevoPago", handleNuevoPago);
      socket.off("tratamientoActualizado", handleTratamientoActualizado);
    };
  }, [
    socket,
    extraerProfesionales,
    procesarCitasPorRol,
    procesarIngresos,
    procesarServiciosRentables,
  ]);

  const handleSeleccionProfesional = (rol, profesionalId) => {
    const nuevoFiltro = { ...profesionalSeleccionado, [rol]: profesionalId };
    seleccionRef.current = nuevoFiltro;
    setProfesionalSeleccionado(nuevoFiltro);
    procesarCitasPorRol(citas, nuevoFiltro);
  };

  return (
    <section className="page-section ui-page">
      <div className="page-stack">
        <FiltrosReportes
          filtroAnio={filtroAnio}
          setFiltroAnio={setFiltroAnio}
          filtroMes={filtroMes}
          setFiltroMes={setFiltroMes}
        />

        <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
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

        <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
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
