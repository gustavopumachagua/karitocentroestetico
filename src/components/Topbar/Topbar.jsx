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
      className="mb-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl px-3.5 py-4 sm:mb-6 sm:gap-4 sm:px-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-slate-400 sm:text-[11px]">
          Panel de gestión
        </p>
        <h1 className="mt-1 break-words text-lg font-semibold leading-snug tracking-tight text-slate-100 sm:text-xl md:text-2xl">
          {active}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Fecha/hora */}
        <div className="hidden lg:flex flex-col items-end text-right mr-2">
          <span className="text-xs text-slate-400 capitalize">{formattedDate}</span>
          <span className="text-sm font-semibold text-slate-300">{formattedTime}</span>
        </div>

        {/* Separador */}
        <div className="hidden lg:block w-px h-8" style={{ background: 'rgba(148, 163, 184, 0.1)' }} />

        {/* Badge en línea */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-emerald-300"
          style={{
            background: 'rgba(52, 211, 153, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.15)',
          }}
        >
          <span className="pulse-dot" />
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
