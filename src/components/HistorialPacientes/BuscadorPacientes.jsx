import { FaSearch } from "react-icons/fa";

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
      <FaSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
      <input
        type="text"
        value={busqueda}
        onChange={(e) => {
          setBusqueda(e.target.value);
          setMostrandoSugerencias(true);
        }}
        placeholder="Buscar paciente por nombre..."
        className="w-full pl-10 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {mostrandoSugerencias && (
        <ul className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto">
          {cargando ? (
            <li className="px-4 py-2 text-gray-400 italic">Buscando...</li>
          ) : sugerencias.length > 0 ? (
            sugerencias.map((s, i) => (
              <li
                key={i}
                onClick={() => onSeleccionar(s.nombre)}
                className="px-4 py-2 text-gray-200 hover:bg-indigo-600 hover:text-white cursor-pointer transition"
              >
                {s.nombre}
              </li>
            ))
          ) : (
            busqueda.trim().length >= 2 && (
              <li className="px-4 py-2 text-gray-400 italic">
                No se encontraron coincidencias
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
