import { createElement, useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import {
  AUTH_SESSION_EVENT,
  getAuthUser,
  isAuthStorageKey,
  saveAuthUser,
} from "../services/authStorage";

export default function DashboardLayout({
  basePath,
  defaultRoute,
  menuItems,
  routeMap,
  routes,
}) {
  const [active, setActive] = useState(defaultRoute.label);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(getAuthUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) saveAuthUser(user);
  }, [user]);

  useEffect(() => {
    const refreshUser = () => {
      const nextUser = getAuthUser();
      setUser((currentUser) =>
        JSON.stringify(currentUser) === JSON.stringify(nextUser)
          ? currentUser
          : nextUser,
      );
    };
    const handleStorage = (event) => {
      if (isAuthStorageKey(event.key)) refreshUser();
    };

    window.addEventListener(AUTH_SESSION_EVENT, refreshUser);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, refreshUser);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === basePath || location.pathname === `${basePath}/`) {
      navigate(`${basePath}/${defaultRoute.path}`, { replace: true });
    }
  }, [location.pathname, navigate, basePath, defaultRoute.path]);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const newActive = routeMap[path];
    if (newActive && newActive !== active) {
      setActive(newActive);
    }
  }, [active, location.pathname, routeMap]);

  const notificationTargetPath =
    basePath === "/cosmiatra" && user?.rol?.toLowerCase() === "cosmiatra"
      ? `${basePath}/gestion-de-citas`
      : undefined;

  return (
    <div className="app-shell app-dashboard-shell flex text-slate-100">
      <Sidebar
        active={active}
        setActive={setActive}
        menuItems={menuItems}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/70 backdrop-blur-[1px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="app-dashboard-main min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 lg:p-7 xl:p-8">
        <Topbar
          active={active}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notificationTargetPath={notificationTargetPath}
        />

        <Routes>
          {routes.map(({ path, element, props }) => (
            <Route
              key={path}
              path={path}
              element={createElement(
                element,
                props ? { ...props, user, setUser } : undefined,
              )}
            />
          ))}
          <Route
            path="*"
            element={<Navigate to={defaultRoute.path} replace />}
          />
        </Routes>
      </main>
    </div>
  );
}
