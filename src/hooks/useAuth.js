import { useEffect, useMemo, useState } from "react";
import {
  AUTH_SESSION_EVENT,
  getAuthSession,
  isAuthStorageKey,
} from "../services/authStorage";

export const useAuth = () => {
  const [session, setSession] = useState(getAuthSession);

  useEffect(() => {
    const refreshSession = () => setSession(getAuthSession());
    const handleStorage = (event) => {
      if (isAuthStorageKey(event.key)) refreshSession();
    };

    window.addEventListener(AUTH_SESSION_EVENT, refreshSession);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, refreshSession);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return useMemo(() => {
    return {
      token: session.token,
      user: session.user,
      rol: session.user?.rol?.toLowerCase() || "",
      nombre: session.user?.nombre || "",
    };
  }, [session]);
};
