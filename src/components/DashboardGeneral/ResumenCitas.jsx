import { FaClipboardList } from "react-icons/fa";

export default function ResumenCitas({ data }) {
  return (
    <div className="bg-gradient-to-br from-gray-800/70 via-gray-900/70 to-gray-800/70 rounded-2xl border border-gray-700/60 p-6 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
          <FaClipboardList className="text-indigo-400 text-xl" />
        </div>
        <h3 className="text-xl font-semibold text-white tracking-wide">
          Resumen de Citas Total
        </h3>
      </div>

      <ul className="divide-y divide-gray-700/50">
        {data.map((cita, i) => (
          <li
            key={i}
            className="flex justify-between items-center py-3 px-2 hover:bg-gray-800/60 rounded-lg transition-colors"
          >
            <span className="text-gray-300 font-medium">{cita.name}</span>
            <span className="font-semibold text-indigo-100 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
              {cita.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
