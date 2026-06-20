import { FaSearch, FaTimes } from "react-icons/fa";

export default function BuscadorClientes({
  busqueda,
  setBusqueda,
  sugerencias,
  buscarCliente,
}) {
  return (
    <div className="relative">
      <div className="search-field">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre..."
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda("")}
            className="search-clear"
            aria-label="Limpiar búsqueda"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {sugerencias.length > 0 && (
        <ul className="search-suggestion-list">
          {sugerencias.map((nombre, idx) => (
            <li
              key={idx}
              className="search-suggestion-item"
              onClick={() => buscarCliente(nombre)}
            >
              {nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
