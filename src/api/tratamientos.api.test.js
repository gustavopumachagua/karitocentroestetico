import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const bundle = await build({
  absWorkingDir: projectRoot,
  stdin: {
    contents: 'export * from "./src/api/tratamientos.api.js"; export {default as API} from "./src/api/axiosConfig.js";',
    resolveDir: projectRoot,
  },
  bundle: true,
  write: false,
  format: "cjs",
  platform: "node",
  define: { "import.meta.env": '{"VITE_API_URL":"https://backend.example"}' },
});
const filename = path.join(projectRoot, "__treatment_patient_api_tests__.cjs");
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(projectRoot);
compiled._compile(bundle.outputFiles[0].text, filename);
const { API, obtenerPacientePorCita } = compiled.exports;
const CITA_ID = "cccccccccccccccccccccccc";

function fixture(t) {
  const previousWindow = globalThis.window;
  const previousAdapter = API.defaults.adapter;
  globalThis.window = { localStorage: { getItem: (key) => key === "token" ? "synthetic-token" : null } };
  t.after(() => {
    API.defaults.adapter = previousAdapter;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  });
}

test("the shared intake request uses the appointment ID, authentication and cancellation", async (t) => {
  fixture(t);
  const controller = new AbortController();
  const patient = { nombre: "Paciente de prueba", pacienteId: "aaaaaaaaaaaaaaaaaaaaaaaa", sexo: "Femenino", celular: "900000000" };
  let captured;
  API.defaults.adapter = async (config) => {
    captured = config;
    return { config, data: patient, status: 200, statusText: "OK", headers: {} };
  };
  assert.deepEqual(await obtenerPacientePorCita(CITA_ID, { signal: controller.signal }), patient);
  assert.equal(captured.url, `/tratamientos/paciente-por-cita/${CITA_ID}`);
  assert.equal(captured.headers.get("Authorization"), "Bearer synthetic-token");
  assert.equal(captured.signal, controller.signal);
  assert.equal(captured.params, undefined, "Never search another professional's data by name");
});

test("invalid identifiers never reach the API adapter", async (t) => {
  fixture(t);
  let requests = 0;
  API.defaults.adapter = async () => { requests += 1; throw new Error("Unexpected request"); };
  for (const id of ["", undefined, null, "Camila", "../other", { $ne: null }]) {
    await assert.rejects(obtenerPacientePorCita(id), /Selecciona una cita válida/u);
  }
  assert.equal(requests, 0);
});

test("a cancelled intake lookup cannot return late patient fields", async (t) => {
  fixture(t);
  const controller = new AbortController();
  API.defaults.adapter = async (config) => {
    controller.abort();
    return { config, data: { celular: "900000000" }, status: 200, statusText: "OK", headers: {} };
  };
  await assert.rejects(obtenerPacientePorCita(CITA_ID, { signal: controller.signal }));
});
