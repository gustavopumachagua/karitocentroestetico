import DashboardLayout from "./DashboardLayout";
import { MenuItemsCosmeatraRecepcionista } from "./MenuItemsCosmiatra";

import GestionCitas from "../pages/cosmiatra/GestionCitas";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import GestionPagos from "../pages/cosmiatra/GestionPagos";
import HistorialClientes from "../pages/doctor/HistorialPacientes";
import ReportesServiciosIngresos from "../pages/cosmiatra/ReportesServiciosIngresos";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

const ROUTE_MAP = {
  "gestion-de-citas": "Gestión de citas",
  "registrar-tratamiento": "Registrar tratamiento",
  "gestion-de-pagos": "Gestión de pagos",
  "historial-de-clientes": "Historial de clientes",
  "reportes-de-servicios-e-ingresos": "Reportes de servicios e ingresos",
  perfil: "Perfil",
  contrasena: "Contraseña",
};

const ROUTES = [
  { path: "gestion-de-citas", element: GestionCitas },
  { path: "registrar-tratamiento", element: RegistrarTratamiento },
  { path: "gestion-de-pagos", element: GestionPagos },
  { path: "historial-de-clientes", element: HistorialClientes },
  { path: "reportes-de-servicios-e-ingresos", element: ReportesServiciosIngresos },
  { path: "ajustes/perfil", element: Perfil, props: { needsUser: true } },
  { path: "ajustes/contrasena", element: Contrasena, props: { needsUser: true } },
];

const DEFAULT_ROUTE = { path: "gestion-de-citas", label: "Gestión de citas" };

export default function CosmeatraRecepcionistaLayout() {
  return (
    <DashboardLayout
      basePath="/cosmiatra"
      defaultRoute={DEFAULT_ROUTE}
      menuItems={MenuItemsCosmeatraRecepcionista}
      routeMap={ROUTE_MAP}
      routes={ROUTES}
    />
  );
}
