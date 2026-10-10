import assert from "node:assert/strict";
import test from "node:test";
import { buildServiceReportPatient, getServiceReportDay } from "./serviceReport.js";

test("an appointment at UTC midnight belongs to the preceding Lima day", () => {
  assert.equal(getServiceReportDay({ cita: { fecha: "2026-05-02T00:00:00.000Z" } }), "2026-05-01");
  assert.equal(getServiceReportDay({ fecha: "2026-05-02T00:00:00.000Z" }), "2026-05-02");
  assert.equal(getServiceReportDay({ fecha: "2026-05-01", cita: { fecha: "2026-05-01T23:45:00.000Z" } }), "2026-05-01");
});

test("selecting a pending attendance keeps verified patient contact from the same identity", () => {
  const anchor = { _id: "cita:new", pacienteId: "patient-1", nombre: "El Barbas", cita: { _id: "new", fecha: "2026-05-02T18:00:00Z" } };
  const records = [anchor,
    { _id: "t1", pacienteId: "patient-1", nombre: "El Barbas", fecha: "2026-05-01", sexo: "Masculino", celular: "987654321" },
    { _id: "t2", pacienteId: "patient-2", nombre: "El Barbas", fecha: "2026-05-03", sexo: "Femenino", celular: "912345678" },
  ];
  assert.deepEqual(buildServiceReportPatient(records, anchor), {
    _id: anchor._id, cita: anchor.cita, nombre: "El Barbas", pacienteId: "patient-1", sexo: "Masculino", celular: "987654321",
  });
});

test("empty and unverified operational records never invent demographics", () => {
  assert.deepEqual(buildServiceReportPatient([], {}), {});
  const record = { _id: "cita:one", nombre: "Nuevo", fecha: "2026-05-01" };
  const snapshot = buildServiceReportPatient([record], record);
  assert.equal(snapshot.sexo, null);
  assert.equal(snapshot.celular, null);
});
