import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { getCitas, registrarCita as registrarCitaAPI } from "../api/citas.api";
import { getTratamientos } from "../api/tratamientos.api";
import { getPagos } from "../api/pagos.api";
import { getInventario } from "../api/inventario.api";

const CitasContext = createContext();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export function CitasProvider({ children }) {
  const [citas, setCitas] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const socketRef = useRef(null);

  useEffect(() => {
    obtenerCitas();
    obtenerTratamientos();
    obtenerPagos();

    if (!socketRef.current) {
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 60000,
      });

      socket.on("connect", () => {});

      socket.on("disconnect", (reason) => {
        console.warn("🔴 Desconectado del servidor Socket.IO:", reason);
      });

      socket.on("connect_error", (err) => {
        console.error("⚠️ Error de conexión con Socket.IO:", err.message);
      });

      socketRef.current = socket;
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const obtenerCitas = async () => {
    try {
      const data = await getCitas();

      if (Array.isArray(data)) {
        setCitas(data);
        return data;
      } else {
        console.warn("⚠️ La respuesta no es un array:", data);
        setCitas([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
      if (error.response?.status === 401) {
        setModalInfo({
          show: true,
          message:
            "❌ Sesión expirada o no autorizada. Vuelve a iniciar sesión.",
          type: "error",
        });
      }
      return [];
    }
  };

  const registrarCita = async (nuevaCita) => {
    try {
      const res = await registrarCitaAPI(nuevaCita);

      setCitas((prev) => [...prev, res]);
      setModalInfo({
        show: true,
        message: "✅ Cita registrada correctamente",
        type: "success",
      });
    } catch (error) {
      console.error("Error al registrar cita:", error);
      setModalInfo({
        show: true,
        message: "❌ Error al registrar cita",
        type: "error",
      });
    }
  };

  const actualizarEstado = (id, estado) => {
    setCitas((prev) =>
      prev.map((c) => (String(c._id) === String(id) ? { ...c, estado } : c))
    );
  };

  const registrarTratamiento = (nuevoTratamiento) => {
    setTratamientos((prev) => [...prev, nuevoTratamiento]);
  };

  const obtenerTratamientos = async () => {
    try {
      const data = await getTratamientos();

      if (Array.isArray(data)) {
        setTratamientos(data);
        return data;
      } else {
        console.warn(
          "⚠️ La respuesta de tratamientos no es un array:",
          data
        );
        setTratamientos([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener tratamientos:", error);
      return [];
    }
  };

  const obtenerPagos = async () => {
    try {
      const data = await getPagos();
      if (Array.isArray(data)) {
        setPagos(data);
        return data;
      }
      return [];
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      return [];
    }
  };

  const obtenerInventario = async (rol) => {
    try {
      const data = await getInventario(rol);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error al obtener inventario:", err);
      return [];
    }
  };

  return (
    <CitasContext.Provider
      value={{
        citas,
        registrarCita,
        actualizarEstado,
        citaSeleccionada,
        setCitaSeleccionada,
        modalInfo,
        setModalInfo,
        tratamientos,
        setTratamientos,
        registrarTratamiento,
        obtenerTratamientos,
        obtenerCitas,
        obtenerPagos,
        obtenerInventario,
        pagos,
        socket: socketRef.current,
      }}
    >
      {children}
    </CitasContext.Provider>
  );
}

export const useCitas = () => useContext(CitasContext);
