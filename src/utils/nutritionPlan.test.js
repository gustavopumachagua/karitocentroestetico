import assert from "node:assert/strict";
import test from "node:test";
import {
  createNutritionDraft, isClinicalHistoryId, NUTRITION_DAYS, NUTRITION_MEALS,
  nutritionDocumentModel, nutritionPdfFilename, nutritionPlanPayload, validateNutritionDraft,
} from "./nutritionPlan.js";

const seguimiento = { paciente: { nombre: "Paciente de demostración", sexo: "Femenino" }, indicadores: { edad: 36, peso: 81.5, talla: 1.65, imc: 29.9 } };
const completed = () => {
  const draft = createNutritionDraft(seguimiento);
  draft.semana.forEach((row) => NUTRITION_MEALS.forEach(({ key }) => { row[key] = `Contenido individual de ${row.dia} para ${key}.`; }));
  draft.indicaciones = "Indicaciones individuales redactadas por el profesional.";
  return draft;
};

test("new plan never copies reference food; one stable row per canonical weekday", () => {
  const draft = createNutritionDraft(seguimiento);
  assert.deepEqual(draft.semana.map(({ dia }) => dia), NUTRITION_DAYS);
  assert.equal(draft.semana.length, 7);
  assert.equal(draft.indicadores.edad, "36");
  for (const row of draft.semana) for (const { key } of NUTRITION_MEALS) assert.equal(row[key], "");
  assert.equal(validateNutritionDraft(draft).length, 36);
});

test("validation addresses all 35 meals, adult age and positive decimal indicators", () => {
  const draft = completed();
  assert.deepEqual(validateNutritionDraft(draft), []);
  draft.indicadores.peso = "81,5";
  assert.deepEqual(validateNutritionDraft(draft), []);
  for (const value of ["17", "131", "18.5", "18 años", ""]) {
    draft.indicadores.edad = value;
    assert.ok(validateNutritionDraft(draft).some(({ id }) => id === "nutrition-edad"));
  }
  draft.indicadores.edad = "18";
  for (const value of ["0", "-1", "1e3", "Infinity", ".5", "", "1.2.3", "9".repeat(309), "9".repeat(13)]) {
    draft.indicadores.peso = value;
    assert.ok(validateNutritionDraft(draft).some(({ id }) => id === "nutrition-peso"));
  }
});

test("validation identifies exact day and meal and enforces text limits", () => {
  const draft = completed();
  draft.semana[4].mediaTarde = "  ";
  draft.semana[0].cena = "x".repeat(1501);
  draft.indicaciones = "x".repeat(4001);
  assert.deepEqual(validateNutritionDraft(draft).map(({ id }) => id), ["nutrition-0-cena", "nutrition-4-mediaTarde", "nutrition-indicaciones"]);
});

test("API body contains revision and canonical trimmed content without duplicate identity", () => {
  const draft = completed();
  draft.indicadores.peso = " 81,5 ";
  draft.semana[0].cena = "  Una cena individual  ";
  const body = nutritionPlanPayload(draft, 3, "finalizado");
  assert.equal(body.revision, 3);
  assert.equal(body.estado, "finalizado");
  assert.equal(body.indicadores.peso, "81.5");
  assert.equal(body.semana[0].cena, "Una cena individual");
  assert.equal(body.paciente, undefined);
  assert.equal(body.profesionalId, undefined);
});

test("document model uses current patient name and same editor ordering", () => {
  const draft = completed();
  const plan = { ...draft, finalizadoEn: "2026-10-15T12:00:00.000Z" };
  const model = nutritionDocumentModel({ ...seguimiento, paciente: { ...seguimiento.paciente, nombre: "Nombre actualizado" } }, draft, plan);
  assert.equal(model.paciente, "Nombre actualizado");
  assert.deepEqual(model.semana.map(({ dia }) => dia), NUTRITION_DAYS);
  assert.deepEqual(model.semana[0].comidas.map(({ key }) => key), NUTRITION_MEALS.map(({ key }) => key));
  assert.equal(model.semana[0].comidas[0].value, draft.semana[0].desayuno);
  assert.equal(model.finalizadoEn, plan.finalizadoEn);
});

test("restoring reordered server plan retains content by weekday and creates no template foods", () => {
  const draft = createNutritionDraft(seguimiento, { indicadores: { edad: "42" }, semana: [{ dia: "Domingo", cena: "Cena registrada" }, { dia: "Lunes", desayuno: "Desayuno registrado" }] });
  assert.equal(draft.indicadores.edad, "42");
  assert.equal(draft.semana[0].desayuno, "Desayuno registrado");
  assert.equal(draft.semana[6].cena, "Cena registrada");
  assert.equal(draft.semana[3].desayuno, "");
});

test("source history IDs and downloadable filenames are bounded and safe", () => {
  assert.equal(isClinicalHistoryId("abcdef123456abcdef123456"), true);
  for (const value of ["", "../patient", "other", "?historia=x", null]) assert.equal(isClinicalHistoryId(value), false);
  assert.equal(nutritionPdfFilename("María Pérez / prueba"), "Plan-alimentario-Maria-Perez-prueba.pdf");
  assert.equal(nutritionPdfFilename(""), "Plan-alimentario-paciente.pdf");
});
