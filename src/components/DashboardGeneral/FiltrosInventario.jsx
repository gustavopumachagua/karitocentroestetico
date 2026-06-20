import { FaFilter, FaBoxOpen } from "react-icons/fa";

export default function FiltrosInventario({
  mostrarSoloBajos,
  setMostrarSoloBajos,
}) {
  const handleToggle = () => {
    setMostrarSoloBajos((prev) => !prev);
  };

  return (
    <div className="glass-card p-6 max-w-4xl mx-auto transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'rgba(129, 140, 248, 0.10)', border: '1px solid rgba(129, 140, 248, 0.15)' }}
          >
            <FaFilter className="text-indigo-400 text-sm" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Filtros de Inventario
          </h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <FaBoxOpen className="text-amber-400" />
          <label>
            Mostrar solo insumos con{" "}
            <strong className="text-amber-300">bajo stock</strong>
          </label>
        </div>

        <button
          onClick={handleToggle}
          className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-300 active:scale-95 ${
            mostrarSoloBajos
              ? "hover:shadow-red-500/10"
              : "hover:shadow-indigo-500/10"
          }`}
          style={{
            background: mostrarSoloBajos
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9))'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(79, 70, 229, 0.9))',
            border: `1px solid ${mostrarSoloBajos ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
          }}
        >
          {mostrarSoloBajos ? "Ver Todo" : "Ver Solo Bajos"}
        </button>
      </div>
    </div>
  );
}
