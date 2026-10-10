import { getAttentionDate } from "./attentionHistory.js";
import { obtenerFechaCitaEnLima, obtenerTimestampCita } from "./citasFecha.js";
import { getPatientId, getPatientName, isSamePatient } from "./patientIdentity.js";

export function getServiceReportDay(record) {
  const date = getAttentionDate(record);
  // A cita timestamp is an instant, including UTC midnight. Only treatment
  // date-only values retain the older calendar-date compatibility behavior.
  return obtenerFechaCitaEnLima(record?.cita?.fecha ? new Date(date) : date);
}

export function buildServiceReportPatient(records, anchor) {
  const history = (Array.isArray(records) ? records : [])
    .filter((record) => !anchor || isSamePatient(record, anchor))
    .sort((first, second) => obtenerTimestampCita(getAttentionDate(second)) - obtenerTimestampCita(getAttentionDate(first)));
  const latest = history[0];
  if (!latest) return {};
  return {
    _id: latest._id,
    cita: latest.cita,
    nombre: getPatientName(latest),
    pacienteId: getPatientId(latest) || undefined,
    sexo: history.find((record) => record.sexo)?.sexo || null,
    celular: history.find((record) => record.celular)?.celular || null,
  };
}
