import { useState, useEffect } from "react";
import axios from "axios";
import { useCitas } from "../../context/CitasContext";
import { FaArrowLeft } from "react-icons/fa";

import BuscadorClientes from "../../components/ReportesServiciosIngresos/BuscadorClientes";
import ClienteCard from "../../components/ReportesServiciosIngresos/ClienteCard";
import HistorialCliente from "../../components/ReportesServiciosIngresos/HistorialCliente";
import TablaServicios from "../../components/ReportesServiciosIngresos/TablaServicios";
import { calcularMonto } from "../../components/ReportesServiciosIngresos/calcularMonto";

export default function ReportesServiciosIngresos() {
  const { tratamientos, pagos, socket, obtenerPagos, obtenerTratamientos } =
    useCitas();

  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tratamientosCliente, setTratamientosCliente] = useState([]);
  const [serviciosFiltrados, setServiciosFiltrados] = useState([]);

  const hoyStr = new Date().toLocaleDateString("en-CA");
  const [fechaFiltro, setFechaFiltro] = useState(hoyStr);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const obtenerDatosActualizados = (tratamientosCliente) => {
    if (!tratamientosCliente || tratamientosCliente.length === 0) {
      return {};
    }

    const ordenados = [...tratamientosCliente].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    const masReciente = ordenados[0];

    return {
      edad: masReciente.edad || null,
      sexo: masReciente.sexo || null,
      celular: masReciente.celular || null,
    };
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      await obtenerTratamientos();
      await obtenerPagos();
      setLoading(false);
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    if (busqueda.trim() === "") {
      setSugerencias([]);
      return;
    }

    const nombresUnicos = [
      ...new Set(
        tratamientos
          .filter((t) =>
            t.nombre?.toLowerCase().includes(busqueda.toLowerCase())
          )
          .map((t) => t.nombre)
      ),
    ];

    setSugerencias(nombresUnicos);
  }, [busqueda, tratamientos]);

  useEffect(() => {
    if (!tratamientos || tratamientos.length === 0) return;

    const filtrados = tratamientos.filter((t) => {
      const fechaTrat = new Date(t.fecha);
      const fechaLocal = fechaTrat.toLocaleDateString("en-CA");
      return fechaLocal === fechaFiltro;
    });

    setServiciosFiltrados(filtrados);
  }, [fechaFiltro, tratamientos]);

  const buscarCliente = async (nombre) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/api/tratamientos/buscar/${encodeURIComponent(nombre)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const historial = tratamientos.filter(
        (t) => t.nombre.toLowerCase() === nombre.toLowerCase()
      );

      const datosActualizados = obtenerDatosActualizados(historial);

      setClienteSeleccionado({
        ...res.data,
        ...datosActualizados,
      });

      setTratamientosCliente(historial);
    } catch {
      const historial = tratamientos.filter(
        (t) => t.nombre.toLowerCase() === nombre.toLowerCase()
      );

      if (historial.length > 0) {
        const datosActualizados = obtenerDatosActualizados(historial);

        setClienteSeleccionado({
          nombre,
          ...datosActualizados,
        });

        setTratamientosCliente(historial);
      } else {
        setClienteSeleccionado(null);
        setTratamientosCliente([]);
      }
    }

    setSugerencias([]);
    setBusqueda("");
  };

  const totalIngresos = serviciosFiltrados.reduce(
    (acc, t) => acc + calcularMonto(t, pagos),
    0
  );
  const totalHistorial = tratamientosCliente.reduce(
    (acc, t) => acc + calcularMonto(t, pagos),
    0
  );

  const irACita = (tratamiento) => {
    const historial = tratamientos.filter(
      (t) => t.nombre === tratamiento.nombre
    );

    const datosActualizados = obtenerDatosActualizados(historial);

    setClienteSeleccionado({
      nombre: tratamiento.nombre,
      ...datosActualizados,
    });

    setTratamientosCliente(historial);
  };

  useEffect(() => {
    if (!socket) return;

    const handleNuevoPago = (nuevoPago) => {
      obtenerPagos();
    };

    const handleTratamientoActualizado = (data) => {
      obtenerTratamientos();
    };

    socket.on("nuevoPago", handleNuevoPago);
    socket.on("tratamientoActualizado", handleTratamientoActualizado);

    return () => {
      socket.off("nuevoPago", handleNuevoPago);
      socket.off("tratamientoActualizado", handleTratamientoActualizado);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-300">
        <span>Cargando información...</span>
      </div>
    );
  }

  return (
    <section className="p-4 sm:p-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-8 space-y-8">
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
              className="inline-flex items-center gap-2 text-sm text-gray-200 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md border border-gray-600 cursor-pointer transition"
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
          />
        )}
      </div>
    </section>
  );
}
