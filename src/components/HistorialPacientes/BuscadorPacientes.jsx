import { FaSearch, FaTimes } from "react-icons/fa";

export default function BuscadorPacientes({
  busqueda,
  setBusqueda,
  sugerencias,
  cargando,
  mostrandoSugerencias,
  setMostrandoSugerencias,
  onSeleccionar,
}) {
  return (
    <div className="relative mb-8 max-w-lg mx-auto">
      <div className="search-field">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setMostrandoSugerencias(true);
          }}
          placeholder="Buscar paciente..."
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setMostrandoSugerencias(false);
            }}
            className="search-clear"
            aria-label="Limpiar búsqueda"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {mostrandoSugerencias && (
        <ul className="search-suggestion-list">
          {cargando ? (
            <li className="search-empty">Buscando...</li>
          ) : sugerencias.length > 0 ? (
            sugerencias.map((s, i) => (
              <li
                key={i}
                onClick={() => onSeleccionar(s.nombre)}
                className="search-suggestion-item"
              >
                {s.nombre}
              </li>
            ))
          ) : (
            busqueda.trim().length >= 2 && (
              <li className="search-empty">No se encontraron coincidencias</li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
