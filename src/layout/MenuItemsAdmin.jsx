import {
  FaBoxes,
  FaChartLine,
  FaChartPie,
  FaCog,
  FaFileInvoiceDollar,
  FaKey,
  FaUserCircle,
  FaUserFriends,
  FaUsersCog,
} from "react-icons/fa";

export const menuItemsadmin = [
  {
    name: "Dashboard general",
    icon: <FaChartPie />,
    key: "Dashboard general",
  },
  {
    name: "Gestión de usuarios y roles",
    icon: <FaUsersCog />,
    key: "Gestión de usuarios y roles",
  },
  {
    name: "Gestión de clientes",
    icon: <FaUserFriends />,
    key: "Gestión de clientes",
  },
  {
    name: "Gestión de inventario",
    icon: <FaBoxes />,
    key: "Gestión de inventario",
  },
  {
    name: "Gestión de facturación y pagos",
    icon: <FaFileInvoiceDollar />,
    key: "Gestión de facturación y pagos",
  },
  {
    name: "Reportes avanzados",
    icon: <FaChartLine />,
    key: "Reportes avanzados",
  },

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
