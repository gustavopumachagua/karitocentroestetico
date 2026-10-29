import { FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";
import ClinicalControlNotifications from "./ClinicalControlNotifications";

export default function Topbar({
  active,
  sidebarOpen,
  setSidebarOpen,
  notificationTargetPath,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedTime = currentTime.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className="workspace-topbar flex min-w-0 items-center justify-between gap-3 sm:gap-4"
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-400">
          Panel de gestión
        </p>
        <h1 className="mt-1 break-words font-semibold leading-snug text-slate-100">
          {active}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Fecha/hora */}
        <div className="hidden lg:flex flex-col items-end text-right mr-2">
          <span className="text-xs text-slate-400 capitalize">{formattedDate}</span>
          <span className="mt-0.5 text-xs tabular-nums text-slate-300">{formattedTime}</span>
        </div>

        {/* Separador */}
        <div className="hidden lg:block w-px h-7" style={{ background: 'var(--line-soft)' }} />

        {/* Badge en línea */}
        <div className="workspace-online hidden sm:flex items-center gap-2 px-2 py-2">
          <span className="workspace-online-dot" aria-hidden="true" />
          En línea
        </div>

        {notificationTargetPath && (
          <ClinicalControlNotifications targetPath={notificationTargetPath} />
        )}

        {/* Mobile menu */}
        <button
          className={`ui-icon-button h-11 w-11 shrink-0 md:hidden ${
            sidebarOpen
              ? "fixed right-4 top-4 z-50 bg-[var(--bg-card)] shadow-lg shadow-black/20"
              : ""
          }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
    </header>
  );
}
