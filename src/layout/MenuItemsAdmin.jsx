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
    name: "Gestion de usuarios y roles",
    icon: <FaUsersCog />,
    key: "Gestion de usuarios y roles",
  },
  {
    name: "Gestion de clientes",
    icon: <FaUserFriends />,
    key: "Gestion de clientes",
  },
  {
    name: "Gestion de inventario",
    icon: <FaBoxes />,
    key: "Gestion de inventario",
  },
  {
    name: "Gestion de facturacion y pagos",
    icon: <FaFileInvoiceDollar />,
    key: "Gestion de facturacion y pagos",
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
