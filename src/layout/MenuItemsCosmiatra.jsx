import { FaCalendarAlt, FaFileAlt, FaUserInjured, FaCog } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

export const MenuItemsCosmeatraRecepcionista = [
  {
    name: "Gestion de Citas",
    icon: <MdOutlineAssignment />,
    key: "Gestion de Citas",
  },
  {
    name: "Registrar Tratamiento",
    icon: <MdOutlineAssignment />,
    key: "Registrar Tratamiento",
  },
  {
    name: "Gestion de Pagos",
    icon: <FaFileAlt />,
    key: "Gestion de Pagos",
  },
  {
    name: "Historial de Clientes",
    icon: <FaCalendarAlt />,
    key: "Historial de Clientes",
  },
  {
    name: "Reportes de Servicios e Ingresos",
    icon: <FaUserInjured />,
    key: "Reportes de Servicios e Ingresos",
  },
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
