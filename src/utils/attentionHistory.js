import { getEntityId } from "./professionalDirectory.js";
import { isSamePatient } from "./patientIdentity.js";
import { obtenerTimestampCita } from "./citasFecha.js";

export const isPendingTreatmentRecord = (record) =>
  record?.registroTratamientoPendiente === true ||
  record?.origenRegistro === "cita" ||
  record?.sourceTipo === "cita";

export const getAttentionAppointmentId = (record) =>
  getEntityId(record?.cita) || getEntityId(record?.citaId);

export const getAttentionDate = (record) => record?.cita?.fecha || record?.fecha;

/** Visit identity remains stable when a pending appointment gains a treatment. */
export function isSameAttention(first, second) {
  if (!first || !second) return false;
  const firstId = getEntityId(first);
  if (firstId && firstId === getEntityId(second)) return true;
  const citaId = getAttentionAppointmentId(first);
  return Boolean(citaId) && citaId === getAttentionAppointmentId(second);
}

export function findSelectedAttention(records, selected) {
  return records.find((record) => isSameAttention(record, selected)) || selected;
}

export function getOtherPatientAttentions(records, selected) {
  return records
    .filter((record) => isSamePatient(record, selected) && !isSameAttention(record, selected))
    .sort((first, second) => obtenerTimestampCita(getAttentionDate(second)) - obtenerTimestampCita(getAttentionDate(first)));
}
