import assert from "node:assert/strict";
import test from "node:test";
import { getPatientId, getPatientKey, isSamePatient } from "./patientIdentity.js";

test("a name correction keeps the same patient across visits", () => {
  const first = { pacienteId: "patient-1", nombre: "Camila", cita: "visit-1" };
  const next = { pacienteId: "patient-1", nombre: "Camila Perez", cita: "visit-2" };
  assert.equal(isSamePatient(first, next), true);
  assert.equal(getPatientKey(first), getPatientKey(next));
});

test("different patient identities never merge because their names match", () => {
  assert.equal(isSamePatient(
    { pacienteId: "patient-1", nombre: "Camila", celular: "999123456" },
    { pacienteId: "patient-2", nombre: "Camila", celular: "999123456" },
  ), false);
});

test("legacy homonyms with conflicting contact information stay separate", () => {
  const first = { nombre: "Camila", celular: "999123456" };
  const second = { nombre: "Camila", celular: "999123457" };
  assert.equal(isSamePatient(first, second), false);
  assert.notEqual(getPatientKey(first), getPatientKey(second));
});

test("matching a known patient to a legacy visit requires contact or source evidence", () => {
  const known = { pacienteId: "patient-1", nombre: "Camila", celular: "+51 999 123 456" };
  assert.equal(isSamePatient(known, { nombre: "Camila" }), false);
  assert.equal(isSamePatient(known, { nombre: "Camila", celular: "999123456" }), true);
  assert.equal(isSamePatient(known, { nombre: "Camila", celular: "999123456", sexo: "femenino" }), true);
});

test("the same linked appointment can refresh a legacy snapshot after a rename", () => {
  assert.equal(isSamePatient(
    { nombre: "Camila", cita: "visit-1" },
    { pacienteId: "patient-1", cliente: "Camila Perez", _id: "visit-1" },
  ), true);
});

test("the clinical document anchor is not mistaken for the global patient identity", () => {
  assert.equal(getPatientId({ patientId: "treatment-1", _id: "treatment-1" }), "");
  assert.equal(getPatientId({ cita: { pacienteId: "patient-1" } }), "patient-1");
});

test("a selected client aggregate follows its first rename through treatment IDs", () => {
  const legacy = { nombre: "Camila", tratamientos: [{ _id: "treatment-1", nombre: "Camila" }] };
  const updated = { pacienteId: "patient-1", nombre: "Camila Perez", tratamientos: [{ _id: "treatment-1", nombre: "Camila Perez" }] };
  assert.equal(isSamePatient(legacy, updated), true);
  assert.equal(isSamePatient(legacy, { ...updated, tratamientos: [{ _id: "treatment-2" }] }), false);
});

test("invalid legacy contact cannot identify a known patient", () => {
  assert.equal(isSamePatient(
    { pacienteId: "patient-1", nombre: "Camila", celular: "1" },
    { nombre: "Camila", celular: "1" },
  ), false);
});
