import assert from "node:assert/strict";
import test from "node:test";
import { createNutritionDraft, nutritionDocumentModel } from "./nutritionPlan.js";
import { NUTRITION_DOCUMENT_STYLE, nutritionIndicatorSummary } from "./nutritionPlanPresentation.js";

test("the document summary preserves the recorded indicators and their units", () => {
  const source = { paciente: { nombre: "Paciente de demostración", sexo: "Femenino" }, indicadores: { edad: 23, peso: 80, talla: 1.64, imc: 29.7 } };
  const draft = createNutritionDraft(source);
  const original = structuredClone(draft);
  const model = nutritionDocumentModel(source, draft);
  assert.equal(model.title, "Plan alimentario semanal orientativo");
  assert.equal(nutritionIndicatorSummary(model), "Femenino, 23 años · 80 kg · 1.64 m · IMC 29.7");
  assert.deepEqual(draft, original, "Document formatting must never modify the saved plan");
});

test("an absent summary value remains explicit without inventing patient data", () => {
  const model = { sexo: "", indicadores: [{ key: "peso", value: "70,5" }] };
  assert.equal(nutritionIndicatorSummary(model), "— años · 70,5 kg · — m · IMC —");
});

test("preview and PDF share six bounded columns with a wider lunch column", () => {
  const ratios = NUTRITION_DOCUMENT_STYLE.columnRatios;
  assert.equal(ratios.length, 6);
  assert.ok(ratios.every((ratio) => ratio > 0 && ratio < 1));
  assert.ok(Math.abs(ratios.reduce((sum, ratio) => sum + ratio, 0) - 1) < 1e-10);
  assert.equal(Math.max(...ratios), ratios[3]);
  assert.equal(Math.min(...ratios), ratios[0]);
});

test("the sage header maintains readable contrast against white text", () => {
  const luminance = NUTRITION_DOCUMENT_STYLE.colors.header
    .map((channel) => channel / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  assert.ok(1.05 / (luminance + 0.05) >= 4.5);
});
