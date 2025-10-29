import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import { MenuItemsCosmeatraRecepcionista } from "./MenuItemsCosmeatraRecepcionista";

import GestionCitas from "../pages/CosmeatraRecepcionista/GestionCitas";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import GestionPagos from "../pages/CosmeatraRecepcionista/GestionPagos";
import HistorialClientes from "../pages/doctor/HistorialPacientes";
import ReportesServiciosIngresos from "../pages/CosmeatraRecepcionista/ReportesServiciosIngresos";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function CosmeatraRecepcionistaLayout() {
  const [active, setActive] = useState("Gestion de Citas");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (window.location.pathname === "/cosmiatra") {
      navigate("/cosmiatra/GestiondeCitas", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const routeMap = {
      GestiondeCitas: "Gestion de Citas",
      RegistrarTratamiento: "Registrar Tratamiento",
      GestiondePagos: "Gestion de Pagos",
      HistorialdeClientes: "Historial de Clientes",
      ReportesdeServicioseIngresos: "Reportes de Servicios e Ingresos",
      Perfil: "Perfil",
      Contraseña: "Contraseña",
    };

    const newActive = routeMap[path];
    if (newActive && newActive !== active) {
      setActive(newActive);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <Sidebar
        active={active}
        setActive={setActive}
        menuItems={MenuItemsCosmeatraRecepcionista}
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
          <Route path="GestiondeCitas" element={<GestionCitas />} />
          <Route
            path="RegistrarTratamiento"
            element={<RegistrarTratamiento />}
          />
          <Route path="GestiondePagos" element={<GestionPagos />} />
          <Route path="HistorialdeClientes" element={<HistorialClientes />} />
          <Route
            path="ReportesdeServicioseIngresos"
            element={<ReportesServiciosIngresos />}
          />

          <Route
            path="Ajustes/Perfil"
            element={<Perfil user={user} setUser={setUser} />}
          />
          <Route
            path="Ajustes/Contraseña"
            element={<Contrasena user={user} setUser={setUser} />}
          />

          <Route path="*" element={<Navigate to="GestiondeCitas" replace />} />
        </Routes>
      </main>
    </div>
  );
}
