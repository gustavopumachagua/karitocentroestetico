import { FaSearch } from "react-icons/fa";

export default function BuscadorClientes({
  busqueda,
  setBusqueda,
  sugerencias,
  buscarCliente,
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-gray-700 rounded-xl p-3 focus-within:ring-2 ring-indigo-500">
        <FaSearch className="text-gray-400" size={20} />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar cliente por nombre..."
          className="bg-transparent outline-none w-full text-white placeholder-gray-400 text-sm sm:text-base"
        />
      </div>

      {sugerencias.length > 0 && (
        <ul className="absolute z-20 bg-gray-800 border border-gray-700 w-full mt-2 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {sugerencias.map((nombre, idx) => (
            <li
              key={idx}
              className="p-3 hover:bg-gray-700 cursor-pointer text-gray-200 text-sm sm:text-base"
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
