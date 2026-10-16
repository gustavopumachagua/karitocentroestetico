import assert from "node:assert/strict";
import test from "node:test";
import { getClinicalExamRows, getEditableClinicalExamRows, getFilledClinicalExamRows, getClinicalExamIssues } from "./clinicalExamRows.js";

test("empty new forms start with one editable row without mutating a shared default", () => {
  const first = getEditableClinicalExamRows({});
  first[0].examen = "Otro examen";
  assert.deepEqual(getEditableClinicalExamRows({}), [{ examen: "", resultado: "" }]);
});
test("legacy answers are preserved as individually editable two-column rows", () => {
  assert.deepEqual(getClinicalExamRows({ glucosaAyunas: "95", hba1c: "5.5", otrosExamenes: "Informe" }), [
    { examen: "Glucosa en ayunas", resultado: "95" }, { examen: "HbA1c", resultado: "5.5" }, { examen: "Otros exámenes", resultado: "Informe" },
  ]);
});
test("explicit empty or edited arrays never resurrect the old results", () => {
  assert.deepEqual(getClinicalExamRows({ examenesAuxiliares: [], glucosaAyunas: "95" }), []);
  assert.deepEqual(getClinicalExamRows({ examenesAuxiliares: [{ examen: "TSH", resultado: "2" }], glucosaAyunas: "95" }), [{ examen: "TSH", resultado: "2" }]);
});
test("adding blank rows preserves existing answers and does not collapse editing rows", () => {
  const data = { examenesAuxiliares: [{ examen: "Informe propio", resultado: "Primera línea\nSegunda línea" }, { examen: "", resultado: "" }] };
  assert.equal(getEditableClinicalExamRows(data).length, 2);
  assert.equal(getFilledClinicalExamRows(data).length, 1);
  assert.deepEqual(getClinicalExamIssues(data), []);
});
test("partial rows point the pending-question guide at the exact missing field", () => {
  const issues = getClinicalExamIssues({ examenesAuxiliares: [{ examen: "Examen A", resultado: "1" }, { examen: "Examen B", resultado: "" }] });
  assert.deepEqual(issues.map(({ field }) => field), ["examenesAuxiliares-1-resultado"]);
  assert.ok(getClinicalExamIssues({ examenesAuxiliares: [] }).some(({ field }) => field === "examenesAuxiliares"));
});
test("limits mirror the API and never truncate existing results silently", () => {
  const rows = Array.from({ length: 101 }, () => ({ examen: "X", resultado: "Y" }));
  assert.equal(getClinicalExamRows({ examenesAuxiliares: rows }).length, 101);
  assert.ok(getClinicalExamIssues({ examenesAuxiliares: rows }).length);
  assert.equal(getClinicalExamIssues({ examenesAuxiliares: [{ examen: "X".repeat(161), resultado: "Y".repeat(2001) }] }).length, 2);
});
