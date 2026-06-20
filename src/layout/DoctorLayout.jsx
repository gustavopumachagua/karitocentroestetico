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
import { MenuItemsDoctor } from "./MenuItemsDoctor";

import CitasDoctor from "../pages/doctor/CitasDoctor";
import HistorialPacientes from "../pages/doctor/HistorialPacientes";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import MisReportes from "../pages/doctor/MisReportes";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function DoctorLayout() {
  const [active, setActive] = useState("Agenda de citas");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (location.pathname === "/doctor") {
      navigate("/doctor/agenda-de-citas", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const routeMap = {
      "agenda-de-citas": "Agenda de citas",
      "historial-de-pacientes": "Historial de pacientes",
      "registrar-tratamiento": "Registrar tratamiento",
      "mis-reportes": "Mis reportes",
      perfil: "Perfil",
      contrasena: "Contraseña",
    };

    const newActive = routeMap[path];
    if (newActive && newActive !== active) {
      setActive(newActive);
    }
  }, [active, location.pathname]);

  return (
    <div className="app-shell flex h-screen text-slate-100">
      <Sidebar
        active={active}
        setActive={setActive}
        menuItems={MenuItemsDoctor}
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
          <Route path="agenda-de-citas" element={<CitasDoctor />} />
          <Route
            path="historial-de-pacientes"
            element={<HistorialPacientes />}
          />
          <Route
            path="registrar-tratamiento"
            element={<RegistrarTratamiento />}
          />
          <Route path="mis-reportes" element={<MisReportes />} />

          <Route
            path="ajustes/perfil"
            element={<Perfil user={user} setUser={setUser} />}
          />
          <Route
            path="ajustes/contrasena"
            element={<Contrasena user={user} setUser={setUser} />}
          />

          <Route path="*" element={<Navigate to="agenda-de-citas" replace />} />
        </Routes>
      </main>
    </div>
  );
}
