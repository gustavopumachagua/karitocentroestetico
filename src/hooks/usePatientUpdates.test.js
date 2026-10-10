import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

// Load the actual hook with small React/browser adapters, without requiring
// a DOM test dependency or Vite's extensionless import resolution.
const hookSource = readFileSync(new URL("./usePatientUpdates.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace("export function usePatientUpdates", "function usePatientUpdates");

function mountHook(onUpdate, socket = null) {
  const browserWindow = new EventTarget();
  const browserDocument = new EventTarget();
  browserDocument.visibilityState = "visible";
  const timers = new Map();
  let nextTimerId = 0;
  browserWindow.setTimeout = (callback) => {
    const timerId = ++nextTimerId;
    timers.set(timerId, callback);
    return timerId;
  };
  browserWindow.clearTimeout = (timerId) => timers.delete(timerId);

  const refs = [];
  const effects = [];
  let refIndex = 0;
  let effectIndex = 0;
  let pendingEffects = [];
  const hook = runInNewContext(`${hookSource}\nusePatientUpdates;`, {
    window: browserWindow,
    document: browserDocument,
    PATIENT_UPDATED_EVENT: "patient:updated",
    useRef: (value) => {
      const index = refIndex++;
      refs[index] ||= { current: value };
      return refs[index];
    },
    useEffect: (effect, dependencies) => {
      const index = effectIndex++;
      const previous = effects[index];
      if (!previous || dependencies.some((value, i) => !Object.is(value, previous.dependencies[i]))) {
        pendingEffects.push(() => {
          previous?.cleanup?.();
          effects[index] = { dependencies, cleanup: effect() };
        });
      }
    },
  });

  const render = (callback, currentSocket = socket) => {
    refIndex = 0;
    effectIndex = 0;
    pendingEffects = [];
    hook(callback, currentSocket);
    pendingEffects.forEach((effect) => effect());
  };
  render(onUpdate);

  return {
    window: browserWindow,
    document: browserDocument,
    render,
    flushTimers: () => {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((callback) => callback());
    },
    unmount: () => effects.forEach((effect) => effect.cleanup?.()),
  };
}

test("local and remote patient updates preserve their payload, reconnect requests a refresh", () => {
  const updates = [];
  const socket = new EventEmitter();
  const view = mountHook((patient) => updates.push(patient), socket);
  const patient = { pacienteId: "patient-1", nombre: "el barbas" };
  const event = new Event("patient:updated");
  event.detail = patient;
  view.window.dispatchEvent(event);
  socket.emit("pacienteActualizado", patient);
  socket.emit("connect");
  assert.deepEqual(updates, [patient, patient, undefined]);
  view.unmount();
});

test("focus refreshes authoritative data even without a socket", () => {
  const updates = [];
  const view = mountHook((patient) => updates.push(patient));
  view.window.dispatchEvent(new Event("focus"));
  assert.equal(updates.length, 0);
  view.flushTimers();
  assert.deepEqual(updates, [undefined]);
  view.unmount();
});

test("returning to a visible tab coalesces visibility and focus into one refresh", () => {
  let refreshes = 0;
  const view = mountHook(() => refreshes++);
  view.document.visibilityState = "hidden";
  view.document.dispatchEvent(new Event("visibilitychange"));
  view.flushTimers();
  assert.equal(refreshes, 0);

  view.document.visibilityState = "visible";
  view.document.dispatchEvent(new Event("visibilitychange"));
  view.window.dispatchEvent(new Event("focus"));
  view.flushTimers();
  assert.equal(refreshes, 1);

  view.window.dispatchEvent(new Event("focus"));
  view.flushTimers();
  assert.equal(refreshes, 2);
  view.unmount();
});

test("hidden tabs neither start nor complete a foreground refresh", () => {
  let refreshes = 0;
  const view = mountHook(() => refreshes++);
  view.document.visibilityState = "hidden";
  view.window.dispatchEvent(new Event("focus"));
  view.flushTimers();
  assert.equal(refreshes, 0);

  view.document.visibilityState = "visible";
  view.document.dispatchEvent(new Event("visibilitychange"));
  view.document.visibilityState = "hidden";
  view.flushTimers();
  assert.equal(refreshes, 0);
  view.unmount();
});

test("a queued foreground refresh calls the latest mounted callback", () => {
  let oldRefreshes = 0;
  let currentRefreshes = 0;
  const view = mountHook(() => oldRefreshes++);
  view.window.dispatchEvent(new Event("focus"));
  view.render(() => currentRefreshes++);
  view.flushTimers();
  assert.equal(oldRefreshes, 0);
  assert.equal(currentRefreshes, 1);
  view.unmount();
});

test("unmount removes local, socket and foreground listeners and cancels pending refresh", () => {
  let refreshes = 0;
  const socket = new EventEmitter();
  const view = mountHook(() => refreshes++, socket);
  view.window.dispatchEvent(new Event("focus"));
  view.unmount();
  view.flushTimers();
  view.window.dispatchEvent(new Event("patient:updated"));
  view.window.dispatchEvent(new Event("focus"));
  view.document.dispatchEvent(new Event("visibilitychange"));
  socket.emit("pacienteActualizado", { nombre: "el barbas" });
  socket.emit("connect");
  view.flushTimers();
  assert.equal(refreshes, 0);
  assert.equal(socket.listenerCount("pacienteActualizado"), 0);
  assert.equal(socket.listenerCount("connect"), 0);
});
