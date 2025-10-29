import {
  FaUser,
  FaVenusMars,
  FaCalendarAlt,
  FaStethoscope,
} from "react-icons/fa";

export default function InfoPaciente({ paciente }) {
  const formatearServicios = (servicio) => {
    if (!servicio) return "—";
    if (Array.isArray(servicio)) return servicio.join(", ");
    return String(servicio)
      .split(",")
      .map((s) => s.trim())
      .join(", ");
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="bg-gray-800/80 rounded-2xl border border-gray-700 shadow-lg hover:shadow-indigo-900/10 transition-all duration-300 p-5 sm:p-6 w-full">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-5 border-b border-gray-700 pb-2 text-center sm:text-left">
        Información del Paciente
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex items-center gap-3 bg-gray-700/40 p-3 rounded-lg">
          <FaUser className="text-indigo-400 text-lg sm:text-xl" />
          <div>
            <p className="text-gray-400 text-sm">Edad</p>
            <p className="text-white font-medium text-base sm:text-lg">
              {paciente.edad ? `${paciente.edad} años` : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-700/40 p-3 rounded-lg">
          <FaVenusMars className="text-pink-400 text-lg sm:text-xl" />
          <div>
            <p className="text-gray-400 text-sm">Sexo</p>
            <p className="text-white font-medium text-base sm:text-lg">
              {paciente.sexo || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-700/40 p-3 rounded-lg sm:col-span-2">
          <FaStethoscope className="text-green-400 text-lg sm:text-xl" />
          <div>
            <p className="text-gray-400 text-sm">Servicio</p>
            <p className="text-white font-medium text-base sm:text-lg">
              {formatearServicios(paciente.servicio)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-700/40 p-3 rounded-lg sm:col-span-2">
          <FaCalendarAlt className="text-yellow-400 text-lg sm:text-xl" />
          <div>
            <p className="text-gray-400 text-sm">Fecha</p>
            <p className="text-white font-medium text-base sm:text-lg">
              {formatearFecha(paciente.fecha)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
