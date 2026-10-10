export const PATIENT_UPDATED_EVENT = "patient:updated";

const getId = (value) => {
  const id = value && typeof value === "object" ? value._id || value.id : value;
  return String(id || "").trim();
};

const normalizeName = (value) =>
  String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es-PE");

const getPhone = (record) => {
  let phone = String(record?.celular || record?.telefono || record?.cita?.celular || "").replace(/\D/g, "");
  if (/^51\d{9}$/.test(phone)) phone = phone.slice(2);
  return /^\d{7,15}$/.test(phone) ? phone : "";
};

const getDni = (record) => {
  const dni = String(record?.dni || record?.pacienteDni || record?.cita?.dni || "").trim();
  return /^\d{8}$/.test(dni) ? dni : "";
};

const getSex = (record) => {
  const value = normalizeName(record?.sexo || record?.cita?.sexo);
  if (["femenino", "mujer", "f"].includes(value)) return "femenino";
  if (["masculino", "hombre", "m"].includes(value)) return "masculino";
  return "";
};

const getAppointmentId = (record) =>
  getId(record?.cita || record?.citaId) ||
  (record?.cliente ? getId(record._id || record.id) : "");

const sharesSourceRecord = (first, second) => {
  // Client-management cards aggregate treatments instead of exposing a
  // source `_id`. Retain those immutable anchors during the first rename,
  // when the selected legacy card does not yet have its patient ID.
  const sourceIds = (record) => [
    getId(record?._id || record?.id),
    ...(record?.tratamientos || []).map((treatment) => getId(treatment?._id || treatment?.id)),
  ].filter(Boolean);
  const firstSourceIds = new Set(sourceIds(first));
  if (sourceIds(second).some((id) => firstSourceIds.has(id))) return true;
  const firstAppointmentId = getAppointmentId(first);
  return Boolean(firstAppointmentId) && firstAppointmentId === getAppointmentId(second);
};

/** The patient ID remains the same across appointments and name corrections. */
export function getPatientId(record) {
  if (!record || typeof record !== "object") return "";

  return (
    getId(record.pacienteId || record.clienteId) ||
    getId(record.paciente?.pacienteId || record.cliente?.pacienteId) ||
    getId(record.cita?.pacienteId || record.cita?.clienteId)
  );
}

export function getPatientName(record) {
  if (typeof record === "string") return record.trim();
  if (!record || typeof record !== "object") return "";

  return String(
    record.nombre ||
      record.paciente?.nombre ||
      (typeof record.cliente === "object" ? record.cliente?.nombre : record.cliente) ||
      (typeof record.cita?.cliente === "object" ? record.cita.cliente?.nombre : record.cita?.cliente) ||
      "",
  ).trim();
}

export function getPatientKey(record) {
  const patientId = getPatientId(record);
  if (patientId) return `patient:${patientId}`;
  const contact = getDni(record) || getPhone(record);
  return `name:${normalizeName(getPatientName(record))}${contact ? `:contact:${contact}` : ""}`;
}

export function isSamePatient(first, second) {
  const firstId = getPatientId(first);
  const secondId = getPatientId(second);
  if (firstId && secondId) return firstId === secondId;
  if (sharesSourceRecord(first, second)) return true;

  const firstName = normalizeName(getPatientName(first));
  if (!firstName || firstName !== normalizeName(getPatientName(second))) return false;

  const firstPhone = getPhone(first);
  const secondPhone = getPhone(second);
  const firstDni = getDni(first);
  const secondDni = getDni(second);
  const firstSex = getSex(first);
  const secondSex = getSex(second);
  if (
    (firstPhone && secondPhone && firstPhone !== secondPhone) ||
    (firstDni && secondDni && firstDni !== secondDni) ||
    (firstSex && secondSex && firstSex !== secondSex)
  ) return false;

  // An identified patient cannot claim a legacy record by display name alone.
  if (firstId || secondId) {
    return Boolean(
      (firstPhone && firstPhone === secondPhone) ||
      (firstDni && firstDni === secondDni),
    );
  }
  return true;
}

/** Inform mounted screens only after the server has saved the new identity. */
export function announcePatientUpdate(patient) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PATIENT_UPDATED_EVENT, { detail: patient }));
}
