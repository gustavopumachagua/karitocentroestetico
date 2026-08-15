import { useMemo } from "react";

export const useAuth = () => {
  const auth = useMemo(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    return {
      token,
      user,
      rol: user?.rol?.toLowerCase() || "",
      nombre: user?.nombre || "",
    };
  }, []);

  return auth;
};
