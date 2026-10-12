import { FaFilter, FaBoxOpen } from "react-icons/fa";

export default function FiltrosInventario({
  mostrarSoloBajos,
  setMostrarSoloBajos,
}) {
  const handleToggle = () => {
    setMostrarSoloBajos((prev) => !prev);
  };

  return (
    <div className="ui-panel min-w-0 w-full">
      <div className="flex min-w-0 items-start mb-5 gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="ui-chart-icon">
            <FaFilter className="text-sm" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Filtros de Inventario
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <FaBoxOpen className="text-amber-400" />
          <label>
            Mostrar solo insumos con{" "}
            <strong className="text-amber-300">bajo stock</strong>
          </label>
        </div>

        <button
          onClick={handleToggle}
          className={`ui-button ui-button-secondary min-h-11 w-full text-sm ${
            mostrarSoloBajos
              ? "border-indigo-400/40"
              : "border-slate-700"
          }`}
        >
          {mostrarSoloBajos ? "Ver Todo" : "Ver Solo Bajos"}
        </button>
      </div>
    </div>
  );
}
