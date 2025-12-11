import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import { menuItemsadmin } from "./MenuItemsAdmin";

import DashboardGeneral from "../pages/admin/DashboardGeneral";
import GestionUsuariosRoles from "../pages/admin/GestionUsuariosRoles";
import GestionClientes from "../pages/admin/GestionClientes";
import GestionInventario from "../pages/admin/GestionInventario";
import GestionFacturacionPagos from "../pages/admin/GestionFacturacionPagos";
import ReportesAvanzados from "../pages/admin/ReportesAvanzados";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function AdminLayout() {
  const [active, setActive] = useState("Dashboard general");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (window.location.pathname === "/administrador") {
      navigate("/administrador/dashboard-general", { replace: true });
    }
  }, [navigate]);

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/").pop();

    const routeMap = {
      "dashboard-general": "Dashboard general",
      "gestion-de-usuarios-y-roles": "Gestion de usuarios y roles",
      "gestion-de-clientes": "Gestion de clientes",
      "gestion-de-inventario": "Gestion de inventario",
      "gestion-de-facturacion-y-pagos": "Gestion de facturacion y pagos",
      "reportes-avanzados": "Reportes avanzados",
      perfil: "Perfil",
      contrasena: "Contraseña",
    };

    if (routeMap[path]) {
      setActive(routeMap[path]);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <Sidebar
        active={active}
        setActive={setActive}
        menuItems={menuItemsadmin}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full">
        <Topbar
          active={active}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <Routes>
          <Route path="dashboard-general" element={<DashboardGeneral />} />
          <Route
            path="gestion-de-usuarios-y-roles"
            element={<GestionUsuariosRoles />}
          />
          <Route path="gestion-de-clientes" element={<GestionClientes />} />
          <Route path="gestion-de-inventario" element={<GestionInventario />} />
          <Route
            path="gestion-de-facturacion-y-pagos"
            element={<GestionFacturacionPagos />}
          />
          <Route path="reportes-avanzados" element={<ReportesAvanzados />} />

          <Route
            path="ajustes/perfil"
            element={<Perfil user={user} setUser={setUser} />}
          />
          <Route
            path="ajustes/contrasena"
            element={<Contrasena user={user} setUser={setUser} />}
          />
        </Routes>
      </main>
    </div>
  );
}
