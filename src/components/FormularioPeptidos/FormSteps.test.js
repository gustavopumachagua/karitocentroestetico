import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { Children, isValidElement } from "react";

// Compile the real JSX in memory. Inspecting its element tree lets these
// focused UI tests exercise actual event handlers without a browser or API.
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const bundle = await build({
  absWorkingDir: projectRoot,
  entryPoints: ["src/components/FormularioPeptidos/FormSteps.jsx"],
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  define: { "import.meta.env": "{}" },
  jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
});
const filename = path.join(projectRoot, "__clinical_form_steps_tests__.cjs");
const compiledModule = new Module(filename);
compiledModule.filename = filename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule._compile(bundle.outputFiles[0].text, filename);
const { StepExamenesAuxiliares } = compiledModule.exports;

function descendants(element, predicate) {
  const matches = [];
  function visit(node) {
    if (!isValidElement(node)) return;
    if (predicate(node)) matches.push(node);
    Children.forEach(node.props.children, visit);
  }
  visit(element);
  return matches;
}

function editor(rows) {
  const updates = [];
  const tree = StepExamenesAuxiliares({
    formData: { fechaLaboratorio: "2026-10-15", examenesAuxiliares: rows },
    updateField: (field, value) => updates.push({ field, value }),
  });
  return { tree, updates };
}

function removeButtons(tree) {
  return descendants(tree, (node) => node.type === "button" && node.props.children === "Quitar fila");
}

test("auxiliary examinations keep two editable columns and a separate row action cell", () => {
  const { tree } = editor([{ examen: "Glucosa", resultado: "95 mg/dL" }]);
  const headers = descendants(tree, (node) => node.type === "th");
  assert.deepEqual(headers.map((node) => node.props.children), ["Examen", "Resultado", "Acciones"]);

  const [body] = descendants(tree, (node) => node.type === "tbody");
  const cells = descendants(body, (node) => node.type === "td");
  assert.equal(cells.length, 3);
  assert.equal(descendants(cells[0], (node) => node.type === "textarea").length, 1);
  assert.equal(descendants(cells[1], (node) => node.type === "textarea").length, 1);
  assert.equal(descendants(cells[1], (node) => node.type === "button").length, 0);
  const [button] = removeButtons(cells[2]);
  assert.ok(button, "Quitar fila belongs to its own cell beside the result");
  assert.equal(button.props.type, "button", "Removing a row must not submit the form");
});

test("the last auxiliary examination row cannot be removed or cleared", () => {
  const original = [{ examen: "TSH", resultado: "2 mUI/L" }];
  const { tree, updates } = editor(original);
  const [button] = removeButtons(tree);
  assert.equal(button.props.disabled, true);
  // The handler guards the invariant as well as the disabled UI control.
  button.props.onClick();
  assert.deepEqual(updates, []);
  assert.deepEqual(original, [{ examen: "TSH", resultado: "2 mUI/L" }]);
});

test("removing the first auxiliary examination preserves the other complete row", () => {
  const original = [
    { examen: "Glucosa", resultado: "95 mg/dL" },
    { examen: "TSH", resultado: "2 mUI/L\nResultado complementario" },
  ];
  const { tree, updates } = editor(original);
  const [button] = removeButtons(tree);
  assert.equal(button.props.disabled, false);
  button.props.onClick();
  assert.deepEqual(updates, [{ field: "examenesAuxiliares", value: [original[1]] }]);
  assert.equal(original.length, 2, "The input form data must not be mutated");
});

test("adding an auxiliary examination preserves existing values and appends one blank row", () => {
  const original = [{ examen: "Creatinina", resultado: "0.9 mg/dL" }];
  const { tree, updates } = editor(original);
  const [button] = descendants(tree, (node) => node.type === "button" && node.props.children === "Agregar fila");
  button.props.onClick();
  assert.deepEqual(updates, [{
    field: "examenesAuxiliares",
    value: [{ examen: "Creatinina", resultado: "0.9 mg/dL" }, { examen: "", resultado: "" }],
  }]);
  assert.equal(original.length, 1);
});

test("the auxiliary examinations table keeps its own horizontal overflow container", () => {
  const { tree } = editor([{ examen: "", resultado: "" }]);
  const [region] = descendants(tree, (node) => node.props.role === "region" && node.props["aria-label"] === "Exámenes auxiliares");
  assert.ok(region.props.className.includes("ui-table-wrap"));
  assert.equal(region.props.tabIndex, 0);
  assert.equal(descendants(region, (node) => node.type === "table").length, 1);
});
