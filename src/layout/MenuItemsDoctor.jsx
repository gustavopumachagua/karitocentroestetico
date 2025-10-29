import { FaCalendarAlt, FaFileAlt, FaUserInjured, FaCog } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

export const MenuItemsDoctor = [
  { name: "Agenda de Citas", icon: <FaCalendarAlt />, key: "Agenda de Citas" },
  {
    name: "Historial de Pacientes",
    icon: <FaUserInjured />,
    key: "Historial de Pacientes",
  },
  {
    name: "Registrar Tratamiento",
    icon: <MdOutlineAssignment />,
    key: "Registrar Tratamiento",
  },
  { name: "Mis Reportes", icon: <FaFileAlt />, key: "Mis Reportes" },

  {
    name: "Ajustes",
    icon: <FaCog />,
    key: "Ajustes",
    subItems: [
      { name: "Perfil", key: "Perfil" },
      { name: "Contraseña", key: "Contraseña" },
    ],
  },
];
