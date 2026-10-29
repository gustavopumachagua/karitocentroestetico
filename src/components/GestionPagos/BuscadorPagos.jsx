import { useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function BuscadorPagos({ busqueda, setBusqueda, citas }) {
  const [sugerencias, setSugerencias] = useState([]);
  const sugerenciaSeleccionadaRef = useRef("");

  useEffect(() => {
    if (!busqueda) return setSugerencias([]);

    if (sugerenciaSeleccionadaRef.current === busqueda) {
      return setSugerencias([]);
    }

    const coincidencias = citas
      .map((c) => c.cliente)
      .filter((nombre) =>
        nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    setSugerencias([...new Set(coincidencias)]);
  }, [busqueda, citas]);

  return (
    <div className="ui-panel relative w-full">
      <p className="mb-3 text-sm font-semibold text-slate-200">Buscar cita atendida</p>
      <div className="search-field max-w-2xl">
        <FaSearch className="search-icon" />
        <input aria-label="Buscar cita atendida por cliente"
          type="text"
          value={busqueda}
          onChange={(e) => {
            sugerenciaSeleccionadaRef.current = "";
            setBusqueda(e.target.value);
          }}
          placeholder="Buscar cliente..."
          className="search-input"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => {
              sugerenciaSeleccionadaRef.current = "";
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
                sugerenciaSeleccionadaRef.current = nombre;
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
