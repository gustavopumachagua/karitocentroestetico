import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import { useCitas } from "../../context/CitasContext";
import axios from "axios";
import ConfirmationModal from "../../components/Perfil/ConfirmationModal";
import BuscadorPagos from "../../components/GestionPagos/BuscadorPagos";
import TablaPagos from "../../components/GestionPagos/TablaPagos";
import Paginacion from "../../components/HistorialPacientes/Paginacion";
import ModalRegistrarPago from "../../components/GestionPagos/ModalRegistrarPago";

export default function PagosCitas() {
  const { citas, obtenerCitas, modalInfo, setModalInfo } = useCitas();
  const [pagos, setPagos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [serviciosConPrecio, setServiciosConPrecio] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 10;

  useEffect(() => {
    obtenerCitas();
    fetchPagos();

    const socket = io(import.meta.env.VITE_SOCKET_URL);

    socket.on("connect", () => {});

    socket.on("nuevoPago", (pago) => {
      setPagos((prev) => [...prev, pago]);
      setModalInfo({
        show: true,
        message: `💸 Nuevo pago registrado para ${pago.cliente}`,
        type: "success",
      });
    });

    socket.on("disconnect", () => {});

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const suma = serviciosConPrecio.reduce(
      (acc, s) => acc + Number(s.precio || 0),
      0
    );
    setTotal(suma);
  }, [serviciosConPrecio]);

  const todosPreciosValidos = () =>
    serviciosConPrecio.every(
      (s) => s.precio !== "" && !isNaN(s.precio) && Number(s.precio) > 0
    );

  const handlePrecioChange = (index, value) => {
    const nuevos = [...serviciosConPrecio];
    nuevos[index].precio = value;
    setServiciosConPrecio(nuevos);
  };

  const fetchPagos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/pagos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPagos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error obteniendo pagos:", err);
    }
  };

  const pagoPorCita = (citaId) =>
    pagos.find((p) => String(p.cita?._id || p.cita) === String(citaId));

  const citasAtendidas = useMemo(
    () => citas.filter((c) => c.estado === "atendido"),
    [citas]
  );

  const citasFiltradas = useMemo(() => {
    let filtradas = citasAtendidas;
    if (busqueda) {
      filtradas = filtradas.filter((c) =>
        c.cliente.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    return filtradas.sort((a, b) => {
      const estadoA = pagoPorCita(a._id)?.estadoPago || "pendiente";
      const estadoB = pagoPorCita(b._id)?.estadoPago || "pendiente";

      if (estadoA === "pendiente" && estadoB !== "pendiente") return -1;
      if (estadoA !== "pendiente" && estadoB === "pendiente") return 1;

      const fechaA = new Date(a.fechaCita || a.fecha || 0);
      const fechaB = new Date(b.fechaCita || b.fecha || 0);
      return fechaB - fechaA;
    });
  }, [busqueda, citasAtendidas, pagos]);

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const citasPaginadas = citasFiltradas.slice(
    indiceInicio,
    indiceInicio + registrosPorPagina
  );
  const totalPaginas = Math.ceil(citasFiltradas.length / registrosPorPagina);

  const registrarPago = async () => {
    if (!citaSeleccionada || !todosPreciosValidos() || !metodoPago) return;

    const nuevoPago = {
      citaId: citaSeleccionada._id,
      cliente: citaSeleccionada.cliente,
      servicios: serviciosConPrecio.map((s) => ({
        nombre: s.nombre,
        precio: Number(s.precio),
      })),
      metodoPago,
      total: Number(total),
      fecha: new Date(citaSeleccionada.fechaCita || citaSeleccionada.fecha),
    };

    try {
      const token = localStorage.getItem("token");

      await axios.post(`${import.meta.env.VITE_API_URL}/pagos`, nuevoPago, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalInfo({
        show: true,
        message: "✅ Pago registrado exitosamente.",
        type: "success",
      });

      setMostrarFormulario(false);
      fetchPagos();
    } catch (error) {
      console.error("Error registrando pago:", error.response?.data || error);
      setModalInfo({
        show: true,
        message:
          "❌ Ocurrió un error al registrar el pago: " +
          (error.response?.data?.message || "Error desconocido"),
        type: "error",
      });
    }
  };

  return (
    <section className="p-4 sm:p-8 bg-gray-900 min-h-screen text-gray-100">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6 overflow-x-auto">
        <BuscadorPagos
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          citas={citasAtendidas}
        />

        <TablaPagos
          citas={citasPaginadas}
          pagoPorCita={pagoPorCita}
          onSeleccionCita={(cita) => {
            const pago = pagoPorCita(cita._id);
            if (pago?.estadoPago === "pagado") return;
            setCitaSeleccionada(cita);
            setServiciosConPrecio(
              cita.servicio.map((s) => ({ nombre: s, precio: "" }))
            );
            setMetodoPago("");
            setMostrarFormulario(true);
          }}
        />
        {totalPaginas > 1 && (
          <div className="flex justify-center">
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              cambiarPagina={setPaginaActual}
            />
          </div>
        )}
      </div>

      {mostrarFormulario && citaSeleccionada && (
        <ModalRegistrarPago
          citaSeleccionada={citaSeleccionada}
          serviciosConPrecio={serviciosConPrecio}
          metodoPago={metodoPago}
          total={total}
          onPrecioChange={handlePrecioChange}
          onMetodoPagoChange={setMetodoPago}
          onCancelar={() => setMostrarFormulario(false)}
          onRegistrarPago={registrarPago}
          todosPreciosValidos={todosPreciosValidos}
        />
      )}

      <ConfirmationModal
        show={modalInfo.show}
        message={modalInfo.message}
        type={modalInfo.type}
        onClose={() => setModalInfo({ ...modalInfo, show: false })}
      />
    </section>
  );
}
