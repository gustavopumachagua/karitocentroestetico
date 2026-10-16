import assert from "node:assert/strict";
import test from "node:test";
import {
  fillTreatmentPatient,
  getTreatmentAppointmentId,
  normalizeTreatmentSex,
  selectTreatmentAppointment,
} from "./treatmentAppointment.js";

const now = new Date("2026-10-15T12:00:00.000Z").getTime();
const first = { _id: "111111111111111111111111", fecha: "2026-10-15 11:00:00", cliente: "Ana" };
const second = { _id: "222222222222222222222222", fecha: "2026-10-15T12:15:00.000Z", cliente: "Bea" };

test("appointment identity accepts _id and legacy id, never the patient's name", () => {
  assert.equal(getTreatmentAppointmentId(first), first._id);
  assert.equal(getTreatmentAppointmentId({ id: "legacy" }), "legacy");
  assert.equal(getTreatmentAppointmentId({ _id: "current", id: "legacy" }), "current");
  assert.equal(getTreatmentAppointmentId({ cliente: "Ana" }), "");
  assert.equal(getTreatmentAppointmentId(null), "");
});

test("preserves the explicitly selected eligible appointment using its Mongo id", () => {
  const updatedFirst = { ...first, cliente: "Ana Pérez" };
  assert.equal(selectTreatmentAppointment([updatedFirst, second], first, now), updatedFirst);
});

test("a removed or ineligible selection falls back to the nearest valid visit", () => {
  assert.equal(selectTreatmentAppointment([first, second], { _id: "foreign" }, now), second);
  assert.equal(selectTreatmentAppointment([first, second], null, now), second);
  assert.equal(selectTreatmentAppointment([], first, now), null);
  assert.equal(selectTreatmentAppointment(null, first, now), null);
});

test("malformed dates and rows without ids cannot displace a valid appointment", () => {
  const invalid = { _id: "invalid-date", fecha: "not a date" };
  assert.equal(selectTreatmentAppointment([invalid, second, { fecha: second.fecha }], null, now), second);
  assert.equal(selectTreatmentAppointment([{ fecha: second.fecha }], null, now), null);
});

test("normalizes persisted sex without blocking an unknown or missing value", () => {
  for (const value of ["Femenino", "femenino", " Mujer ", "F", "female"]) {
    assert.equal(normalizeTreatmentSex(value), "Femenino");
  }
  for (const value of ["Masculino", "masculino", " Hombre ", "M", "male"]) {
    assert.equal(normalizeTreatmentSex(value), "Masculino");
  }
  for (const value of [undefined, null, "", "sin datos"]) assert.equal(normalizeTreatmentSex(value), "");
});

test("fills stored demographics while preserving locally entered values", () => {
  const form = { nombre: "Ana", sexo: "", celular: "", observacion: "Sin molestias", insumos: ["Guantes"] };
  const patient = { nombre: "Ana Pérez", sexo: "femenino", celular: "999111222" };
  const filled = fillTreatmentPatient(form, patient);
  assert.deepEqual(filled, { ...form, nombre: "Ana Pérez", sexo: "Femenino", celular: "999111222" });
  assert.equal(form.celular, "");
  assert.deepEqual(fillTreatmentPatient({ ...form, sexo: "Masculino", celular: "988777666" }, patient), {
    ...form, nombre: "Ana Pérez", sexo: "Masculino", celular: "988777666",
  });
  assert.equal(fillTreatmentPatient(form, null), form);
});

test("an unverified new visit with no stored patient leaves blank demographics editable", () => {
  const form = { nombre: "Nueva paciente", sexo: "", celular: "", observacion: "", insumos: [] };
  assert.deepEqual(fillTreatmentPatient(form, { nombre: "Nueva paciente", pacienteId: null, sexo: "", celular: "" }), form);
});
