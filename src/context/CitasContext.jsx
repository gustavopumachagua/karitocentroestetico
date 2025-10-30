import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const CitasContext = createContext();
const API_URL = `${import.meta.env.VITE_API_URL}/api/citas`;
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
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setCitas(res.data);
        return res.data;
      } else {
        console.warn("⚠️ La respuesta no es un array:", res.data);
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
      const token = localStorage.getItem("token");
      const res = await axios.post(API_URL, nuevaCita, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCitas((prev) => [...prev, res.data]);
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

  const API_TRATAMIENTOS = `${import.meta.env.VITE_API_URL}/api/tratamientos`;

  const obtenerTratamientos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_TRATAMIENTOS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setTratamientos(res.data);
      } else {
        console.warn(
          "⚠️ La respuesta de tratamientos no es un array:",
          res.data
        );
        setTratamientos([]);
      }
    } catch (error) {
      console.error("Error al obtener tratamientos:", error);
    }
  };

  const obtenerPagos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/pagos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data)) {
        setPagos(res.data);
        return res.data;
      }
      return [];
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      return [];
    }
  };

  const obtenerInventario = async (rol) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/inventario/${rol}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return Array.isArray(res.data) ? res.data : [];
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
