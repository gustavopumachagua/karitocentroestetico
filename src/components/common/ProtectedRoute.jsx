import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DEFAULT_ROUTE_BY_ROLE = {
  administrador: "/administrador/dashboard-general",
  doctor: "/doctor/agenda-de-citas",
  cosmiatra: "/cosmiatra/gestion-de-citas",
};

/** Client-side navigation guard; the API remains the authorization boundary. */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { token, rol } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    return <Navigate to={DEFAULT_ROUTE_BY_ROLE[rol] || "/login"} replace />;
  }

  return <Outlet />;
}
