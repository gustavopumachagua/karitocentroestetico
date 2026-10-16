import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import * as React from "react";

const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
let hooks;
const reactShim = {
  ...React,
  useCallback: (callback) => callback,
  useId: () => "nutrition-finalization-test",
  useEffect: (effect) => { hooks.effects.push(effect); },
  useRef: (initialValue) => {
    const ref = { current: initialValue };
    hooks.refs.push(ref);
    return ref;
  },
};
function ModalMock() { return null; }

// Inspect the real JSX and handlers without opening a browser or mocking globals
// for other test files. Only this in-memory module receives the hook/Modal shim.
const bundle = await build({
  absWorkingDir: projectRoot,
  entryPoints: ["src/components/PlanAlimentario/NutritionPlanFinalizationModal.jsx"],
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  jsx: "automatic",
  external: ["react", "react/jsx-runtime", "react-modal"],
});
const filename = path.join(projectRoot, "__nutrition_finalization_modal_tests__.cjs");
const compiledModule = new Module(filename);
compiledModule.filename = filename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule.require = function requireForModal(id) {
  if (id === "react") return reactShim;
  if (id === "react-modal") return ModalMock;
  return Module.prototype.require.call(this, id);
};
compiledModule._compile(bundle.outputFiles[0].text, filename);
const NutritionPlanFinalizationModal = compiledModule.exports.default;

function render(props = {}) {
  hooks = { effects: [], refs: [] };
  const tree = NutritionPlanFinalizationModal(props);
  return { tree, ...hooks };
}

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
  if (typeof node === "string") return node;
  return React.isValidElement(node)
    ? React.Children.toArray(node.props.children).map(textOf).join("")
    : "";
}

function buttons(tree) {
  return descendants(tree, (node) => node.type === "button");
}

function withDocument(fakeDocument, run) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: fakeDocument,
  });
  try {
    return run();
  } finally {
    if (previous) Object.defineProperty(globalThis, "document", previous);
    else delete globalThis.document;
  }
}

test("no modal opens when there is no finalization stage", () => {
  const { tree } = render({ stage: null });
  assert.equal(tree.type, ModalMock);
  assert.equal(tree.props.isOpen, false);
  assert.equal(buttons(tree).length, 0);
  assert.equal(tree.props.children, false);
});

test("saving is an informative modal without confirmation, cancel or close buttons", () => {
  const { tree } = render({ stage: "saving" });
  assert.equal(tree.props.isOpen, true);
  assert.equal(buttons(tree).length, 0);
  assert.match(textOf(tree), /Finalizando plan alimentario/u);
  assert.doesNotMatch(textOf(tree), /¿Finalizar|Cancelar|Sí, finalizar/u);
  assert.equal(tree.props.shouldCloseOnEsc, false);
  assert.equal(tree.props.shouldCloseOnOverlayClick, false);
  assert.equal(tree.props.onRequestClose, undefined);
  assert.equal(descendants(tree, (node) => node.props.role === "status").length, 1);
});

test("persisted success has a clinical-style acknowledgement and no action buttons", () => {
  const { tree } = render({ stage: "success" });
  assert.equal(buttons(tree).length, 0);
  assert.equal(tree.props.shouldCloseOnEsc, false);
  assert.equal(tree.props.shouldCloseOnOverlayClick, false);
  assert.match(textOf(tree), /Plan alimentario finalizado/u);
  assert.match(textOf(tree), /Vista previa/u);
  assert.match(textOf(tree), /se cerrará automáticamente/u);
});

test("dialog accessibility and root hiding are supplied per instance", () => {
  const appElement = {};
  withDocument({ getElementById: () => appElement }, () => {
    const { tree } = render({ stage: "saving" });
    assert.equal(tree.props.role, "dialog");
    assert.equal(tree.props.appElement, appElement);
    assert.equal(tree.props.ariaHideApp, true);
    const [heading] = descendants(tree, (node) => node.type === "h2");
    const [description] = descendants(tree, (node) => node.props.id === tree.props.aria.describedby);
    assert.equal(tree.props.aria.labelledby, heading.props.id);
    assert.ok(description);
    assert.equal(heading.props.tabIndex, -1);
    assert.equal(tree.props.overlayClassName, "ui-modal-backdrop");
    assert.equal(tree.props.style.overlay.zIndex, 10000);
    assert.equal(tree.props.shouldReturnFocusAfterClose, true);
    assert.equal(tree.props.preventScroll, true);
  });
  assert.equal(render({ stage: "saving" }).tree.props.ariaHideApp, false);
});

test("focus moves to the informative heading while saving or showing success", () => {
  for (const props of [
    { stage: "saving" },
    { stage: "success" },
  ]) {
    const { tree, refs, effects } = render(props);
    const focused = [];
    refs.forEach((ref, index) => {
      ref.current = { focus: () => { focused.push(index); } };
    });
    tree.props.onAfterOpen();
    effects[0]();
    assert.deepEqual(focused, [0, 0]);
  }
});

test("obsolete confirmation and unknown stages cannot open a dialog", () => {
  for (const stage of ["confirm", "error", "unknown"]) {
    const { tree } = render({ stage });
    assert.equal(tree.props.isOpen, false);
    assert.equal(buttons(tree).length, 0);
  }
});

test("body scrolling is locked only while open and its previous style is restored", () => {
  const body = { style: { overflow: "clip" } };
  withDocument({ body, getElementById: () => null }, () => {
    const { effects } = render({ stage: "saving" });
    const cleanup = effects[1]();
    assert.equal(body.style.overflow, "hidden");
    cleanup();
    assert.equal(body.style.overflow, "clip");
    const closed = render({ stage: null });
    assert.equal(closed.effects[1](), undefined);
    assert.equal(body.style.overflow, "clip");
  });
});

test("closing restores only a connected trigger and notifies the optional dismissal callback", () => {
  let focusCalls = 0;
  let dismissals = 0;
  const returnFocusRef = {
    current: { isConnected: true, focus: () => { focusCalls += 1; } },
  };
  const { tree } = render({
    stage: "success",
    returnFocusRef,
    onDismiss: () => { dismissals += 1; },
  });
  tree.props.onAfterClose();
  assert.equal(focusCalls, 1);
  returnFocusRef.current.isConnected = false;
  tree.props.onAfterClose();
  assert.equal(focusCalls, 1, "Navigation must not focus a detached page");
  returnFocusRef.current = null;
  tree.props.onAfterClose();
  assert.equal(focusCalls, 1);
  assert.equal(dismissals, 3);
});
