import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../LogoutButton/LogoutButton";
import {
  FaChevronDown,
  FaChevronRight,
  FaSpa,
  FaUserCircle,
} from "react-icons/fa";

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
  const location = useLocation();

  const basePath =
    user?.rol?.toLowerCase() === "doctor"
      ? "/doctor"
      : user?.rol?.toLowerCase() === "cosmiatra"
      ? "/cosmiatra"
      : "/administrador";

  const formatRoute = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  useEffect(() => {
    const currentPath = location.pathname;

    menuItems.forEach((item) => {
      const route = `${basePath}/${formatRoute(item.key)}`;

      if (currentPath === route) {
        setActive(item.key);
      }

      if (item.subItems) {
        item.subItems.forEach((sub) => {
          const subRoute = `${basePath}/ajustes/${formatRoute(sub.key)}`;

          if (currentPath === subRoute) {
            setActive(sub.key);
            setOpenSubmenu(item.key);
          }
        });
      }
    });
  }, [basePath, location.pathname, menuItems, setActive]);

  const handleClick = (item) => {
    if (item.subItems) {
      setOpenSubmenu(openSubmenu === item.key ? null : item.key);
    } else {
      setActive(item.key);
      const route = `${basePath}/${formatRoute(item.key)}`;
      navigate(route);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleSubClick = (sub) => {
    setActive(sub.key);
    const route = `${basePath}/ajustes/${formatRoute(sub.key)}`;
    navigate(route);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-30 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } flex w-80 max-w-[88vw] flex-col justify-between border-r border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl shadow-black/40 backdrop-blur-xl
      transition-transform duration-300 md:translate-x-0`}
    >
      <div className="p-4 sm:p-5">
        <div className="mb-7 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-300/12 text-cyan-200">
              <FaSpa />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase text-cyan-200">
                Karito
              </p>
              <h2 className="text-lg font-bold text-white">
                {user?.rol || "Usuario"}
              </h2>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isExpanded = openSubmenu === item.key;
            const isActive =
              active === item.key ||
              item.subItems?.some((sub) => sub.key === active);

            return (
              <div key={item.key}>
                <button
                  onClick={() => handleClick(item)}
                  aria-expanded={item.subItems ? isExpanded : undefined}
                  className={`flex min-w-0 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "border border-cyan-300/30 bg-cyan-300/12 text-white shadow-lg shadow-cyan-950/20"
                      : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-cyan-300 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-left leading-snug">
                      {item.name}
                    </span>
                  </div>
                  {item.subItems && (
                    <span className="ml-auto text-xs text-slate-400">
                      {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </button>

                {item.subItems && isExpanded && (
                  <ul className="ml-12 mt-1.5 flex flex-col gap-1 border-l border-white/10 pl-3">
                    {item.subItems.map((sub) => (
                      <li key={sub.key}>
                        <button
                          onClick={() => handleSubClick(sub)}
                          className={`flex min-w-0 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                            active === sub.key
                              ? "bg-cyan-300/12 text-cyan-100"
                              : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {sub.icon && (
                            <span className="text-xs">{sub.icon}</span>
                          )}
                          <span className="min-w-0 flex-1 break-words leading-snug">
                            {sub.name}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={
              user?.avatar ||
              "https://res.cloudinary.com/db8tsilie/image/upload/v1759552820/avatar_ilbvur.jpg"
            }
            alt="Perfil"
            className="h-11 w-11 rounded-full border border-cyan-300/40 object-cover shadow"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {user?.nombre || "Usuario"}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-400">
              <FaUserCircle className="text-cyan-300/80" />
              {user?.rol || "Rol"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
