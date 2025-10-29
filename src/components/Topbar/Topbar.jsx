import { FiMenu, FiX } from "react-icons/fi";

export default function Topbar({ active, sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">{active}</h1>
      </div>

      <button
        className="md:hidden p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-transform shadow cursor-pointer"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
      </button>
    </div>
  );
}
