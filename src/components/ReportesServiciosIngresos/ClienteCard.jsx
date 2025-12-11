import { FaUserCircle, FaMale, FaFemale } from "react-icons/fa";

export default function ClienteCard({ cliente }) {
  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
      ? FaFemale
      : FaUserCircle;

  return (
    <div className="bg-gray-800/90 rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-lg flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 transition-all duration-300 hover:bg-gray-700/60">
      <div className="flex justify-center sm:justify-start w-full sm:w-auto">
        <IconoUsuario className="text-indigo-400 text-6xl sm:text-7xl" />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          {cliente.nombre}
        </h2>

        <div className="space-y-1">
          {cliente.edad !== undefined && (
            <p className="text-gray-300 text-sm sm:text-base">
              <span className="font-medium text-gray-400">Edad:</span>{" "}
              {cliente.edad} años
            </p>
          )}

          {cliente.sexo && (
            <p className="text-gray-300 text-sm sm:text-base">
              <span className="font-medium text-gray-400">Sexo:</span>{" "}
              {cliente.sexo}
            </p>
          )}

          {cliente.celular && (
            <p className="text-gray-300 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1">
              <span className="font-medium text-gray-400">Celular:</span>{" "}
              {cliente.celular}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
