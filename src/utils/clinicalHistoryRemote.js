import {
  guardarHistoriaClinica,
  obtenerHistoriaClinica,
  obtenerProximosControles,
} from "../api/historiasClinicas.api";
import {
  createClinicalHistoryPatientSnapshot,
  getClinicalHistoryPatientId,
} from "./clinicalHistoryStorage";
import { announcePatientUpdate } from "./patientIdentity";

const getId = (value) => {
  if (value && typeof value === "object") return value._id || value.id || "";
  return value || "";
};

/**
 * A treatment and an appointment both have an `_id`, but they are different
 * aggregates in the backend. This adapter keeps that distinction explicit so
 * a treatment id is never accidentally sent as a cita id.
 */
export function getClinicalHistoryIdentity(patient) {
  const citaId = getId(patient?.cita);
  const directId = getId(patient?._id || patient?.id);
  // A cita uses `cliente`, whereas a treatment uses `nombre`. The form also
  // normalizes a cita to expose `nombre` for its fields, so do not use the
  // absence of that normalized value to infer its durable identity.
  const isAppointmentRecord = Boolean(patient?.cliente && !patient?.cita);
  const nombre = patient?.nombre || patient?.cliente || "";
  const nombreOriginal = patient?.nombreOriginal || nombre;
  const celular = patient?.celular || patient?.telefono || "";
  const pacienteId = getId(patient?.pacienteId || patient?.clienteId);

  return {
    ...(citaId || isAppointmentRecord
      ? { citaId: citaId || directId }
      : directId
        ? { tratamientoId: directId }
        : {}),
    pacienteNombre: nombre,
    // The original value is only used to resolve legacy records that do not
    // have a cita/tratamiento id. The editable name above remains the value
    // to persist as the patient's current identity.
    pacienteNombreOriginal: nombreOriginal,
    // Keep this scalar for GET query serialization. The backend only uses it
    // to safely recognize a finalized history from the same returning
    // patient; it never turns a name-only match into a clinical record.
    pacienteCelular: celular,
    paciente: {
      nombre,
      nombreOriginal,
      ...(pacienteId ? { pacienteId } : {}),
      sexo: patient?.sexo || "",
      celular,
      dni: patient?.dni || patient?.pacienteDni || "",
    },
  };
}

export function toLocalClinicalHistoryRecord(history, fallbackPatient = {}) {
  if (!history) return null;

  const formData = history.formData || history.datosFormulario || {};
  const remotePatient = history.paciente || history.patient || {};
  const patient = {
    ...createClinicalHistoryPatientSnapshot(fallbackPatient),
    ...remotePatient,
    pacienteId: getId(history.pacienteId || remotePatient.pacienteId || fallbackPatient?.pacienteId) || null,
    cita: getId(history.citaId || history.cita) || fallbackPatient?.cita || null,
    sexo: formData.sexo || remotePatient.sexo || fallbackPatient?.sexo || "",
    nombreOriginal:
      fallbackPatient?.nombreOriginal || fallbackPatient?.nombre || remotePatient.nombre || "",
  };
  const completed = ["finalized", "finalizada", "completed"].includes(
    String(history.status || history.estado || "").toLowerCase(),
  );

  return {
    version: 1,
    remoteId: history._id || history.id || null,
    patientId: getClinicalHistoryPatientId(patient),
    patient,
    formData,
    currentStep: Number.isInteger(history.currentStep)
      ? history.currentStep
      : Number.isInteger(history.pasoActual)
        ? history.pasoActual
        : 0,
    status: completed ? "completed" : "draft",
    signatureUrl:
      history.signatureUrl || history.firmaMedico?.url || "",
    createdAt: history.createdAt || new Date().toISOString(),
    updatedAt: history.updatedAt || history.createdAt || new Date().toISOString(),
    completedAt: history.completedAt || history.finalizadaEn || null,
  };
}

/** Persist the locally resilient record in the API without leaking API shape. */
export async function syncClinicalHistory(record) {
  const { historia: history, pacienteActualizado } = await guardarHistoriaClinica({
    // The server-issued history id remains stable after a display-name
    // correction and is the safe migration anchor for old unlinked records.
    historiaId: record?.remoteId || undefined,
    ...getClinicalHistoryIdentity(record?.patient),
    formData: record?.formData,
    currentStep: record?.currentStep || 0,
    status: record?.status === "completed" ? "finalized" : "draft",
  });

  const synchronizedRecord = toLocalClinicalHistoryRecord(history, record?.patient);
  if (synchronizedRecord) synchronizedRecord.patientUpdate = pacienteActualizado;
  if (synchronizedRecord?.patient?.pacienteId) {
    announcePatientUpdate({
      pacienteId: synchronizedRecord.patient.pacienteId,
      nombre: synchronizedRecord.patient.nombre,
      nombreAnterior: record?.patient?.nombreOriginal || "",
    });
  }
  return synchronizedRecord;
}

export async function fetchClinicalHistory(patient) {
  const history = await obtenerHistoriaClinica(getClinicalHistoryIdentity(patient));
  return toLocalClinicalHistoryRecord(history, patient);
}

/** Maps the reception-oriented API response to the notification card shape. */
export async function fetchUpcomingClinicalControls() {
  const controls = await obtenerProximosControles();
  if (!Array.isArray(controls)) return [];

  return controls
    .filter((control) => control?.proximoControl)
    .map((control) => {
      const cita = control.cita || control.citaId || null;
      const citaId = String(getId(cita) || "");

      return {
        id: String(control._id || control.historiaId),
        cita,
        citaId,
        patientId: citaId || getClinicalHistoryPatientId(control.paciente || {}),
        patient: control.paciente || {},
        servicio: cita && typeof cita === "object" ? cita.servicio || [] : [],
        fecha: String(control.proximoControl).slice(0, 10),
        historyCompletedAt: control.finalizadaEn || null,
        updatedAt: control.updatedAt || control.finalizadaEn || control.createdAt || null,
      };
    });
}
