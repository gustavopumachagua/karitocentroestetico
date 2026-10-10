import assert from "node:assert/strict";
import test from "node:test";
import { normalizePatientSuggestions } from "./appointmentPatientSuggestions.js";

const id = (number) => number.toString(16).padStart(24, "0");

test("existing clients retain the immutable source appointment across both roles", () => {
  assert.deepEqual(normalizePatientSuggestions([{ nombre: " El Barbas ", citaPacienteId: id(1) }]),
    [{ nombre: "El Barbas", citaPacienteId: id(1) }]);
});

test("homonymous verified clients do not collapse into a name-only suggestion", () => {
  const suggestions = normalizePatientSuggestions([
    { nombre: "Camila", citaPacienteId: id(1) }, { nombre: "Camila", citaPacienteId: id(2) },
    { nombre: "Camila" }, { nombre: " camila " }, { nombre: "Camila", citaPacienteId: id(1) },
  ]);
  assert.equal(suggestions.length, 3);
  assert.deepEqual(suggestions.map((item) => item.citaPacienteId), [id(1), id(2), undefined]);
});

test("malformed responses and arbitrary patient IDs cannot become source appointments", () => {
  assert.deepEqual(normalizePatientSuggestions(null), []);
  assert.deepEqual(normalizePatientSuggestions([null, {}, { nombre: "" },
    { nombre: "Camila", pacienteId: id(1), citaPacienteId: "not-an-id" }]), [{ nombre: "Camila" }]);
});
