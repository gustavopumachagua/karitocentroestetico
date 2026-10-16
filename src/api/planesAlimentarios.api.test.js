import assert from "node:assert/strict";
import { Module } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const sourcePath = fileURLToPath(new URL("./planesAlimentarios.api.js", import.meta.url));
const configPath = fileURLToPath(new URL("./axiosConfig.js", import.meta.url));
const bundle = await build({
  absWorkingDir: projectRoot,
  stdin: { contents: `export * from ${JSON.stringify(sourcePath)};export {default as API} from ${JSON.stringify(configPath)};`, resolveDir: projectRoot },
  bundle: true, write: false, format: "cjs", platform: "node", define: { "import.meta.env": '{"VITE_API_URL":"https://backend.example"}' },
});
const filename = path.join(projectRoot, "__nutrition_api_regression__.cjs");
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(projectRoot);
compiled._compile(bundle.outputFiles[0].text, filename);
const { API, obtenerPlanAlimentario, guardarPlanAlimentario, obtenerSeguimientosAlimentarios } = compiled.exports;
const A = { token: "token-A", actorId: "aaaaaaaaaaaaaaaaaaaaaaaa" };
const B = { token: "token-B", actorId: "bbbbbbbbbbbbbbbbbbbbbbbb" };
const HISTORY = "cccccccccccccccccccccccc";

function fixture(t) {
  const previous = globalThis.window;
  const initialAdapter = API.defaults.adapter;
  const data = new Map();
  globalThis.window = { localStorage: { getItem: (key) => data.get(key) || null, setItem: (key, value) => data.set(key, value) } };
  const session = (value) => {
    data.set("token", value.token);
    data.set("user", JSON.stringify({ id: value.actorId, rol: "cosmiatra" }));
  };
  session(A);
  t.after(() => { API.defaults.adapter = initialAdapter; if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
  return { session };
}
const response = (config, data) => ({ config, data, status: 200, statusText: "OK", headers: {} });

test("normal plan write serializes once and binds the captured actor and JWT", async (t) => {
  fixture(t);
  let captured;
  API.defaults.adapter = async (config) => { captured = config; return response(config, { plan: { revision: 1 } }); };
  const result = await guardarPlanAlimentario(HISTORY, { revision: 0, estado: "borrador" }, { expectedSession: A });
  assert.equal(result.plan.revision, 1);
  assert.equal(captured.headers.get("Authorization"), "Bearer token-A");
  assert.equal(captured.timeout, 30000, "A stalled request must not lock the editor indefinitely");
  assert.deepEqual(JSON.parse(captured.data), { revision: 0, estado: "borrador" });
});

test("session change during Axios asynchronous interceptors never dispatches old content with new JWT", async (t) => {
  const { session } = fixture(t);
  let sent = false;
  API.defaults.adapter = async (config) => { sent = true; return response(config, {}); };
  const request = guardarPlanAlimentario(HISTORY, { privateContent: "actor A draft" }, { expectedSession: A });
  session(B);
  await assert.rejects(request, (error) => error.code === "NUTRITION_SESSION_CHANGED" && error.response.status === 401);
  assert.equal(sent, false);
});

test("stale render snapshot cannot save after another account is already active", async (t) => {
  const { session } = fixture(t);
  let sent = false;
  session(B);
  API.defaults.adapter = async (config) => { sent = true; return response(config, {}); };
  await assert.rejects(guardarPlanAlimentario(HISTORY, { privateContent: "actor A" }, { expectedSession: A }), (error) => error.code === "NUTRITION_SESSION_CHANGED");
  assert.equal(sent, false);
});

test("late GET and PUT responses are discarded if identity changes after dispatch", async (t) => {
  const { session } = fixture(t);
  for (const method of ["get", "put"]) {
    session(A);
    API.defaults.adapter = async (config) => { session(B); return response(config, { privateContent: "actor A" }); };
    const request = method === "get" ? obtenerPlanAlimentario(HISTORY, { expectedSession: A }) : guardarPlanAlimentario(HISTORY, {}, { expectedSession: A });
    await assert.rejects(request, (error) => error.code === "NUTRITION_SESSION_CHANGED");
  }
});

test("same token with another actor ID is not treated as the original session", async (t) => {
  const { session } = fixture(t);
  session({ ...B, token: A.token });
  await assert.rejects(obtenerPlanAlimentario(HISTORY, { expectedSession: A }), (error) => error.code === "NUTRITION_SESSION_CHANGED");
});

test("list requests retain signal support and abort without exposing late data", async (t) => {
  fixture(t);
  const controller = new AbortController();
  API.defaults.adapter = async (config) => { assert.equal(config.signal, controller.signal); controller.abort(); return response(config, { seguimientos: [{ id: HISTORY }] }); };
  await assert.rejects(obtenerSeguimientosAlimentarios({ signal: controller.signal, expectedSession: A }));
});
