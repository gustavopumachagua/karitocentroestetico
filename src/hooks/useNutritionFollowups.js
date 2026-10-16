import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerSeguimientosAlimentarios } from "../api/planesAlimentarios.api";
import { useAuth } from "./useAuth";
import { PATIENT_UPDATED_EVENT } from "../utils/patientIdentity";

/** Separate read model: never loads a doctor's clinical history or treatments. */
export function useNutritionFollowups(socket) {
  const { token, user, rol } = useAuth();
  const actorId = String(user?.id || user?._id || "");
  const session = `${token || ""}:${actorId}`;
  const currentSession = useRef(session);
  currentSession.current = session;
  const request = useRef(0);
  const controller = useRef(null);
  const [view, setView] = useState({ session: "", entries: [], loading: true, error: "" });

  const refresh = useCallback(async () => {
    if (!token || rol !== "cosmiatra") return;
    const sequence = ++request.current;
    controller.current?.abort();
    const nextController = new AbortController();
    controller.current = nextController;
    setView((previous) => ({ session, entries: previous.session === session ? previous.entries : [], loading: true, error: "" }));
    try {
      const entries = await obtenerSeguimientosAlimentarios({ signal: nextController.signal, expectedSession: { token, actorId } });
      if (!nextController.signal.aborted && sequence === request.current && currentSession.current === session) {
        setView({ session, entries: Array.isArray(entries) ? entries : [], loading: false, error: "" });
      }
    } catch {
      if (!nextController.signal.aborted && sequence === request.current && currentSession.current === session) {
        setView((previous) => ({ ...previous, session, loading: false, error: "No se pudieron cargar los seguimientos alimentarios. Puedes volver a intentarlo." }));
      }
    }
  }, [actorId, rol, session, token]);

  const cancelRequests = useCallback(() => {
    request.current += 1;
    controller.current?.abort();
  }, []);

  useEffect(() => {
    void refresh();
    const onRefresh = () => { void refresh(); };
    window.addEventListener("focus", onRefresh);
    window.addEventListener(PATIENT_UPDATED_EVENT, onRefresh);
    const events = ["historiaClinicaFinalizada", "pacienteActualizado", "planAlimentarioActualizado"];
    events.forEach((event) => socket?.on(event, onRefresh));
    const interval = window.setInterval(onRefresh, 60_000);
    return () => {
      cancelRequests();
      window.clearInterval(interval);
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener(PATIENT_UPDATED_EVENT, onRefresh);
      events.forEach((event) => socket?.off(event, onRefresh));
    };
  }, [cancelRequests, refresh, socket]);

  return { ...(view.session === session ? view : { entries: [], loading: true, error: "" }), refresh };
}
