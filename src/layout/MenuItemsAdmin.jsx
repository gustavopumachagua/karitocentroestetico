import { FaFileAlt, FaUserInjured, FaCog } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";

export const menuItemsadmin = [
  {
    name: "Dashboard general",
    icon: <FaUserInjured />,
    key: "Dashboard general",
  },
  {
    name: "Gestion de usuarios y roles",
    icon: <MdOutlineAssignment />,
    key: "Gestion de usuarios y roles",
  },
  {
    name: "Gestion de clientes",
    icon: <FaFileAlt />,
    key: "Gestion de clientes",
  },
  {
    name: "Gestion de inventario",
    icon: <FaFileAlt />,
    key: "Gestion de inventario",
  },
  {
    name: "Gestion de facturacion y pagos",
    icon: <FaFileAlt />,
    key: "Gestion de facturacion y pagos",
  },
  {
    name: "Reportes avanzados",
    icon: <FaFileAlt />,
    key: "Reportes avanzados",
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
