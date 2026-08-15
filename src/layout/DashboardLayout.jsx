import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";

export default function DashboardLayout({
  basePath,
  defaultRoute,
  menuItems,
  routeMap,
  routes,
}) {
  const [active, setActive] = useState(defaultRoute.label);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

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

  return (
    <div className="app-shell flex h-screen text-slate-100">
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
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden w-full p-4 sm:p-6 lg:p-8">
        <Topbar
          active={active}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <Routes>
          {routes.map(({ path, element: Element, props }) => (
            <Route
              key={path}
              path={path}
              element={
                props
                  ? <Element {...props} user={user} setUser={setUser} />
                  : <Element />
              }
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
