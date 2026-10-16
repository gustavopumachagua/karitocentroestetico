import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import * as React from "react";

const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
let currentHarness;
const reactShim = {
  ...React,
  useState: (initialValue) => currentHarness.useState(initialValue),
  useEffect: (callback, dependencies) => currentHarness.useEffect(callback, dependencies),
};

// Bundle the real component and shared pagination, replacing only its external
// hook/router adapters. No patient API, browser cache or production data is used.
const bundle = await build({
  absWorkingDir: projectRoot,
  entryPoints: ["src/components/HistorialPacientes/ClinicalNutritionFollowups.jsx"],
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  jsx: "automatic",
  external: ["react", "react/jsx-runtime", "react-router-dom", "react-icons/fa"],
  plugins: [{
    name: "nutrition-followup-test-adapters",
    setup(builder) {
      builder.onResolve({ filter: /\/hooks\/useNutritionFollowups$/ }, () => ({ path: "nutrition-followup-test-hook", external: true }));
    },
  }],
});
const filename = path.join(projectRoot, "__clinical_nutrition_followups_tests__.cjs");
const compiledModule = new Module(filename);
compiledModule.filename = filename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule.require = function requireForFollowups(id) {
  if (id === "react") return reactShim;
  if (id === "nutrition-followup-test-hook") return { useNutritionFollowups: () => currentHarness.snapshot };
  if (id === "react-router-dom") return { useNavigate: () => (url) => currentHarness.navigations.push(url) };
  return Module.prototype.require.call(this, id);
};
compiledModule._compile(bundle.outputFiles[0].text, filename);
const ClinicalNutritionFollowups = compiledModule.exports.default;

function descendants(element, predicate) {
  const found = [];
  function visit(node) {
    if (!React.isValidElement(node)) return;
    if (predicate(node)) found.push(node);
    React.Children.forEach(node.props.children, visit);
  }
  visit(element);
  return found;
}

function textOf(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return React.isValidElement(node)
    ? React.Children.toArray(node.props.children).map(textOf).join("")
    : "";
}

function cards(tree) {
  return descendants(tree, (node) => node.type === "button" && node.props.className?.includes("ui-card-interactive"));
}

function cardNames(tree) {
  return cards(tree).map((card) => textOf(descendants(card, (node) => node.type === "span" && node.props.className?.includes("font-semibold"))[0]));
}

function pagination(tree) {
  const [nav] = descendants(tree, (node) => node.type === "nav" && node.props["aria-label"] === "Paginación de seguimientos alimentarios");
  if (!nav) return null;
  const [control] = descendants(nav, (node) => typeof node.props.cambiarPagina === "function");
  assert.ok(control, "the followup list reuses the existing pagination component");
  const controls = control.type(control.props);
  return {
    nav,
    current: control.props.paginaActual,
    total: control.props.totalPaginas,
    previous: descendants(controls, (node) => node.type === "button" && node.props["aria-label"] === "Página anterior")[0],
    next: descendants(controls, (node) => node.type === "button" && node.props["aria-label"] === "Página siguiente")[0],
  };
}

function entry(number, nombre = `Paciente ${number}`) {
  return {
    id: `historia-${number}`,
    paciente: { nombre, sexo: "Femenino", celular: "987654321" },
    indicadores: { edad: "30", peso: "70", talla: "1.65", imc: "25.7" },
    fechaFinalizacion: "2026-10-15T15:00:00.000Z",
    planEstado: "sin_plan",
  };
}

function mount(entries, initialProps = {}) {
  const states = [];
  const effects = [];
  let stateIndex;
  let effectIndex;
  let pendingEffects;
  let changed;
  let props;
  const harness = {
    snapshot: { entries, loading: false, error: "", refresh: () => {} },
    navigations: [],
    selections: [],
    useState(initialValue) {
      const index = stateIndex++;
      if (!Object.hasOwn(states, index)) states[index] = typeof initialValue === "function" ? initialValue() : initialValue;
      return [states[index], (nextValue) => {
        const next = typeof nextValue === "function" ? nextValue(states[index]) : nextValue;
        if (!Object.is(states[index], next)) {
          states[index] = next;
          changed = true;
        }
      }];
    },
    useEffect(callback, dependencies) {
      const index = effectIndex++;
      const previous = effects[index];
      if (!previous || !dependencies || dependencies.some((value, position) => !Object.is(value, previous.dependencies?.[position]))) {
        pendingEffects.push(() => {
          previous?.cleanup?.();
          effects[index] = { dependencies, cleanup: callback() };
        });
      }
    },
    render(nextProps = {}, nextSnapshot = {}) {
      props = { ...props, ...nextProps };
      harness.snapshot = { ...harness.snapshot, ...nextSnapshot };
      currentHarness = harness;
      let tree;
      for (let iteration = 0; iteration < 10; iteration += 1) {
        stateIndex = 0;
        effectIndex = 0;
        pendingEffects = [];
        changed = false;
        tree = ClinicalNutritionFollowups(props);
        pendingEffects.forEach((run) => run());
        if (!changed) return tree;
      }
      assert.fail("followup effects did not settle");
    },
  };
  props = {
    selectedId: "",
    search: "",
    socket: null,
    onSelect(id) {
      harness.selections.push(id);
      props = { ...props, selectedId: id };
    },
    ...initialProps,
  };
  return harness;
}

test("up to three followups stay together without pagination", () => {
  for (const count of [0, 1, 2, 3]) {
    const entries = Array.from({ length: count }, (_, index) => entry(index + 1));
    const tree = mount(entries).render();
    assert.deepEqual(cardNames(tree), entries.map((item) => item.paciente.nombre));
    assert.equal(pagination(tree), null);
  }
});

