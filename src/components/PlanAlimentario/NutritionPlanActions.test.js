import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Children, isValidElement } from "react";
import { createNutritionDraft, NUTRITION_DAYS, NUTRITION_MEALS, validateNutritionDraft } from "../../utils/nutritionPlan.js";

const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const bundle = await build({
  absWorkingDir: projectRoot,
  entryPoints: ["src/components/PlanAlimentario/NutritionPlanActions.jsx"],
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
});
const filename = path.join(projectRoot, "__nutrition_actions_tests__.cjs");
const compiledModule = new Module(filename);
compiledModule.filename = filename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule._compile(bundle.outputFiles[0].text, filename);
const NutritionPlanActions = compiledModule.exports.default;

function textOf(node) {
  if (typeof node === "string") return node;
  return isValidElement(node) ? Children.toArray(node.props.children).map(textOf).join("") : "";
}

function buttons(props = {}) {
  const tree = NutritionPlanActions(props);
  return Children.toArray(tree.props.children).filter((node) => isValidElement(node) && node.type === "button");
}

const labels = (props) => buttons(props).map(textOf).map((label) => label.trim());

function completeDraft() {
  return createNutritionDraft({}, {
    indicadores: { edad: "36", peso: "70.5", talla: "1.65", imc: "25.9" },
    semana: NUTRITION_DAYS.map((dia) => ({ dia, ...Object.fromEntries(NUTRITION_MEALS.map(({ key }) => [key, "Contenido de demostración"])) })),
    indicaciones: "Indicaciones de demostración",
  });
}

test("an incomplete plan only offers saving a draft", () => {
  const draft = createNutritionDraft();
  assert.deepEqual(labels({ isComplete: validateNutritionDraft(draft).length === 0 }), ["Guardar borrador"]);
  const [save] = buttons();
  assert.equal(save.props.type, "submit");
});

test("finalize appears only while all indicators, meals and instructions are valid", () => {
  const draft = completeDraft();
  const visible = (value) => labels({ isComplete: validateNutritionDraft(value).length === 0 });
  assert.deepEqual(visible(draft), ["Guardar borrador", "Finalizar plan"]);
  for (const key of Object.keys(draft.indicadores)) {
    const incomplete = structuredClone(draft);
    incomplete.indicadores[key] = "";
    assert.deepEqual(visible(incomplete), ["Guardar borrador"]);
  }
  for (const [index] of draft.semana.entries()) {
    for (const { key } of NUTRITION_MEALS) {
      const incomplete = structuredClone(draft);
      incomplete.semana[index][key] = "   ";
      assert.deepEqual(visible(incomplete), ["Guardar borrador"]);
    }
  }
  assert.deepEqual(visible({ ...draft, indicaciones: "   " }), ["Guardar borrador"]);
  assert.deepEqual(visible({ ...draft, indicadores: { ...draft.indicadores, edad: "17" } }), ["Guardar borrador"]);
  assert.deepEqual(visible(draft), ["Guardar borrador", "Finalizar plan"]);
});

test("finalize invokes the supplied handler without submitting the draft form", () => {
  let calls = 0;
  const [, finalize] = buttons({ isComplete: true, onFinalize: () => { calls += 1; } });
  assert.equal(finalize.props.type, "button");
  finalize.props.onClick();
  assert.equal(calls, 1);
});

test("saving and concurrent conflicts keep editing actions disabled", () => {
  for (const condition of [{ busy: true }, { conflict: true }]) {
    const actions = buttons({ isComplete: true, ...condition });
    assert.equal(actions.length, 2);
    assert.ok(actions.every((button) => button.props.disabled));
  }
});

test("a persisted final plan offers only the explicit preview action", () => {
  let clicks = 0;
  const props = { isFinal: true, isComplete: true, showPreview: false, onPreview: () => { clicks += 1; } };
  assert.deepEqual(labels(props), ["Vista previa"]);
  const [preview] = buttons(props);
  assert.equal(preview.props.type, "button");
  assert.equal(preview.props["aria-expanded"], false);
  assert.equal(preview.props["aria-controls"], "nutrition-final-preview");
  preview.props.onClick();
  assert.equal(clicks, 1);
  assert.deepEqual(labels({ ...props, showPreview: true }), ["Ocultar vista previa"]);
  assert.equal(buttons({ ...props, showPreview: true })[0].props["aria-expanded"], true);
});
