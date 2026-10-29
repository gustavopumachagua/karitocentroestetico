import { useState, useEffect } from "react";
import { FaWifi } from "react-icons/fa";

const OfflineAlert = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);
  return (
    isOffline && (
      <div role="status" className="fixed left-0 top-0 z-[var(--z-toast)] flex w-full items-center justify-center gap-2 border-b border-amber-400/25 bg-[var(--surface-raised)] px-4 py-3 text-center text-sm font-medium text-amber-200">
        <FaWifi aria-hidden="true" className="shrink-0" />
        Sin conexión. Por favor, revisa tu conexión a Internet.
      </div>
    )
  );
};

export default OfflineAlert;
