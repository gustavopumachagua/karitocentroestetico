import GestionCitas from "../pages/cosmiatra/GestionCitas";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import GestionPagos from "../pages/cosmiatra/GestionPagos";
import HistorialClientes from "../pages/doctor/HistorialPacientes";
import ReportesServiciosIngresos from "../pages/cosmiatra/ReportesServiciosIngresos";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function RenderContentCosmeatraRecepcionista({
  active,
  user,
  setUser,
}) {
  switch (active) {
    case "Gestion de Citas":
      return <GestionCitas />;
    case "Registrar Tratamiento":
      return <RegistrarTratamiento />;
    case "Gestion de Pagos":
      return <GestionPagos />;
    case "Historial de Clientes":
      return <HistorialClientes />;
    case "Reportes de Servicios e Ingresos":
      return <ReportesServiciosIngresos />;
    case "Perfil":
      return <Perfil user={user} setUser={setUser} />;
    case "Contraseña":
      return <Contrasena user={user} setUser={setUser} />;
    default:
      return <div>Selecciona una opción</div>;
  }
}
