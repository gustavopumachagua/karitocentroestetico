import { useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function BuscadorPagos({ busqueda, setBusqueda, citas }) {
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    if (!busqueda) return setSugerencias([]);
    const coincidencias = citas
      .map((c) => c.cliente)
      .filter((nombre) =>
        nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    setSugerencias([...new Set(coincidencias)]);
  }, [busqueda, citas]);

  return (
    <div className="relative mb-6 max-w-md mx-auto">
      <div className="search-field">
        <FaSearch className="search-icon" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente..."
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              setSugerencias([]);
            }}
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
              onClick={() => {
                setBusqueda(nombre);
                setSugerencias([]);
              }}
              className="search-suggestion-item"
            >
              {nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
