import { FaSearch, FaTimes } from "react-icons/fa";

export default function BuscadorClientes({
  busqueda,
  manejarCambioBusqueda,
  sugerencias,
  manejarSeleccion,
}) {
  return (
    <div className="relative mb-8">
      <div className="search-field">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={manejarCambioBusqueda}
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => manejarCambioBusqueda({ target: { value: "" } })}
            className="search-clear"
            aria-label="Limpiar búsqueda"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {sugerencias.length > 0 && (
        <ul className="search-suggestion-list">
          {sugerencias.map((s, i) => (
            <li
              key={i}
              className="search-suggestion-item"
              onClick={() => manejarSeleccion(s.nombre)}
            >
              {s.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
