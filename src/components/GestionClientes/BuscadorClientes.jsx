import { FaSearch } from "react-icons/fa";

export default function BuscadorClientes({
  busqueda,
  manejarCambioBusqueda,
  sugerencias,
  manejarSeleccion,
}) {
  return (
    <div className="relative mb-10">
      <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg shadow-md focus-within:ring-2 focus-within:ring-indigo-500">
        <FaSearch className="ml-3 text-indigo-400 text-lg" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={manejarCambioBusqueda}
          className="w-full p-3 bg-transparent text-gray-200 outline-none rounded-lg"
        />
      </div>

      {sugerencias.length > 0 && (
        <ul className="absolute bg-gray-700 border border-gray-600 mt-1 w-full rounded-lg max-h-48 overflow-y-auto z-10">
          {sugerencias.map((s, i) => (
            <li
              key={i}
              className="p-2 hover:bg-indigo-600 cursor-pointer transition"
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
