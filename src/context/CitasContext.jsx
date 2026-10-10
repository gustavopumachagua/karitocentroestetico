import { useCallback, useEffect, useState, useRef } from "react";
import {
  getCitas,
  getProfesionales,
  registrarCita as registrarCitaAPI,
} from "../api/citas.api";
import { getTratamientos } from "../api/tratamientos.api";
import { getPagos } from "../api/pagos.api";
import { getInventario } from "../api/inventario.api";
import {
  AUTH_SESSION_EVENT,
  getAuthSession,
  getAuthToken,
  isAuthStorageKey,
  saveAuthUser,
} from "../services/authStorage";
import { createAuthenticatedSocket } from "../services/realtimeSocket";
import { CitasContext } from "./citas.context";
import { usePatientUpdates } from "../hooks/usePatientUpdates";

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
  const [socket, setSocket] = useState(null);
  const [sessionToken, setSessionToken] = useState(getAuthToken);
  const sessionRef = useRef(getAuthSession());
  const nameSyncSequence = useRef(0);

  const obtenerCitas = useCallback(async () => {
    const requestToken = getAuthToken();
    try {
      const data = await getCitas();
      if (requestToken !== getAuthToken()) return [];

      if (Array.isArray(data)) {
        setCitas(data);
        setCitaSeleccionada((current) =>
          current
            ? data.find((cita) => String(cita._id || cita.id) === String(current._id || current.id)) || current
            : null,
        );
        return data;
      } else {
        console.warn("⚠️ La respuesta no es un array:", data);
        setCitas([]);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
      if (requestToken === getAuthToken() && error.response?.status === 401) {
        setModalInfo({
          show: true,
          message:
            "❌ Sesión expirada o no autorizada. Vuelve a iniciar sesión.",
          type: "error",
        });
      }
      return [];
    }
  }, []);

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

  const obtenerTratamientos = useCallback(async () => {
    const requestToken = getAuthToken();
    try {
      const data = await getTratamientos();
      if (requestToken !== getAuthToken()) return [];

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
  }, []);

  const obtenerPagos = useCallback(async () => {
    const requestToken = getAuthToken();
    try {
      const data = await getPagos();
      if (requestToken !== getAuthToken()) return [];
      if (Array.isArray(data)) {
        setPagos(data);
        return data;
      }
      return [];
    } catch (err) {
      console.error("Error al obtener pagos:", err);
      return [];
    }
  }, []);

  usePatientUpdates(() => {
    void obtenerCitas();
    void obtenerTratamientos();
    void obtenerPagos();
  }, socket);

  const sincronizarNombreActual = useCallback(async () => {
    const requestId = ++nameSyncSequence.current;
    const requestSession = getAuthSession();
    if (!requestSession.token || !requestSession.user) return;

    try {
      const professionals = await getProfesionales();
      const currentSession = getAuthSession();
      if (
        requestId !== nameSyncSequence.current ||
        currentSession.token !== requestSession.token ||
        currentSession.user?.nombre !== requestSession.user?.nombre
      ) return;

      const currentUserId = currentSession.user?.id || currentSession.user?._id;
      const professional = Array.isArray(professionals)
        ? professionals.find((profile) =>
            String(profile.id || profile._id) === String(currentUserId),
          )
        : null;
      if (professional?.nombre && professional.nombre !== currentSession.user?.nombre) {
        saveAuthUser({ ...currentSession.user, nombre: professional.nombre });
      }
    } catch {
      // The stored session stays usable during a temporary network failure.
    }
  }, []);

  useEffect(() => {
    const syncSession = () => {
      const previousSession = sessionRef.current;
      const nextSession = getAuthSession();
      if (
        previousSession.token !== nextSession.token ||
        previousSession.user?.nombre !== nextSession.user?.nombre
      ) {
        nameSyncSequence.current += 1;
      }
      sessionRef.current = nextSession;
      setSessionToken(nextSession.token);

      if (
        nextSession.token &&
        nextSession.token === previousSession.token &&
        nextSession.user?.nombre !== previousSession.user?.nombre
      ) {
        obtenerCitas();
        obtenerTratamientos();
        obtenerPagos();
      }
    };
    const handleStorage = (event) => {
      if (event.key === null || isAuthStorageKey(event.key)) syncSession();
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncSession);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", sincronizarNombreActual);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", sincronizarNombreActual);
    };
  }, [obtenerCitas, obtenerTratamientos, obtenerPagos, sincronizarNombreActual]);

  useEffect(() => {
    // Clear the prior account before loading a new authenticated session.
    setCitas([]);
    setTratamientos([]);
    setPagos([]);
    setCitaSeleccionada(null);
    setModalInfo({ show: false, message: "", type: "info" });

    if (!sessionToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return undefined;
    }

    obtenerCitas();
    obtenerTratamientos();
    obtenerPagos();
    sincronizarNombreActual();

    const connectedSocket = createAuthenticatedSocket({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 60000,
    });

    if (!connectedSocket) return undefined;

    connectedSocket.on("connect", sincronizarNombreActual);
    connectedSocket.on("disconnect", (reason) => {
      console.warn("🔴 Desconectado del servidor Socket.IO:", reason);
    });
    connectedSocket.on("connect_error", (err) => {
      console.error("⚠️ Error de conexión con Socket.IO:", err.message);
    });
    connectedSocket.on("profesionalActualizado", (professional) => {
      const session = getAuthSession();
      if (session.token !== sessionToken) return;
      // An earlier directory response must never undo a newer profile event.
      nameSyncSequence.current += 1;
      const currentUserId = session.user?.id || session.user?._id;
      if (
        professional?.id &&
        String(professional.id) === String(currentUserId) &&
        typeof professional.nombre === "string" &&
        session.user?.nombre !== professional.nombre
      ) {
        // Updating the session also refreshes navigation and the cached data.
        if (saveAuthUser({ ...session.user, nombre: professional.nombre })) return;
      }

      obtenerCitas();
      obtenerTratamientos();
      obtenerPagos();
    });

    socketRef.current = connectedSocket;
    setSocket(connectedSocket);

    return () => {
      nameSyncSequence.current += 1;
      connectedSocket.disconnect();
      if (socketRef.current === connectedSocket) {
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [sessionToken, obtenerCitas, obtenerTratamientos, obtenerPagos, sincronizarNombreActual]);

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
        socket,
      }}
    >
      {children}
    </CitasContext.Provider>
  );
}
