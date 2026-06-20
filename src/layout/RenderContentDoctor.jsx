import AgendaCitas from "../pages/doctor/CitasDoctor";
import HistorialPacientes from "../pages/doctor/HistorialPacientes";
import RegistrarTratamiento from "../pages/doctor/RegistrarTratamiento";
import MisReportes from "../pages/doctor/MisReportes";
import Perfil from "../pages/settings/Perfil";
import Contrasena from "../pages/settings/Contrasena";

export default function RenderContentDoctor({ active, user, setUser }) {
  switch (active) {
    case "Agenda de Citas":
      return <AgendaCitas />;
    case "Historial de Pacientes":
      return <HistorialPacientes />;
    case "Registrar Tratamiento":
      return <RegistrarTratamiento />;
    case "Mis Reportes":
      return <MisReportes />;
    case "Perfil":
      return <Perfil user={user} setUser={setUser} />;
    case "Contraseña":
      return <Contrasena user={user} setUser={setUser} />;
    default:
      return <div>Selecciona una opción</div>;
  }
}
