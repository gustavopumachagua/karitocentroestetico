import DashboardLayout from "./DashboardLayout";
import { MenuItemsDoctor } from "./MenuItemsDoctor";

import CitasDoctor from "../pages/doctor/CitasDoctor";
import HistorialPacientes from "../pages/doctor/HistorialPacientes";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import MisReportes from "../pages/doctor/MisReportes";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

const ROUTE_MAP = {
  "agenda-de-citas": "Agenda de citas",
  "historial-de-pacientes": "Historial de pacientes",
  "registrar-tratamiento": "Registrar tratamiento",
  "mis-reportes": "Mis reportes",
  perfil: "Perfil",
  contrasena: "Contraseña",
};

const ROUTES = [
  { path: "agenda-de-citas", element: CitasDoctor },
  { path: "historial-de-pacientes", element: HistorialPacientes },
  { path: "registrar-tratamiento", element: RegistrarTratamiento },
  { path: "mis-reportes", element: MisReportes },
  { path: "ajustes/perfil", element: Perfil, props: { needsUser: true } },
  { path: "ajustes/contrasena", element: Contrasena, props: { needsUser: true } },
];

const DEFAULT_ROUTE = { path: "agenda-de-citas", label: "Agenda de citas" };

export default function DoctorLayout() {
  return (
    <DashboardLayout
      basePath="/doctor"
      defaultRoute={DEFAULT_ROUTE}
      menuItems={MenuItemsDoctor}
      routeMap={ROUTE_MAP}
      routes={ROUTES}
    />
  );
}
