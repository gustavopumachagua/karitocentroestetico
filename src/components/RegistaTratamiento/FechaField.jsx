import FechaCita from "../TablaCitas/FechaCita";

export default function FechaField({ fecha }) {
  return (
    <div>
      <label className="block text-gray-300 text-sm mb-2">Fecha</label>
      <div
        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white
        border border-gray-600 focus:outline-none focus:ring-2
        focus:ring-indigo-500"
      >
        <FechaCita fecha={fecha} />
      </div>
    </div>
  );
}
