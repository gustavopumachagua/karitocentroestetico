import { FaCalendarAlt, FaUserMd, FaCamera } from "react-icons/fa";

export default function TratamientoCard({ tratamiento }) {
  const fechaFormateada = new Date(tratamiento.fecha).toLocaleDateString();

  return (
    <div className="bg-gray-800/70 border border-gray-700 rounded-2xl shadow-md hover:shadow-xl hover:border-indigo-600 transition-all duration-300 overflow-hidden flex flex-col">
      {tratamiento.imagenes?.length > 0 ? (
        <img
          src={tratamiento.imagenes[0].url}
          alt="Tratamiento"
          className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-48 sm:h-56 flex items-center justify-center bg-gray-700">
          <FaCamera className="text-4xl text-gray-400" />
        </div>
      )}

      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <p className="text-gray-300 flex items-center gap-2 text-sm sm:text-base">
            <FaCalendarAlt className="text-indigo-400" /> {fechaFormateada}
          </p>

          <p className="text-gray-100 mt-2 text-sm sm:text-base">
            <span className="font-semibold text-indigo-400">Servicio:</span>{" "}
            {tratamiento.servicio?.join(", ")}
          </p>

          <p className="text-gray-300 mt-2 flex items-center gap-2 text-sm sm:text-base flex-wrap">
            <FaUserMd className="text-cyan-400" />
            {tratamiento.profesional || "No registrado"}
            {tratamiento.rol && (
              <span className="text-xs bg-indigo-600/70 px-2 py-1 rounded-full ml-2 text-white">
                {tratamiento.rol}
              </span>
            )}
          </p>

          <p className="text-gray-400 mt-3 text-sm italic leading-snug">
            <span className="text-gray-300 font-medium">Observaciones:</span>{" "}
            {tratamiento.observacion || "Sin observaciones"}
          </p>
        </div>
      </div>
    </div>
  );
}
