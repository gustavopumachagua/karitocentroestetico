import { useEffect, useRef } from "react";
import { PATIENT_UPDATED_EVENT } from "../utils/patientIdentity";

/** Both local saves and other authenticated sessions update mounted views. */
export function usePatientUpdates(onUpdate, socket) {
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let foregroundRefreshTimer = null;
    const handleLocalUpdate = (event) => callbackRef.current?.(event.detail);
    const handleRemoteUpdate = (patient) => callbackRef.current?.(patient);
    const handleReconnect = () => callbackRef.current?.();
    const handleForeground = () => {
      if (document.visibilityState !== "visible" || foregroundRefreshTimer !== null) return;

      // Returning to a tab commonly emits both events. Refresh once, using
      // the existing callback to recover updates missed while disconnected.
      foregroundRefreshTimer = window.setTimeout(() => {
        foregroundRefreshTimer = null;
        if (document.visibilityState === "visible") callbackRef.current?.();
      }, 100);
    };

    window.addEventListener(PATIENT_UPDATED_EVENT, handleLocalUpdate);
    window.addEventListener("focus", handleForeground);
    document.addEventListener("visibilitychange", handleForeground);
    socket?.on("pacienteActualizado", handleRemoteUpdate);
    socket?.on("connect", handleReconnect);
    return () => {
      window.clearTimeout(foregroundRefreshTimer);
      window.removeEventListener(PATIENT_UPDATED_EVENT, handleLocalUpdate);
      window.removeEventListener("focus", handleForeground);
      document.removeEventListener("visibilitychange", handleForeground);
      socket?.off("pacienteActualizado", handleRemoteUpdate);
      socket?.off("connect", handleReconnect);
    };
  }, [socket]);
}
