import assert from "node:assert/strict";
import test from "node:test";
import {
  findSelectedAttention,
  getAttentionDate,
  getOtherPatientAttentions,
  isPendingTreatmentRecord,
  isSameAttention,
} from "./attentionHistory.js";
import { formatearFechaCitaParaInput } from "./citasFecha.js";

test("a selected operational appointment is replaced by its real treatment", () => {
  const pending = { _id: "cita:visit-1", citaId: "visit-1", origenRegistro: "cita" };
  const treatment = { _id: "treatment-1", cita: { _id: "visit-1" } };
  const anotherVisit = { _id: "treatment-2", cita: "visit-2" };
  assert.equal(findSelectedAttention([anotherVisit, treatment], pending), treatment);
  assert.equal(isPendingTreatmentRecord(findSelectedAttention([treatment], pending)), false);
  assert.equal(findSelectedAttention([anotherVisit], pending), pending);
});

test("different visits at the same date and time remain in patient history", () => {
  const selected = { _id: "treatment-1", cita: "visit-1", pacienteId: "patient-1", fecha: "2026-05-01T23:45:00Z" };
  const sameTime = { _id: "cita:visit-2", citaId: "visit-2", pacienteId: "patient-1", fecha: selected.fecha };
  const sameVisit = { _id: "cita:visit-1", citaId: "visit-1", pacienteId: "patient-1", fecha: "2026-05-01" };
  const homonym = { ...sameTime, _id: "treatment-3", citaId: "visit-3", pacienteId: "patient-2" };
  assert.deepEqual(getOtherPatientAttentions([selected, sameTime, sameVisit, homonym], selected), [sameTime]);
});

test("visits without an appointment link are compared by their immutable record IDs", () => {
  assert.equal(isSameAttention({ _id: "treatment-1" }, { _id: "treatment-1" }), true);
  assert.equal(isSameAttention({ _id: "treatment-1" }, { _id: "treatment-2" }), false);
  assert.equal(isSameAttention({ fecha: "2026-05-01" }, { fecha: "2026-05-01" }), false);
});

test("operational sources are identified without treating ordinary clinical rows as pending", () => {
  assert.equal(isPendingTreatmentRecord({ registroTratamientoPendiente: true }), true);
  assert.equal(isPendingTreatmentRecord({ origenRegistro: "cita" }), true);
  assert.equal(isPendingTreatmentRecord({ origenRegistro: "tratamiento", registroTratamientoPendiente: false }), false);
});

test("the attended visit displays its Lima date and time independently of browser timezone", () => {
  assert.equal(formatearFechaCitaParaInput("2026-05-01T23:45:00.000Z"), "2026-05-01T18:45");
});

test("an enriched legacy treatment displays the actual linked appointment date", () => {
  const record = { fecha: "2026-05-02T00:00:00.000Z", cita: { _id: "visit-1", fecha: "2026-05-01T23:45:00.000Z" } };
  assert.equal(formatearFechaCitaParaInput(getAttentionDate(record)), "2026-05-01T18:45");
  assert.equal(getAttentionDate({ fecha: "2026-05-02" }), "2026-05-02");
});
