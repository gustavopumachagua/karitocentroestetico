import { FiActivity, FiMenu, FiX } from "react-icons/fi";

export default function Topbar({ active, sidebarOpen, setSidebarOpen }) {
  return (
    <div className="dark-surface mb-6 flex items-center justify-between gap-4 rounded-lg px-4 py-4 sm:px-5">
      <div>
        <p className="text-xs font-semibold uppercase text-cyan-200">
          Panel de gestión
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          {active}
        </h1>
      </div>

      <div className="ml-auto hidden items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-200 sm:flex">
        <FiActivity />
        En linea
      </div>

      <button
        className="rounded-lg border border-white/10 bg-slate-800 p-2 text-white shadow-lg transition hover:bg-slate-700 active:scale-95 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
    </div>
  );
}
