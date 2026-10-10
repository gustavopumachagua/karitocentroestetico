/**
 * Storage adapter for the peptide clinical history.
 *
 * The UI deliberately depends on this small interface instead of using
 * localStorage directly. A local copy is scoped to the authenticated user:
 * clinical data must never be visible to a later session on a shared browser.
 */
import { getAuthUser } from "../services/authStorage.js";

export const CLINICAL_HISTORY_STORAGE_PREFIX = "clinical-history:peptides:v2";
const LEGACY_STORAGE_PREFIX = "clinical-history:peptides:v1";
const HISTORY_UPDATED_EVENT = "clinical-history-updated";
const LIMA_TIME_ZONE = "America/Lima";

const getStorage = () => {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getAuthenticatedOwnerId = () => {
  const user = getAuthUser();
  const id = user?.id || user?._id;
  return typeof id === "string" || typeof id === "number" ? String(id).trim() : "";
};

const getOwnerStoragePrefix = (ownerId = getAuthenticatedOwnerId()) => {
  const normalizedOwnerId = String(ownerId || "").trim();
  return normalizedOwnerId
    ? `${CLINICAL_HISTORY_STORAGE_PREFIX}:owner:${encodeURIComponent(normalizedOwnerId)}`
    : "";
};

const getActiveHistoryKey = (ownerId) => {
  const prefix = getOwnerStoragePrefix(ownerId);
  return prefix ? `${prefix}:active` : "";
};

const getAppointmentNotificationsKey = (ownerId) => {
  const prefix = getOwnerStoragePrefix(ownerId);
  return prefix ? `${prefix}:appointment-notifications` : "";
};

const readJson = (key) => {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeJson = (key, value) => {
  const storage = getStorage();
  if (!storage) return false;

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Storage can be unavailable (private mode / full quota). The form must
    // remain usable even when the browser cannot retain a draft.
    console.warn("No se pudo guardar la historia clínica localmente.", error);
    return false;
  }
};

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const compact = (value) => normalize(value).replace(/[^a-z0-9]/g, "");

/**
 * Normalizes a scheduled-control date as a calendar day, rather than as a
 * UTC timestamp. A control scheduled for a Peruvian calendar day must remain
 * visible during that whole day regardless of the browser's timezone.
 */
const getCalendarDay = (value) => {
  if (!value) return "";

  const text = String(value).trim();
  const dateOnly = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LIMA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || "";

  return `${part("year")}-${part("month")}-${part("day")}`;
};

const getTodayCalendarDay = () => getCalendarDay(new Date());

/** True only while a next-control notification is relevant to reception. */
export const isUpcomingAppointmentDate = (value) => {
  const date = getCalendarDay(value);
  return Boolean(date) && date >= getTodayCalendarDay();
};

/**
 * Returns a stable identifier for a treatment/cita whenever one exists. The
 * fallback is intentionally deterministic so drafts also work with legacy
 * records that do not expose an id yet.
 */
export function getClinicalHistoryPatientId(patient) {
  if (!patient) return "";

  const cita = patient.cita;
  const citaId = typeof cita === "object" ? cita?._id || cita?.id : cita;
  const explicitId = citaId || patient._id || patient.id || patient.dni;

  if (explicitId) return String(explicitId);

  // For legacy records without an id, retain the original name as the local
  // key. A clinician may correct the displayed name without losing the draft.
  return [patient.nombreOriginal || patient.nombre, patient.celular, patient.fecha]
    .map(compact)
    .filter(Boolean)
    .join("-");
}

export function getClinicalHistoryStorageKey(patientOrId, ownerId) {
  const id =
    typeof patientOrId === "string"
      ? patientOrId
      : getClinicalHistoryPatientId(patientOrId);
  const prefix = getOwnerStoragePrefix(ownerId);

  return id && prefix ? `${prefix}:${encodeURIComponent(id)}` : "";
}

export function createClinicalHistoryPatientSnapshot(patient) {
  if (!patient) return null;

  const nombre = patient.nombre || patient.cliente || "";

  return {
    _id: patient._id || patient.id || null,
    pacienteId: patient.pacienteId || patient.clienteId || null,
    cita: typeof patient.cita === "object" ? patient.cita?._id || patient.cita?.id : patient.cita || null,
    nombre,
    // Preserve the source kind while caching an appointment that has not
    // yet produced a treatment. Otherwise its `_id` could be sent later as
    // a treatment ID instead of the appointment ID.
    ...(patient.cliente && !patient.cita ? { cliente: nombre } : {}),
    nombreOriginal: patient.nombreOriginal || nombre,
    sexo: patient.sexo || "",
    celular: patient.celular || "",
    dni: patient.dni || patient.pacienteDni || "",
    fecha: patient.fecha || null,
    servicio: patient.servicio || [],
  };
}

const emitUpdated = (record) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(HISTORY_UPDATED_EVENT, { detail: record }),
  );
};

export const CLINICAL_HISTORY_UPDATED_EVENT = HISTORY_UPDATED_EVENT;

const saveUpcomingAppointmentNotification = (record) => {
  const nextAppointment = record?.formData?.proximoControl;
  if (!nextAppointment) return;

  const key = getAppointmentNotificationsKey(record?.ownerId);
  if (!key) return;

  const previous = readJson(key);
  const notifications = Array.isArray(previous) ? previous : [];
  const notification = {
    id: record.patientId,
    patientId: record.patientId,
    patient: record.patient,
    fecha: nextAppointment,
    historyCompletedAt: record.completedAt,
    updatedAt: record.updatedAt,
  };
  const index = notifications.findIndex((item) => item.patientId === record.patientId);
  const updated =
    index === -1
      ? [notification, ...notifications]
      : notifications.map((item, itemIndex) =>
          itemIndex === index ? notification : item,
        );

  writeJson(key, updated);
};

