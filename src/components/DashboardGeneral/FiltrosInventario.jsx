export default function FiltrosInventario({
  mostrarSoloBajos,
  setMostrarSoloBajos,
}) {
  const handleToggle = () => {
    setMostrarSoloBajos((prev) => !prev);
  };

  return (
    <div className="ui-toolbar mb-5">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">Inventario de cosmiatría</h3>
        <p className="mt-1 text-sm text-slate-400">
          {mostrarSoloBajos ? "Insumos por debajo del umbral de stock." : "Disponibilidad actual de todos los insumos."}
        </p>
      </div>
        <button
          onClick={handleToggle}
          aria-pressed={mostrarSoloBajos}
          className={`ui-button ui-button-secondary min-h-11 w-full text-sm sm:w-auto ${
            mostrarSoloBajos
              ? "border-indigo-400/40"
              : "border-slate-700"
          }`}
        >
          {mostrarSoloBajos ? "Ver todos los insumos" : "Ver stock bajo"}
        </button>
    </div>
  );
}
