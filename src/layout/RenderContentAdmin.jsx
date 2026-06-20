import DashboardGeneral from "../pages/admin/DashboardGeneral";
import GestionUsuariosRoles from "../pages/admin/GestionUsuariosRoles";
import GestionClientes from "../pages/admin/GestionClientes";
import GestionInventario from "../pages/admin/GestionInventario";
import GestionFacturacionPagos from "../pages/admin/GestionFacturacionPagos";
import ReportesAvanzados from "../pages/admin/ReportesAvanzados";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function RenderContent({ active, user, setUser }) {
  switch (active) {
    case "Dashboard general":
      return <DashboardGeneral />;
    case "Gestion de usuarios y roles":
      return <GestionUsuariosRoles />;
    case "Gestion de facturacion y pagos":
      return <GestionFacturacionPagos />;
    case "Reportes avanzados":
      return <ReportesAvanzados />;
    case "Gestion de clientes":
      return <GestionClientes />;
    case "Gestion de inventario":
      return <GestionInventario />;
    case "Perfil":
      return <Perfil user={user} setUser={setUser} />;
    case "Contraseña":
      return <Contrasena user={user} setUser={setUser} />;
    default:
      return <div>Selecciona una opción</div>;
  }
}