/**
 * Local fallback consumed by the Topbar notification popup until the history
 * API is available. It intentionally returns only upcoming-control metadata,
 * never the patient's full clinical form.
 */
export function getUpcomingAppointmentNotifications() {
  const key = getAppointmentNotificationsKey();
  if (!key) return [];

  const notifications = readJson(key);
  if (!Array.isArray(notifications)) return [];

  // Expired controls are historical information, not actionable reception
  // notifications. Remove only the local notification copy; the completed
  // clinical history itself is deliberately retained.
  const upcoming = notifications.filter((notification) =>
    isUpcomingAppointmentDate(notification?.fecha),
  );

  if (upcoming.length !== notifications.length) {
    writeJson(key, upcoming);
  }

  return upcoming;
}

/** Loads the saved record for one patient/cita, or null when there is none. */
export function loadClinicalHistory(patient) {
  const key = getClinicalHistoryStorageKey(patient);
  if (!key) return null;

  const record = readJson(key);
  if (
    !record ||
    record.version !== 1 ||
    !record.formData ||
    record.ownerId !== getAuthenticatedOwnerId()
  ) {
    return null;
  }

  return record;
}

/** Returns the active draft/record used to recover after navigation or reload. */
export function loadActiveClinicalHistory() {
  const ownerId = getAuthenticatedOwnerId();
  const pointer = readJson(getActiveHistoryKey(ownerId));
  if (!pointer?.key) return null;

  const record = readJson(pointer.key);
  if (
    !record ||
    record.version !== 1 ||
    !record.formData ||
    record.ownerId !== ownerId
  ) {
    return null;
  }

  return record;
}

/**
 * Saves a draft or final record. `status` is deliberately explicit: saving a
 * draft never implies that all clinical sections were completed.
 */
export function saveClinicalHistory({
  patient,
  formData,
  currentStep = 0,
  status = "draft",
  signatureUrl = "",
  completedAt = null,
  createdAt = null,
  updatedAt = null,
  remoteId = null,
}) {
  const patientId = getClinicalHistoryPatientId(patient);
  const ownerId = getAuthenticatedOwnerId();
  const key = getClinicalHistoryStorageKey(patientId, ownerId);
  if (!key || !formData) return null;

  const existing = readJson(key);
  const now = new Date().toISOString();
  const finalStatus = status === "completed" ? "completed" : "draft";
  const record = {
    version: 1,
    ownerId,
    remoteId: remoteId || existing?.remoteId || null,
    patientId,
    patient: createClinicalHistoryPatientSnapshot(patient),
    formData,
    currentStep: Number.isInteger(currentStep) ? currentStep : 0,
    status: finalStatus,
    signatureUrl: signatureUrl || existing?.signatureUrl || "",
    createdAt: createdAt || existing?.createdAt || now,
    updatedAt: updatedAt || now,
    completedAt:
      finalStatus === "completed"
        ? completedAt || existing?.completedAt || now
        : null,
  };

  if (!writeJson(key, record)) return null;

  writeJson(getActiveHistoryKey(ownerId), { key, patientId, updatedAt: now });
  if (finalStatus === "completed") saveUpcomingAppointmentNotification(record);
  emitUpdated(record);
  return record;
}

/** Cache a record retrieved from the API without changing its server dates. */
export function cacheClinicalHistoryRecord(record) {
  if (!record?.patient || !record?.formData) return null;

  return saveClinicalHistory({
    patient: record.patient,
    formData: record.formData,
    currentStep: record.currentStep,
    status: record.status,
    signatureUrl: record.signatureUrl,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    remoteId: record.remoteId,
  });
}

export function getCompletedClinicalHistory(patient) {
  const record = loadClinicalHistory(patient);
  return record?.status === "completed" ? record : null;
}

export function isClinicalHistoryFemale(patient) {
  const sexo = normalize(patient?.sexo);
  return ["f", "femenino", "mujer", "female"].includes(sexo);
}

/** Clears only the active pointer; the saved history remains available. */
export function clearActiveClinicalHistory() {
  const storage = getStorage();
  const key = getActiveHistoryKey();
  if (!storage || !key) return;

  try {
    storage.removeItem(key);
  } catch {
    // noop
  }
}

/**
 * Removes the current user's locally cached clinical information on logout.
 * The server remains the durable source of synchronized histories.
 */
export function clearClinicalHistoryLocalData() {
  const storage = getStorage();
  const ownerId = getAuthenticatedOwnerId();
  const prefix = ownerId
    ? `${getOwnerStoragePrefix(ownerId)}:`
    : `${CLINICAL_HISTORY_STORAGE_PREFIX}:owner:`;
  if (!storage) return;

  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Local storage may be unavailable or blocked by browser privacy settings.
  }
}

/**
 * v1 kept clinical records under global browser keys. Those records cannot be
 * safely assigned to a user, so discard them during the one-time v2 upgrade.
 */
export function purgeLegacyClinicalHistoryStorage() {
  const storage = getStorage();
  if (!storage) return;

  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(`${LEGACY_STORAGE_PREFIX}:`)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // noop
  }
}
