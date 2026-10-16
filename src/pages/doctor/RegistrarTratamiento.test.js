import assert from "node:assert/strict";
import { createRequire, Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../../../", import.meta.url));
const pagePath = fileURLToPath(new URL("./RegistrarTratamiento.jsx", import.meta.url));

// Render the real page and field components. Only authentication, appointment
// context and network-facing hooks are in-memory fixtures; no live API or data.
const bundle = await build({
  absWorkingDir: projectRoot,
  stdin: {
    contents: `export { default as RegistrarTratamiento } from ${JSON.stringify(pagePath)};
      export { configureTestContext } from "__treatment_test_context__";`,
    resolveDir: projectRoot,
    sourcefile: "treatment-empty-form-tests-entry.js",
  },
  write: false,
  bundle: true,
  format: "cjs",
  platform: "node",
  define: { "import.meta.env": "{}" },
  loader: { ".jpg": "dataurl" },
  jsx: "automatic",
  external: ["react", "react/jsx-runtime"],
  plugins: [{
    name: "treatment-page-test-adapters",
    setup(builder) {
      builder.onResolve({ filter: /^__treatment_test_context__$|\/hooks\/(?:useCitas|useAuth|useTreatmentPatient)$|\/services\/authStorage$|\/api\/inventario\.api$/ }, () => ({
        path: "treatment-context", namespace: "treatment-test-context",
      }));
      builder.onLoad({ filter: /.*/, namespace: "treatment-test-context" }, () => ({
        contents: `let fixture;
          export function configureTestContext(next) { fixture = next; }
          export function useAuth() { return fixture.auth; }
          export function getAuthSession() { return fixture.auth; }
          export function useCitas() { return {
            citas: fixture.citas, citaSeleccionada: fixture.selected || null,
            setCitaSeleccionada() {}, socket: null, obtenerTratamientos: async () => [],
          }; }
          export function useTreatmentPatient(citaId) {
            return citaId ? fixture.patientState : {
              status: "error", patient: null,
              error: "No appointment must not produce a visible lookup error", retry() {},
            };
          }
          export async function getInventario() { return []; }
          export async function descontarInsumos() { throw new Error("Unexpected mutation in a render test"); }`,
      }));
    },
  }],
});
const filename = path.join(projectRoot, "__treatment_empty_form_regression__.cjs");
const compiledModule = new Module(filename);
compiledModule.filename = filename;
compiledModule.paths = Module._nodeModulePaths(projectRoot);
compiledModule.require = require;
compiledModule._compile(bundle.outputFiles[0].text, filename);
const { RegistrarTratamiento, configureTestContext } = compiledModule.exports;

const professionalId = "507f1f77bcf86cd799439011";
const appointmentId = "507f1f77bcf86cd799439012";
const loadingPatient = { status: "loading", patient: null, error: "", retry() {} };
function renderPage(role, { citas = [], selected = null, patientState = loadingPatient } = {}) {
  configureTestContext({
    auth: { token: "synthetic-session", nombre: "Profesional de prueba", rol: role,
      user: { id: professionalId, nombre: "Profesional de prueba", rol: role } },
    citas, selected, patientState,
  });
  return renderToStaticMarkup(createElement(RegistrarTratamiento));
}

function assertEmptyForm(html) {
  for (const label of ["Nombre del paciente", "Celular", "Tipo de Servicio"]) {
    const input = html.match(new RegExp(`<input[^>]*aria-label="${label}"[^>]*>`))?.[0];
    assert.ok(input, `Missing field: ${label}`);
    assert.match(input, /value=""/);
  }
  assert.match(html, /aria-label="Observaciones"[^>]*><\/textarea>/);
  assert.match(html, /Insumos utilizados/);
  assert.match(html, /aria-label="Masculino"/);
  assert.match(html, /aria-label="Femenino"/);
  assert.match(html, />Fecha<\/label>/);
  assert.match(html, /aria-label="Subir imágenes del tratamiento"/);
  assert.match(html, /Sin archivos seleccionados/);
  assert.match(html, /<button type="submit" disabled=""/);
  assert.doesNotMatch(html, /No tienes citas pendientes para registrar un tratamiento/);
  assert.doesNotMatch(html, /Consultando los datos registrados del paciente/);
  assert.doesNotMatch(html, /No appointment must not produce a visible lookup error/);
  assert.doesNotMatch(html, /role="alert"|Reintentar consulta/);
}

for (const role of ["doctor", "cosmiatra"]) {
  test(`${role}: shows the complete empty form, not an empty-state card, without pending appointments`, () => {
    assertEmptyForm(renderPage(role));
  });

  test(`${role}: an attended selection cannot populate the empty form or enable saving`, () => {
    const attended = { _id: appointmentId, profesional: professionalId, rol: role,
      estado: "atendido", cliente: "Paciente anterior", servicio: ["Servicio anterior"], fecha: "2026-10-15T12:00:00.000Z" };
    const html = renderPage(role, { citas: [attended], selected: attended });
    assertEmptyForm(html);
    assert.doesNotMatch(html, /Paciente anterior|Servicio anterior/);
  });

  test(`${role}: an active appointment retains its loading guard and actual lookup failure message`, () => {
    const pending = { _id: appointmentId, profesional: professionalId, rol: role,
      estado: "pendiente", cliente: "Paciente actual", servicio: ["Servicio actual"], fecha: "2026-10-15T12:00:00.000Z" };
    const loading = renderPage(role, { citas: [pending], patientState: loadingPatient });
    assert.match(loading, /Consultando los datos registrados del paciente/);
    assert.match(loading, /<button type="submit" disabled=""/);
    assert.match(loading, /value="Paciente actual"/);

    const failed = renderPage(role, { citas: [pending], patientState: {
      status: "error", patient: null, error: "No fue posible consultar esta cita.", retry() {},
    } });
    assert.match(failed, /role="alert"/);
    assert.match(failed, /No fue posible consultar esta cita/);
    assert.match(failed, /Reintentar consulta/);
    assert.match(failed, /<button type="submit" disabled=""/);
  });
}
