import { io } from "socket.io-client";
import { getAuthToken } from "./authStorage";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

/**
 * Creates a realtime connection only for an authenticated session. Keeping
 * the token wiring here prevents individual screens from accidentally opening
 * anonymous Socket.IO connections.
 */
export function createAuthenticatedSocket(options = {}) {
  const token = getAuthToken();
  // Never let Socket.IO silently fall back to the frontend origin. That can
  // leak connection attempts to an unintended host when configuration is
  // missing or a deployment is misconfigured.
  if (!token || !SOCKET_URL) return null;

  return io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    ...options,
    auth: {
      ...options.auth,
      token,
    },
  });
}
