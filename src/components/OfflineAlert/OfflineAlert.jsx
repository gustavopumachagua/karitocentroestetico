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
      <div className="fixed left-0 top-0 z-[9999] flex w-full items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-sm font-medium text-white shadow-lg">
        <FaWifi />
        Sin conexión. Por favor, revisa tu conexión a Internet.
      </div>
    )
  );
};

export default OfflineAlert;
