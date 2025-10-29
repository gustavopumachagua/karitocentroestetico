import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

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
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar cliente..."
        className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
      />
      {sugerencias.length > 0 && (
        <ul className="absolute bg-gray-800 border border-gray-700 rounded-lg w-full mt-1 z-10 max-h-40 overflow-y-auto shadow-lg">
          {sugerencias.map((nombre, idx) => (
            <li
              key={idx}
              onClick={() => {
                setBusqueda(nombre);
                setSugerencias([]);
              }}
              className="p-2 hover:bg-gray-700 cursor-pointer transition"
            >
              {nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
