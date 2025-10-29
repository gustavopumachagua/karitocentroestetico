import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../LogoutButton/LogoutButton";

export default function Sidebar({
  active,
  setActive,
  menuItems,
  sidebarOpen,
  setSidebarOpen,
  user,
}) {
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navigate = useNavigate();

  const basePath =
    user?.rol?.toLowerCase() === "doctor"
      ? "/doctor"
      : user?.rol?.toLowerCase() === "cosmiatra"
      ? "/cosmiatra"
      : "/administrador";

  const handleClick = (item) => {
    if (item.subItems) {
      setOpenSubmenu(openSubmenu === item.key ? null : item.key);
    } else {
      setActive(item.key);
      const route = `${basePath}/${item.key.replace(/\s+/g, "")}`;
      navigate(route);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleSubClick = (sub) => {
    setActive(sub.key);
    const route = `${basePath}/Ajustes/${sub.key.replace(/\s+/g, "")}`;
    navigate(route);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-30 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } w-75 bg-gradient-to-b from-indigo-950 to-slate-900 text-gray-100 shadow-xl
      transition-transform duration-300 md:translate-x-0 flex flex-col justify-between`}
    >
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8 text-indigo-400">
          {user?.rol || "Usuario"}
        </h2>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <div key={item.key}>
              <button
                onClick={() => handleClick(item)}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer ${
                  active === item.key
                    ? "bg-indigo-600 text-white font-semibold shadow"
                    : "hover:bg-indigo-700/40 text-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                {item.subItems && (
                  <span className="ml-auto text-xs">
                    {openSubmenu === item.key ? "▲" : "▼"}
                  </span>
                )}
              </button>

              {item.subItems && openSubmenu === item.key && (
                <ul className="ml-10 mt-1 flex flex-col gap-1">
                  {item.subItems.map((sub) => (
                    <li key={sub.key}>
                      <button
                        onClick={() => handleSubClick(sub)}
                        className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition cursor-pointer ${
                          active === sub.key
                            ? "bg-indigo-500 text-white shadow"
                            : "hover:bg-indigo-700/40 text-gray-300"
                        }`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-indigo-800/40">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={
              user?.avatar ||
              "https://res.cloudinary.com/db8tsilie/image/upload/v1759552820/avatar_ilbvur.jpg"
            }
            alt="Perfil"
            className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow"
          />
          <div>
            <p className="font-semibold text-white">
              {user?.nombre || "Usuario"}
            </p>
            <p className="text-sm text-gray-400">{user?.rol || "Rol"}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
