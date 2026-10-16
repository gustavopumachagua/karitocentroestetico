import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

const hookSource = readFileSync(new URL("./useTreatmentPatient.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace("export function useTreatmentPatient", "function useTreatmentPatient");
const FIRST_APPOINTMENT = "507f1f77bcf86cd799439011";
const SECOND_APPOINTMENT = "507f1f77bcf86cd799439012";
const FIRST_SESSION = { token: "session-a", user: { id: "507f1f77bcf86cd799439021", rol: "doctor" } };
const SECOND_SESSION = { token: "session-b", user: { id: "507f1f77bcf86cd799439022", rol: "cosmiatra" } };
const PATIENT = { nombre: "Paciente de prueba", pacienteId: "507f1f77bcf86cd799439031", sexo: "Femenino", celular: "987654321" };
const clone = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => { for (let index = 0; index < 5; index += 1) await Promise.resolve(); };
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

/** Exercise the real hook using in-memory React/auth/API adapters, not patient data or a live API. */
function mountHook(requestPatient) {
  let auth = FIRST_SESSION;
  let storedSession = auth;
  let stateIndex = 0;
  let refIndex = 0;
  let callbackIndex = 0;
  let effect;
  let pendingEffect;
  let unmounted = false;
  const states = [];
  const refs = [];
  const callbacks = [];
  const requests = [];
  const updatesAfterUnmount = [];
  const hook = runInNewContext(`${hookSource}\nuseTreatmentPatient;`, {
    AbortController,
    Error,
    useAuth: () => auth,
    getAuthSession: () => storedSession,
    useState: (initial) => {
      const index = stateIndex++;
      if (!Object.hasOwn(states, index)) states[index] = initial;
      return [states[index], (next) => {
        if (unmounted) updatesAfterUnmount.push(next);
        states[index] = typeof next === "function" ? next(states[index]) : next;
      }];
    },
    useRef: (initial) => {
      const index = refIndex++;
      if (!refs[index]) refs[index] = { current: initial };
      return refs[index];
    },
    useCallback: (callback, dependencies) => {
      const index = callbackIndex++;
      const previous = callbacks[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        callbacks[index] = { callback, dependencies };
      }
      return callbacks[index].callback;
    },
    useEffect: (callback, dependencies) => {
      if (!effect || dependencies.some((value, index) => !Object.is(value, effect.dependencies[index]))) {
        pendingEffect = () => {
          effect?.cleanup?.();
          effect = { dependencies, cleanup: callback() };
        };
      }
    },
    obtenerPacientePorCita: (citaId, options) => {
      requests.push({ citaId, options });
      return requestPatient(citaId, options);
    },
  });
  return {
    requests,
    updatesAfterUnmount,
    render(citaId = FIRST_APPOINTMENT, nextAuth) {
      if (nextAuth) { auth = nextAuth; storedSession = nextAuth; }
      stateIndex = 0;
      refIndex = 0;
      callbackIndex = 0;
      pendingEffect = null;
      const result = hook(citaId);
      pendingEffect?.();
      return result;
    },
    changeStoredSession(next) { storedSession = next; },
    unmount() { effect?.cleanup?.(); unmounted = true; },
  };
}

test("a successful first visit lookup with blank intake fields is ready, not a failed search", async () => {
  const firstVisit = { nombre: "Paciente nuevo", pacienteId: null, sexo: "", celular: "" };
  const view = mountHook(async () => firstVisit);
  assert.equal(view.render().status, "loading");
  await settle();
  const result = view.render();
  assert.equal(result.status, "ready");
  assert.deepEqual(clone(result.patient), firstVisit);
  assert.equal(result.error, "");
  assert.equal(view.requests.length, 1);
  view.unmount();
});

test("stored intake fields are returned ready with only the minimum demographic DTO", async () => {
  const view = mountHook(async () => ({ ...PATIENT, observacion: "not part of the lookup DTO", imagenes: ["private"] }));
  view.render();
  await settle();
  const result = view.render();
  assert.equal(result.status, "ready");
  assert.deepEqual(clone(result.patient), PATIENT);
  assert.equal(view.requests[0].citaId, FIRST_APPOINTMENT);
  assert.equal(view.requests[0].options.signal.aborted, false);
  view.unmount();
});

test("changing appointments immediately hides previous demographics and aborts the old request", async () => {
  const second = deferred();
  const view = mountHook((citaId) => citaId === FIRST_APPOINTMENT ? Promise.resolve(PATIENT) : second.promise);
  view.render();
  await settle();
  assert.equal(view.render().patient.celular, PATIENT.celular);
  const current = view.render(SECOND_APPOINTMENT);
  assert.equal(current.status, "loading");
  assert.equal(current.patient, null);
  assert.equal(view.requests[0].options.signal.aborted, true);
  assert.equal(view.requests[1].citaId, SECOND_APPOINTMENT);
  second.resolve({ ...PATIENT, nombre: "Segundo paciente", celular: "912345678" });
  await settle();
  assert.equal(view.render(SECOND_APPOINTMENT).patient.nombre, "Segundo paciente");
  view.unmount();
});

test("account replacement immediately hides the prior account's patient data", async () => {
  const next = deferred();
  let count = 0;
  const view = mountHook(() => ++count === 1 ? Promise.resolve(PATIENT) : next.promise);
  view.render();
  await settle();
  assert.equal(view.render().status, "ready");
  const result = view.render(FIRST_APPOINTMENT, SECOND_SESSION);
  assert.equal(result.status, "loading");
  assert.equal(result.patient, null);
  assert.equal(view.requests[0].options.signal.aborted, true);
  next.resolve({ ...PATIENT, nombre: "Paciente de segunda sesión" });
  await settle();
  assert.equal(view.render().patient.nombre, "Paciente de segunda sesión");
  view.unmount();
});

test("a slow appointment A response cannot replace the already loaded patient B", async () => {
  const first = deferred();
  const second = deferred();
  const view = mountHook((citaId) => citaId === FIRST_APPOINTMENT ? first.promise : second.promise);
  view.render();
  view.render(SECOND_APPOINTMENT);
  second.resolve({ ...PATIENT, nombre: "Paciente B" });
  await settle();
  assert.equal(view.render(SECOND_APPOINTMENT).patient.nombre, "Paciente B");
  first.resolve({ ...PATIENT, nombre: "Paciente A" });
  await settle();
  assert.equal(view.render(SECOND_APPOINTMENT).patient.nombre, "Paciente B");
  assert.equal(view.requests[0].options.signal.aborted, true);
  view.unmount();
});

test("a 503 is an explicit error, never an unregistered patient, and retry can recover", async () => {
  let count = 0;
  const view = mountHook(async () => {
    if (++count === 1) throw Object.assign(new Error("Unavailable"), { response: { status: 503 } });
    return PATIENT;
  });
  view.render();
  await settle();
  const failed = view.render();
  assert.equal(failed.status, "error");
  assert.equal(failed.patient, null);
  assert.match(failed.error, /Reintenta/);
  failed.retry();
  view.render();
  assert.equal(view.render().status, "loading");
  await settle();
  const recovered = view.render();
  assert.equal(recovered.status, "ready");
  assert.deepEqual(clone(recovered.patient), PATIENT);
  assert.equal(view.requests.length, 2);
  assert.equal(view.requests[0].options.signal.aborted, true);
  view.unmount();
});

for (const [status, message] of [[401, /sesión venció/], [403, /No tienes permiso/], [404, /ya no está disponible/]]) {
  test(`HTTP ${status} preserves an explicit error without an anonymous or name-only fallback`, async () => {
    const view = mountHook(async () => { throw Object.assign(new Error("Lookup failed"), { response: { status } }); });
    view.render();
    await settle();
    const result = view.render();
    assert.equal(result.status, "error");
    assert.equal(result.patient, null);
    assert.match(result.error, message);
    assert.equal(view.requests.length, 1);
    view.unmount();
  });
}

test("a missing appointment never triggers an unscoped patient lookup", () => {
  const view = mountHook(async () => assert.fail("must not query by the patient's name or an empty appointment id"));
  const result = view.render("");
  assert.equal(result.status, "error");
  assert.equal(result.patient, null);
  assert.equal(view.requests.length, 0);
  view.unmount();
});

test("unmount aborts the request and a late result never updates state", async () => {
  const pending = deferred();
  const view = mountHook(() => pending.promise);
  view.render();
  view.unmount();
  assert.equal(view.requests[0].options.signal.aborted, true);
  pending.resolve(PATIENT);
  await settle();
  assert.deepEqual(view.updatesAfterUnmount, []);
});

for (const invalid of [null, [], {}, { ...PATIENT, celular: 987654321 }, { ...PATIENT, sexo: null }, { ...PATIENT, nombre: {} }]) {
  test(`an invalid demographic response is an error, not a new patient: ${JSON.stringify(invalid)}`, async () => {
    const view = mountHook(async () => invalid);
    view.render();
    await settle();
    const result = view.render();
    assert.equal(result.status, "error");
    assert.equal(result.patient, null);
    assert.ok(result.error);
    view.unmount();
  });
}

test("a raw auth-storage replacement blocks a late response before React receives the new session", async () => {
  const pending = deferred();
  const view = mountHook(() => pending.promise);
  view.render();
  view.changeStoredSession(SECOND_SESSION);
  pending.resolve(PATIENT);
  await settle();
  const result = view.render();
  assert.equal(result.patient, null);
  assert.notEqual(result.status, "ready");
  view.unmount();
});

test("a raw auth-storage change immediately hides an already loaded patient's data before context refreshes", async () => {
  const view = mountHook(async () => PATIENT);
  view.render();
  await settle();
  assert.equal(view.render().patient.celular, PATIENT.celular);
  view.changeStoredSession(SECOND_SESSION);
  const result = view.render();
  assert.equal(result.patient, null);
  assert.notEqual(result.status, "ready");
  assert.equal(view.requests.length, 1);
  view.unmount();
});

test("logout clears demographics, aborts the lookup and does not make an anonymous request", async () => {
  const view = mountHook(async () => PATIENT);
  view.render();
  await settle();
  assert.equal(view.render().status, "ready");
  const result = view.render(FIRST_APPOINTMENT, { token: null, user: null });
  assert.equal(result.status, "error");
  assert.equal(result.patient, null);
  assert.equal(view.requests.length, 1);
  assert.equal(view.requests[0].options.signal.aborted, true);
});
