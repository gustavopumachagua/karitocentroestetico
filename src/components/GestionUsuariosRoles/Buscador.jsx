import { FaSearch, FaTimes } from "react-icons/fa";

export default function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="search-field mb-6">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Buscar por nombre, correo o rol..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
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
  );
}
