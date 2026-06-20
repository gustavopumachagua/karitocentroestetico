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
  { name: "Agenda de citas", icon: <FaCalendarAlt />, key: "Agenda de citas" },
  {
    name: "Historial de pacientes",
    icon: <FaUserInjured />,
    key: "Historial de pacientes",
  },
  {
    name: "Registrar tratamiento",
    icon: <FaNotesMedical />,
    key: "Registrar tratamiento",
  },
  { name: "Mis reportes", icon: <FaChartLine />, key: "Mis reportes" },

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
