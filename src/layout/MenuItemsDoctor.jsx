import {
  FaCalendarAlt,
  FaChartLine,
  FaCog,
  FaKey,
  FaNotesMedical,
  FaUserCircle,
  FaUserInjured,
} from "react-icons/fa";

export const MenuItemsDoctor = [
  { name: "Agenda de Citas", icon: <FaCalendarAlt />, key: "Agenda de Citas" },
  {
    name: "Historial de Pacientes",
    icon: <FaUserInjured />,
    key: "Historial de Pacientes",
  },
  {
    name: "Registrar Tratamiento",
    icon: <FaNotesMedical />,
    key: "Registrar Tratamiento",
  },
  { name: "Mis Reportes", icon: <FaChartLine />, key: "Mis Reportes" },

  {
    name: "Ajustes",
    icon: <FaCog />,
    key: "Ajustes",
    subItems: [
      { name: "Perfil", key: "Perfil", icon: <FaUserCircle /> },
      { name: "Contraseña", key: "Contraseña", icon: <FaKey /> },
    ],
  },
];
