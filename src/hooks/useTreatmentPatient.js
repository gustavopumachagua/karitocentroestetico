import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { obtenerPacientePorCita } from "../api/tratamientos.api";
import { getAuthSession } from "../services/authStorage";

function matchesSession(token, actorId) {
  const current = getAuthSession();
  return current.token === token && String(current.user?.id || current.user?._id || "") === actorId;
}

function failureMessage(error) {
  const status = error?.response?.status;
  if (status === 401) return "Tu sesión venció. Inicia sesión de nuevo antes de registrar la atención.";
  if (status === 403) return "No tienes permiso para consultar los datos de esta cita.";
  if (status === 404) return "La cita ya no está disponible. Actualiza la agenda y vuelve a seleccionarla.";
  return "No se pudieron recuperar los datos del paciente. Reintenta la consulta antes de registrar la atención.";
}

/** A patient's intake fields must never survive a change of appointment/account. */
export function useTreatmentPatient(citaId) {
  const { token, user } = useAuth();
  const actorId = String(user?.id || user?._id || "");
  const key = `${token || ""}:${actorId}:${citaId || ""}`;
  const currentKey = useRef(key);
  currentKey.current = key;
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState({ key: "", status: "loading", patient: null, error: "" });
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!token || !actorId || !citaId || !matchesSession(token, actorId)) return undefined;
    const controller = new AbortController();
    const isCurrent = () => !controller.signal.aborted && currentKey.current === key && matchesSession(token, actorId);
    setView({ key, status: "loading", patient: null, error: "" });
    obtenerPacientePorCita(citaId, { signal: controller.signal }).then((patient) => {
      if (!isCurrent()) return;
      if (!patient || typeof patient.nombre !== "string" || typeof patient.sexo !== "string" || typeof patient.celular !== "string") {
        throw new Error("La respuesta del paciente no es válida.");
      }
      setView({ key, status: "ready", patient: {
        nombre: patient.nombre,
        pacienteId: patient.pacienteId || null,
        sexo: patient.sexo,
        celular: patient.celular,
      }, error: "" });
    }).catch((error) => {
      if (isCurrent()) {
        setView({ key, status: "error", patient: null, error: failureMessage(error) });
      }
    });
    return () => controller.abort();
  }, [actorId, attempt, citaId, key, token]);

  if (!token || !actorId || !citaId) {
    return { status: "error", patient: null, error: "Selecciona una cita de tu cuenta para recuperar los datos del paciente.", retry };
  }
  if (!matchesSession(token, actorId)) {
    return { status: "error", patient: null, error: "La sesión cambió. Vuelve a abrir la atención desde tu cuenta actual.", retry };
  }
  const current = view.key === key ? view : { status: "loading", patient: null, error: "" };
  return { status: current.status, patient: current.patient, error: current.error, retry };
}