test("a fourth followup adds accessible pagination with three cards per page", () => {
  const view = mount([1, 2, 3, 4].map((number) => entry(number)));
  let tree = view.render();
  assert.deepEqual(cardNames(tree), ["Paciente 1", "Paciente 2", "Paciente 3"]);
  assert.match(textOf(tree), /Mostrando 1–3 de 4 seguimientos/u);
  assert.equal(pagination(tree).current, 1);
  assert.equal(pagination(tree).total, 2);
  assert.equal(pagination(tree).previous.props.disabled, true);
  assert.equal(pagination(tree).next.props.disabled, false);

  pagination(tree).next.props.onClick();
  tree = view.render();
  assert.deepEqual(cardNames(tree), ["Paciente 4"]);
  assert.match(textOf(tree), /Mostrando 4–4 de 4 seguimientos/u);
  assert.equal(pagination(tree).current, 2);
  assert.equal(pagination(tree).previous.props.disabled, false);
  assert.equal(pagination(tree).next.props.disabled, true);

  pagination(tree).previous.props.onClick();
  assert.deepEqual(cardNames(view.render()), ["Paciente 1", "Paciente 2", "Paciente 3"]);
});

test("name filtering is accent-insensitive and happens before dividing into pages", () => {
  const entries = [
    entry(1, "Ana Gómez"), entry(2, "Ángela Pérez"), entry(3, "Bruno Ruiz"),
    entry(4, "Daniela Perez"), entry(5, "Elena Ramos"), entry(6, "Camila PÉREZ"),
    entry(7, "Flor Díaz"), entry(8, "Diana Pérez"),
  ];
  const view = mount(entries, { search: "  pErEz  " });
  let tree = view.render();
  assert.deepEqual(cardNames(tree), ["Ángela Pérez", "Daniela Perez", "Camila PÉREZ"]);
  assert.equal(pagination(tree).total, 2);
  assert.match(textOf(tree), /Mostrando 1–3 de 4 seguimientos/u);
  pagination(tree).next.props.onClick();
  tree = view.render();
  assert.deepEqual(cardNames(tree), ["Diana Pérez"]);
});

test("changing the search returns to the first page even if the result count is unchanged", () => {
  const view = mount([1, 2, 3, 4, 5, 6, 7].map((number) => entry(number)));
  let tree = view.render();
  pagination(tree).next.props.onClick();
  tree = view.render();
  pagination(tree).next.props.onClick();
  tree = view.render();
  assert.equal(pagination(tree).current, 3);

  tree = view.render({ search: "paciente" });
  assert.equal(pagination(tree).current, 1);
  assert.deepEqual(cardNames(tree), ["Paciente 1", "Paciente 2", "Paciente 3"]);
  tree = view.render({ search: "sin coincidencias" });
  assert.deepEqual(cardNames(tree), []);
  assert.equal(pagination(tree), null);
  assert.match(textOf(tree), /No hay seguimientos que coincidan/u);
  assert.deepEqual(cardNames(view.render({ search: "" })), ["Paciente 1", "Paciente 2", "Paciente 3"]);
});

test("a refresh that reduces seven followups to two clamps the old last page", () => {
  const entries = [1, 2, 3, 4, 5, 6, 7].map((number) => entry(number));
  const view = mount(entries);
  let tree = view.render();
  pagination(tree).next.props.onClick();
  tree = view.render();
  pagination(tree).next.props.onClick();
  assert.deepEqual(cardNames(view.render()), ["Paciente 7"]);

  tree = view.render({}, { entries: entries.slice(0, 2) });
  assert.deepEqual(cardNames(tree), ["Paciente 1", "Paciente 2"]);
  assert.equal(pagination(tree), null);
  tree = view.render({}, { entries });
  assert.equal(pagination(tree).current, 1, "refreshing again must not restore a stale out-of-range page");
});

test("opening a followup from page two and returning preserves its listing page", () => {
  const view = mount([1, 2, 3, 4, 5].map((number) => entry(number)));
  let tree = view.render();
  pagination(tree).next.props.onClick();
  tree = view.render();
  cards(tree)[1].props.onClick();
  tree = view.render();
  assert.deepEqual(view.selections, ["historia-5"]);
  assert.equal(cards(tree).length, 0);
  assert.equal(pagination(tree), null);
  assert.equal(textOf(descendants(tree, (node) => node.type === "h2")[0]), "Paciente 5");
  const [openPlan] = descendants(tree, (node) => node.type === "button" && textOf(node).includes("Generar plan"));
  openPlan.props.onClick();
  assert.deepEqual(view.navigations, ["/cosmiatra/historial-de-clientes/plan?historia=historia-5"]);

  const [back] = descendants(tree, (node) => node.type === "button" && textOf(node).includes("Volver al listado"));
  back.props.onClick();
  tree = view.render();
  assert.equal(pagination(tree).current, 2);
  assert.deepEqual(cardNames(tree), ["Paciente 4", "Paciente 5"]);
});

test("a directly selected followup is found across all entries, not only the current page", () => {
  const entries = [1, 2, 3, 4, 5, 6, 7].map((number) => entry(number));
  const tree = mount(entries, { selectedId: "historia-7", search: "unrelated search" }).render();
  assert.equal(textOf(descendants(tree, (node) => node.type === "h2")[0]), "Paciente 7");
  assert.equal(pagination(tree), null);
  assert.match(textOf(tree), /Generar plan/u);
});
