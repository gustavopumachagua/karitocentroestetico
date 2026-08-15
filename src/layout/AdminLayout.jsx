import DashboardLayout from "./DashboardLayout";
import { menuItemsadmin } from "./MenuItemsAdmin";

import DashboardGeneral from "../pages/admin/DashboardGeneral";
import GestionUsuariosRoles from "../pages/admin/GestionUsuariosRoles";
import GestionClientes from "../pages/admin/GestionClientes";
import GestionInventario from "../pages/admin/GestionInventario";
import GestionFacturacionPagos from "../pages/admin/GestionFacturacionPagos";
import ReportesAvanzados from "../pages/admin/ReportesAvanzados";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

const ROUTE_MAP = {
  "dashboard-general": "Dashboard general",
  "gestion-de-usuarios-y-roles": "Gestión de usuarios y roles",
  "gestion-de-clientes": "Gestión de clientes",
  "gestion-de-inventario": "Gestión de inventario",
  "gestion-de-facturacion-y-pagos": "Gestión de facturación y pagos",
  "reportes-avanzados": "Reportes avanzados",
  perfil: "Perfil",
  contrasena: "Contraseña",
};

const ROUTES = [
  { path: "dashboard-general", element: DashboardGeneral },
  { path: "gestion-de-usuarios-y-roles", element: GestionUsuariosRoles },
  { path: "gestion-de-clientes", element: GestionClientes },
  { path: "gestion-de-inventario", element: GestionInventario },
  { path: "gestion-de-facturacion-y-pagos", element: GestionFacturacionPagos },
  { path: "reportes-avanzados", element: ReportesAvanzados },
  { path: "ajustes/perfil", element: Perfil, props: { needsUser: true } },
  { path: "ajustes/contrasena", element: Contrasena, props: { needsUser: true } },
];

const DEFAULT_ROUTE = { path: "dashboard-general", label: "Dashboard general" };

export default function AdminLayout() {
  return (
    <DashboardLayout
      basePath="/administrador"
      defaultRoute={DEFAULT_ROUTE}
      menuItems={menuItemsadmin}
      routeMap={ROUTE_MAP}
      routes={ROUTES}
    />
  );
}
