import { useCallback, useEffect, useState } from "react";
import { useCitas } from "./useCitas";
import { CLINICAL_HISTORY_UPDATED_EVENT } from "../utils/clinicalHistoryStorage";
import { getClinicalControlNotifications } from "../services/clinicalControlNotifications.service";
import { usePatientUpdates } from "./usePatientUpdates";

/**
 * Keeps the Topbar notification popup on one resilient data source.
 * It reacts to local saves, other browser tabs, Socket.IO finalizations and a
 * minute tick so controls disappear as soon as their scheduled day has passed.
 */
export function useClinicalControlNotifications({ enabled = true } = {}) {
  const { citas, socket } = useCitas();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setNotifications([]);
      setIsLoading(false);
      return [];
    }

    setIsLoading(true);
    const nextNotifications = await getClinicalControlNotifications(citas);
    setNotifications(nextNotifications);
    setIsLoading(false);
    return nextNotifications;
  }, [citas, enabled]);

  usePatientUpdates(() => void refresh(), socket);

  useEffect(() => {
    void refresh();

    const handleRefresh = () => {
      void refresh();
    };
    const intervalId = window.setInterval(handleRefresh, 60_000);

    window.addEventListener(CLINICAL_HISTORY_UPDATED_EVENT, handleRefresh);
    window.addEventListener("storage", handleRefresh);
    socket?.on("historiaClinicaFinalizada", handleRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(CLINICAL_HISTORY_UPDATED_EVENT, handleRefresh);
      window.removeEventListener("storage", handleRefresh);
      socket?.off("historiaClinicaFinalizada", handleRefresh);
    };
  }, [refresh, socket]);

  return { notifications, isLoading, refresh };
}
