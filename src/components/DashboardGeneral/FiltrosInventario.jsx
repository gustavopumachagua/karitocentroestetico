import { FaFilter, FaBoxOpen } from "react-icons/fa";

export default function FiltrosInventario({
  mostrarSoloBajos,
  setMostrarSoloBajos,
}) {
  const handleToggle = () => {
    setMostrarSoloBajos((prev) => !prev);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 border border-gray-700/60 rounded-3xl p-6 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <FaFilter className="text-indigo-400 text-lg" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white tracking-wide">
            Filtros de Inventario
          </h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-gray-300">
          <FaBoxOpen className="text-yellow-400 text-lg" />
          <label className="text-sm">
            Mostrar solo insumos con{" "}
            <strong className="text-yellow-300">bajo stock</strong>
          </label>
        </div>

        <button
          onClick={handleToggle}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-300 border ${
            mostrarSoloBajos
              ? "bg-red-600 hover:bg-red-700 border-red-500/40"
              : "bg-indigo-600 hover:bg-indigo-700 border-indigo-500/40"
          }`}
        >
          {mostrarSoloBajos ? "Ver Todo" : "Ver Solo Bajos"}
        </button>
      </div>
    </div>
  );
}
