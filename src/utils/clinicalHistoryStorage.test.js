import assert from "node:assert/strict";
import test from "node:test";
import {
  createClinicalHistoryPatientSnapshot,
  getClinicalHistoryPatientId,
  loadClinicalHistory,
  saveClinicalHistory,
} from "./clinicalHistoryStorage.js";

test("cached appointments remain distinguishable from treatments", () => {
  const appointment = createClinicalHistoryPatientSnapshot({ _id: "visit-1", cliente: "Camila", nombre: "Camila Perez" });
  assert.equal(appointment.cliente, "Camila Perez");
  assert.equal(appointment._id, "visit-1");
  assert.equal(appointment.cita, null);
  const treatment = createClinicalHistoryPatientSnapshot({ _id: "treatment-1", nombre: "Camila Perez", cita: "visit-1" });
  assert.equal(treatment.cliente, undefined);
  assert.equal(treatment.cita, "visit-1");
});

test("assigning a patient identity and correcting a name preserves the existing draft key", (t) => {
  const stored = new Map([["user", JSON.stringify({ id: "doctor-1" })]]);
  const originalWindow = globalThis.window;
  const originalEvent = globalThis.CustomEvent;
  globalThis.window = {
    localStorage: {
      getItem: (key) => stored.get(key) || null,
      setItem: (key, value) => stored.set(key, value),
    },
    dispatchEvent() {},
  };
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  t.after(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    if (originalEvent === undefined) delete globalThis.CustomEvent;
    else globalThis.CustomEvent = originalEvent;
  });
  const source = { _id: "treatment-1", nombre: "Camila", nombreOriginal: "Camila", cita: "visit-1" };
  const before = saveClinicalHistory({ patient: source, formData: { nombreCompleto: "Camila", observacion: "Keep answers" } });
  const corrected = { ...source, nombre: "Camila Perez", pacienteId: "patient-1" };
  const after = saveClinicalHistory({ patient: corrected, formData: { ...before.formData, nombreCompleto: "Camila Perez" } });
  assert.equal(before.patientId, after.patientId);
  assert.equal(getClinicalHistoryPatientId(source), getClinicalHistoryPatientId(corrected));
  assert.equal(loadClinicalHistory(source).patient.nombre, "Camila Perez");
  assert.equal(loadClinicalHistory(source).patient.pacienteId, "patient-1");
  assert.equal(loadClinicalHistory(source).formData.observacion, "Keep answers");
  assert.equal([...stored.keys()].filter((key) => key.startsWith("clinical-history:peptides:v2:") && !key.includes(":active")).length, 1);
});
