import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoutButton from "../LogoutButton/LogoutButton";
import logo from "../../assets/Logo.jpg";
import { FaChevronDown, FaChevronRight, FaUserCircle } from "react-icons/fa";
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
      className={`fixed md:static inset-y-0 left-0 z-30 flex w-[17.5rem] max-w-[88vw] transform flex-col text-slate-100 shadow-2xl shadow-black/50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0`}
      style={{
        background:
          "linear-gradient(180deg, rgba(9, 16, 34, 0.985) 0%, rgba(5, 10, 24, 0.985) 100%)",
        borderRight: "1px solid rgba(148, 163, 184, 0.11)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* ─── Branding ─── */}
      <div className="flex-shrink-0 px-3.5 pb-2 pt-4 sm:px-4 sm:pt-5">
        <div
          className="relative overflow-hidden rounded-2xl p-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 211, 238, 0.07), rgba(15, 23, 42, 0.28))",
            border: "1px solid rgba(34, 211, 238, 0.14)",
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            <img
              src={logo}
              alt="Karito Centro Estético"
              className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-cyan-950/30"
              style={{ border: "1px solid rgba(34, 211, 238, 0.2)" }}
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-cyan-200/85">
                Karito Centro Estético
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-white">
                {user?.rol || "Usuario"}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation (scrollable) ─── */}
      <nav className="sidebar-scroll flex-1 overflow-x-hidden overflow-y-auto px-3.5 py-2 sm:px-4">
        <div className="flex flex-col gap-0.5">
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
                  className={`group flex min-w-0 w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-400/13 to-cyan-400/[0.035] text-white shadow-lg shadow-cyan-950/20"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                  style={
                    isActive
                      ? { border: "1px solid rgba(34, 211, 238, 0.2)" }
                      : { border: "1px solid transparent" }
                  }
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all duration-200 text-xs ${
                        isActive
                          ? "bg-gradient-to-br from-cyan-300 to-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20"
                          : "bg-white/[0.06] text-slate-400 group-hover:bg-white/[0.08] group-hover:text-slate-200"
                      }`}
                    >
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
                      } ${isActive ? "text-cyan-300/60" : "text-slate-500"}`}
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
                    <ul className="ml-10 mt-1 flex flex-col gap-0.5 border-l border-white/[0.06] pl-3">
                      {item.subItems.map((sub) => (
                        <li key={sub.key}>
                          <button
                            onClick={() => handleSubClick(sub)}
                            aria-current={active === sub.key ? "page" : undefined}
                            className={`flex min-w-0 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-all duration-200 ${
                              active === sub.key
                                ? "bg-cyan-400/10 text-cyan-200"
                                : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ─── User Profile ─── */}
      <div
        className="flex-shrink-0 px-3.5 py-3.5 sm:px-4 sm:py-4"
        style={{ borderTop: "1px solid rgba(148, 163, 184, 0.08)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <ProtectedImage
              src={resolveProtectedImageSource(user?.avatar, { kind: "avatars", userId: user?.id || user?._id })}
              fallbackSrc="/avatar-default.svg"
              alt="Perfil"
              className="h-10 w-10 rounded-full object-cover shadow-lg"
              style={{ border: "2px solid rgba(34, 211, 238, 0.25)" }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 pulse-dot" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white text-sm">
              {user?.nombre || "Usuario"}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <FaUserCircle className="text-cyan-400/60" />
              {user?.rol || "Rol"}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
