import {
  getClinicalHistoryPatientId,
  getUpcomingAppointmentNotifications,
  isUpcomingAppointmentDate,
} from "../utils/clinicalHistoryStorage";
import { fetchUpcomingClinicalControls } from "../utils/clinicalHistoryRemote";

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const getId = (value) => {
  if (value && typeof value === "object") return value._id || value.id || "";
  return value || "";
};

const getCalendarDate = (value) => String(value || "").slice(0, 10);

const getNotificationKey = (notification) => {
  const patient = notification?.patient || notification?.paciente || {};
  const patientId = notification?.patientId || notification?.pacienteId;
  const citaId =
    notification?.citaId || getId(notification?.cita) || getId(patient?.cita);

  return String(
    patientId ||
      citaId ||
      notification?.id ||
      getClinicalHistoryPatientId(patient) ||
      `${patient?.nombre || "paciente"}-${getCalendarDate(notification?.fecha)}`,
  );
};

const getNotificationCitaId = (notification) => {
  const patient = notification?.patient || notification?.paciente || {};
  return String(
    notification?.citaId || getId(notification?.cita) || getId(patient?.cita) || "",
  );
};

const asServiceList = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => asServiceList(item));
  }

  if (value && typeof value === "object") {
    return asServiceList(value.nombre || value.name || value.servicio || "");
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const getAppointmentForNotification = (notification, appointments) => {
  const citaId = getNotificationCitaId(notification);
  const patientName = normalizeText(
    notification?.patient?.nombre || notification?.paciente?.nombre,
  );

  return (appointments || []).find((appointment) => {
    const appointmentId = String(getId(appointment) || "");
    if (citaId && appointmentId === citaId) return true;

    return Boolean(patientName) && normalizeText(appointment?.cliente) === patientName;
  });
};

/**
 * Returns a readable service label using the history snapshot first and the
 * linked appointment as a fallback. The clinical-history endpoint purposely
 * exposes a minimal patient snapshot, so this join keeps it minimal too.
 */
export function getClinicalControlService(notification, appointments = []) {
  const appointment = getAppointmentForNotification(notification, appointments);
  const services = [
    notification?.servicio,
    notification?.service,
    notification?.patient?.servicio,
    notification?.patient?.service,
    notification?.paciente?.servicio,
    appointment?.servicio,
    appointment?.service,
  ].flatMap((value) => asServiceList(value));

  const uniqueServices = [...new Set(services.map((item) => item.trim()))];
  return uniqueServices.join(", ") || "Servicio por confirmar";
}

const compareUpdatedAt = (first, second) =>
  String(first?.updatedAt || first?.historyCompletedAt || "").localeCompare(
    String(second?.updatedAt || second?.historyCompletedAt || ""),
  );

/**
 * Merges the resilient local copy with the authoritative API feed. A
 * notification is represented once per patient/appointment even if both
 * sources know about it.
 */
export function mergeClinicalControlNotifications(
  localNotifications = [],
  remoteNotifications = [],
  appointments = [],
) {
  const merged = new Map();

  [...localNotifications, ...remoteNotifications]
    .filter((notification) => isUpcomingAppointmentDate(notification?.fecha))
    .forEach((notification) => {
      const id = getNotificationKey(notification);
      const previous = merged.get(id);

      if (!previous || compareUpdatedAt(notification, previous) >= 0) {
        merged.set(id, {
          ...notification,
          id,
          patientId: notification?.patientId || id,
          citaId: getNotificationCitaId(notification),
          patient: notification?.patient || notification?.paciente || {},
        });
      }
    });

  return [...merged.values()]
    .map((notification) => ({
      ...notification,
      servicio: getClinicalControlService(notification, appointments),
    }))
    .sort((first, second) =>
      getCalendarDate(first.fecha).localeCompare(getCalendarDate(second.fecha)),
    );
}

/**
 * Reads actionable controls. Local data makes the reception experience work
 * offline; the server data is merged when it is available for cross-session
 * notification delivery.
 */
export async function getClinicalControlNotifications(appointments = []) {
  const localNotifications = getUpcomingAppointmentNotifications();
  let remoteNotifications = [];

  try {
    remoteNotifications = await fetchUpcomingClinicalControls();
  } catch {
    // A local pending control is still useful if the API is temporarily down.
    // The caller intentionally receives no transport error for this fallback.
  }

  return mergeClinicalControlNotifications(
    localNotifications,
    remoteNotifications,
    appointments,
  );
}

export function formatClinicalControlDate(value) {
  const calendarDate = getCalendarDate(value);
  if (!calendarDate) return "Fecha pendiente";

  const date = new Date(`${calendarDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return calendarDate;

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
