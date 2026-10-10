import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { isSamePatient } from "../../utils/patientIdentity.js";
import { isPendingTreatmentRecord } from "../../utils/attentionHistory.js";

// Exercise the actual calculation module without adding a JSX test loader.
const source = readFileSync(new URL("./calcularMonto.jsx", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace(/export const /g, "const ");
const { calcularMonto, calcularTotalAtenciones, obtenerPagoRelacionado } = runInNewContext(
  `${source}\n({ calcularMonto, calcularTotalAtenciones, obtenerPagoRelacionado });`,
  { isSamePatient, isPendingTreatmentRecord },
);
const pending = { _id: "cita:one", nombre: "El Barbas", pacienteId: "p1", cita: { _id: "one" },
  servicio: ["mascarilla facial personalizada"], registroTratamientoPendiente: true };
const receipt = { _id: "pay1", cita: "one", cliente: "El Barbas", pacienteId: "p1", total: 120, estadoPago: "pagado" };

test("an attendance without treatment uses only its exact paid receipt, not invented prices", () => {
  const row = { ...pending, total: 999, servicio: [{ nombre: "mascarilla facial personalizada", precio: 999 }] };
  const other = { ...receipt, _id: "pay2", cita: "two", total: 500 };
  assert.equal(calcularMonto(row, [other, receipt]), 120);
  assert.equal(obtenerPagoRelacionado(row, [other, receipt]), receipt);
});

for (const estadoPago of ["pendiente", "cancelado", undefined]) {
  test(`an operational attendance cannot report ${estadoPago ?? "unknown"} receipts as income`, () => {
    assert.equal(calcularMonto(pending, [{ ...receipt, estadoPago }]), 0);
  });
}

test("an appointment without its own receipt cannot claim another visit's payment", () => {
  const other = { ...receipt, cita: "other" };
  assert.equal(calcularMonto(pending, [other]), 0);
  assert.equal(obtenerPagoRelacionado({ ...pending, registroTratamientoPendiente: false }, [other]), null);
});

test("the report total counts a receipt once when a legacy row overlaps its attended appointment", () => {
  const treatment = { _id: "t1", pacienteId: "p1", nombre: "El Barbas", cita: "one", servicio: pending.servicio };
  assert.equal(calcularMonto(treatment, [receipt]), 120);
  assert.equal(calcularTotalAtenciones([pending, treatment], [receipt]), 120);
  assert.equal(calcularTotalAtenciones([treatment], [receipt]), calcularTotalAtenciones([pending], [receipt]));
});

test("distinct paid appointments for the same client retain distinct income", () => {
  const other = { ...pending, _id: "cita:two", cita: { _id: "two" } };
  const payment = { ...receipt, _id: "pay2", cita: "two", total: "45.50" };
  assert.equal(calcularTotalAtenciones([pending, other], [receipt, payment]), 165.5);
});
