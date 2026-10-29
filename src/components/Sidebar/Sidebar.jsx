import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../LogoutButton/LogoutButton";
import logo from "../../assets/Logo.jpg";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import ProtectedImage from "../common/ProtectedImage";
import { resolveProtectedImageSource } from "../../api/media.api";

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
      aria-label="Navegación principal"
      className={`workspace-sidebar fixed md:static inset-y-0 left-0 z-30 flex w-[16.5rem] max-w-[88vw] shrink-0 transform flex-col text-slate-100 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-out md:translate-x-0`}
    >
      {/* ─── Branding ─── */}
      <div className="workspace-brand flex-shrink-0">
            <img
              src={logo}
              alt="Karito Centro Estético"
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-snug text-slate-100">
                Karito Centro Estético
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {user?.rol || "Usuario"}
              </p>
            </div>
      </div>

      {/* ─── Navigation (scrollable) ─── */}
      <nav className="workspace-nav sidebar-scroll flex-1 overflow-x-hidden overflow-y-auto">
        <p className="workspace-nav-label">Espacio de trabajo</p>
        <div className="flex flex-col gap-1">
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
                  aria-current={isActive ? "page" : undefined}
                  className="workspace-nav-item group flex min-w-0 w-full items-center justify-between gap-2.5 px-2.5 py-2.5 text-[13px] font-medium transition-colors duration-150"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="workspace-nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 break-words text-left leading-snug">
                      {item.name}
                    </span>
                  </div>
                  {item.subItems && (
                    <span
                      className={`ml-auto text-[10px] transition-transform duration-200 ${
                        isExpanded ? "rotate-0" : ""
                      } ${isActive ? "text-indigo-300" : "text-slate-400"}`}
                    >
                      {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </button>

                {/* ─── Submenu ─── */}
                {item.subItems && (
                  <div
                    className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      maxHeight: isExpanded
                        ? `${item.subItems.length * 44}px`
                        : "0px",
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <ul className="workspace-subnav flex flex-col">
                      {item.subItems.map((sub) => (
                        <li key={sub.key}>
                          <button
                            onClick={() => handleSubClick(sub)}
                            aria-current={active === sub.key ? "page" : undefined}
                            className="workspace-subnav-item flex min-h-11 min-w-0 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors duration-150"
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ─── User Profile ─── */}
      <div
        className="workspace-profile flex-shrink-0"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <ProtectedImage
              src={resolveProtectedImageSource(user?.avatar, { kind: "avatars", userId: user?.id || user?._id })}
              fallbackSrc="/avatar-default.svg"
              alt="Perfil"
              className="h-10 w-10 rounded-full object-cover"
              style={{ border: "1px solid var(--border-subtle)" }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white text-sm">
              {user?.nombre || "Usuario"}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {user?.rol || "Rol"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
