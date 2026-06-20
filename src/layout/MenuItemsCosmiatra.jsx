import {
  FaChartLine,
  FaClipboardList,
  FaCog,
  FaKey,
  FaMoneyBillWave,
  FaNotesMedical,
  FaUserCircle,
  FaUserFriends,
} from "react-icons/fa";

export const MenuItemsCosmeatraRecepcionista = [
  {
    name: "Gestión de citas",
    icon: <FaClipboardList />,
    key: "Gestión de citas",
  },
  {
    name: "Registrar tratamiento",
    icon: <FaNotesMedical />,
    key: "Registrar tratamiento",
  },
  {
    name: "Gestión de pagos",
    icon: <FaMoneyBillWave />,
    key: "Gestión de pagos",
  },
  {
    name: "Historial de clientes",
    icon: <FaUserFriends />,
    key: "Historial de clientes",
  },
  {
    name: "Reportes de servicios e ingresos",
    icon: <FaChartLine />,
    key: "Reportes de servicios e ingresos",
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
