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
    name: "Gestion de Citas",
    icon: <FaClipboardList />,
    key: "Gestion de Citas",
  },
  {
    name: "Registrar Tratamiento",
    icon: <FaNotesMedical />,
    key: "Registrar Tratamiento",
  },
  {
    name: "Gestion de Pagos",
    icon: <FaMoneyBillWave />,
    key: "Gestion de Pagos",
  },
  {
    name: "Historial de Clientes",
    icon: <FaUserFriends />,
    key: "Historial de Clientes",
  },
  {
    name: "Reportes de Servicios e Ingresos",
    icon: <FaChartLine />,
    key: "Reportes de Servicios e Ingresos",
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
