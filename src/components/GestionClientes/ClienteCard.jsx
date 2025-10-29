import { FaUser, FaVenusMars, FaMoneyBillWave } from "react-icons/fa";

export default function ClienteCard({ cliente, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-gray-800/70 border border-gray-700 hover:border-indigo-600 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative group"
    >
      <div className="flex items-center gap-4">
        <div className="text-5xl text-gray-500 hidden sm:block" />
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUser className="text-indigo-400" /> {cliente.nombre}
          </h4>

          <p className="text-gray-300 flex items-center gap-2 mt-1 text-sm sm:text-base">
            <FaVenusMars className="text-pink-400" /> {cliente.sexo}
          </p>

          <p className="text-gray-300 flex items-center gap-2 mt-1 text-sm sm:text-base">
            <FaMoneyBillWave className="text-green-400" />{" "}
            <span className="font-semibold text-green-400">
              S/ {cliente.totalInvertido.toFixed(2)}
            </span>
          </p>

          <p className="text-gray-400 mt-2 text-sm">
            {cliente.tratamientos.length} tratamientos realizados
          </p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-all duration-300" />
    </div>
  );
}
