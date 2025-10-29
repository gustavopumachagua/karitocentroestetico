import { FaSearch } from "react-icons/fa";

export default function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <FaSearch className="text-gray-400" />
      <input
        type="text"
        placeholder="Buscar por nombre, correo o rol..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
