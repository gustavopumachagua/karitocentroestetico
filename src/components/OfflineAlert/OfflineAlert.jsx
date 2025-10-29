import { useState, useEffect } from "react";

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
      <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 z-[9999] shadow-lg">
        🚫 Sin conexión. Por favor, revisa tu conexión a Internet.
      </div>
    )
  );
};

export default OfflineAlert;
