import API from "./axiosConfig";
import { getAuthSession } from "../services/authStorage";

const actorId = (session) => String(session?.actorId || session?.user?.id || session?.user?._id || "");
const snapshot = (session) => ({ token: session?.token || null, actorId: actorId(session) });

function assertSession(expectedSession, signal) {
  if (signal?.aborted) {
    const error = new Error("Solicitud cancelada.");
    error.name = "AbortError";
    throw error;
  }
  const current = snapshot(getAuthSession());
  if (!expectedSession.token || !expectedSession.actorId || current.token !== expectedSession.token || current.actorId !== expectedSession.actorId) {
    const error = new Error("La sesión cambió. Vuelve a abrir el seguimiento desde tu cuenta actual.");
    error.code = "NUTRITION_SESSION_CHANGED";
    error.response = { status: 401 };
    throw error;
  }
}

async function request(method, path, body, { signal, expectedSession } = {}) {
  // The editor supplies its render-time identity. Other consumers capture at
  // invocation; no asynchronous interceptor may silently replace this actor.
  const expected = snapshot(expectedSession || getAuthSession());
  assertSession(expected, signal);
  const { data } = await API.request({
    method, url: path, data: body, signal,
    // A non-interactive progress modal must also recover if the server hangs.
    timeout: 30000,
    transformRequest: [function protectActor(payload, headers) {
      // Axios executes transforms AFTER all asynchronous request interceptors,
      // immediately before dispatching the adapter. Check again at that edge.
      assertSession(expected, signal);
      headers.set("Authorization", `Bearer ${expected.token}`);
      return payload;
    }, ...API.defaults.transformRequest],
  });
  assertSession(expected, signal);
  return data;
}

/** Server persistence only: nutritional plans are never stored in localStorage. */
export async function obtenerSeguimientosAlimentarios(options = {}) {
  const data = await request("get", "/planes-alimentarios/seguimientos", undefined, options);
  return data?.seguimientos || [];
}

export async function obtenerPlanAlimentario(historiaId, options = {}) {
  return request("get", `/planes-alimentarios/${historiaId}`, undefined, options);
}

export async function guardarPlanAlimentario(historiaId, payload, options = {}) {
  return request("put", `/planes-alimentarios/${historiaId}`, payload, options);
}
