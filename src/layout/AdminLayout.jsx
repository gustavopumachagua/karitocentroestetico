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
      navigate("/administrador/Dashboardgeneral", { replace: true });
    }
  }, [navigate]);

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/").pop();

    const routeMap = {
      Dashboardgeneral: "Dashboard general",
      Gestiondeusuariosyroles: "Gestion de usuarios y roles",
      Gestiondeclientes: "Gestion de clientes",
      Gestiondeinventario: "Gestion de inventario",
      Gestiondefacturacionypagos: "Gestion de facturacion y pagos",
      Reportesavanzados: "Reportes avanzados",
      Perfil: "Perfil",
      Contraseña: "Contraseña",
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
          <Route path="Dashboardgeneral" element={<DashboardGeneral />} />
          <Route
            path="Gestiondeusuariosyroles"
            element={<GestionUsuariosRoles />}
          />
          <Route path="Gestiondeclientes" element={<GestionClientes />} />
          <Route path="Gestiondeinventario" element={<GestionInventario />} />
          <Route
            path="Gestiondefacturacionypagos"
            element={<GestionFacturacionPagos />}
          />
          <Route path="Reportesavanzados" element={<ReportesAvanzados />} />

          <Route
            path="Ajustes/Perfil"
            element={<Perfil user={user} setUser={setUser} />}
          />

          <Route
            path="Ajustes/Contraseña"
            element={<Contrasena user={user} setUser={setUser} />}
          />
        </Routes>
      </main>
    </div>
  );
}
