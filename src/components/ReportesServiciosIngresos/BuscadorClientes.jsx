import { FaSearch, FaTimes } from "react-icons/fa";
import { getPatientKey, getPatientName } from "../../utils/patientIdentity";

export default function BuscadorClientes({
  busqueda,
  setBusqueda,
  sugerencias,
  buscarCliente,
}) {
  return (
    <div className="ui-panel relative">
      <p className="mb-3 text-sm font-semibold text-slate-200">Buscar historial de cliente</p>
      <div className="search-field max-w-2xl">
        <FaSearch className="search-icon" />
        <input aria-label="Buscar cliente por nombre"
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
          {sugerencias.map((patient) => (
            <li
              key={getPatientKey(patient)}
              className="search-suggestion-item"
              onClick={() => buscarCliente(patient)}
            >
              {getPatientName(patient)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
