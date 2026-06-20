import { FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function Topbar({ active, sidebarOpen, setSidebarOpen }) {
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
    <div
      className="mb-6 flex items-center justify-between gap-4 rounded-xl px-5 py-4 animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(12, 20, 42, 0.82), rgba(8, 14, 32, 0.72))',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-300/80">
          Panel de gestión
        </p>
        <h1 className="mt-1 text-lg font-bold text-white sm:text-xl md:text-2xl tracking-tight">
          {active}
        </h1>
      </div>

      <div className="flex items-center gap-3">
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

        {/* Mobile menu */}
        <button
          className="rounded-xl p-2.5 text-white transition-all duration-200 hover:bg-white/[0.06] active:scale-95 md:hidden"
          style={{ border: '1px solid rgba(148, 163, 184, 0.1)' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
    </div>
  );
}
