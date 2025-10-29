import { FaNotesMedical, FaImages } from "react-icons/fa";

export default function ObservacionesImagenes({ paciente }) {
  return (
    <div className="space-y-6">
      {paciente.observacion && (
        <div className="p-5 bg-gray-700/30 rounded-xl border border-gray-600">
          <div className="flex items-center gap-2 mb-2">
            <FaNotesMedical className="text-red-400" />
            <h4 className="font-semibold text-gray-300">Observación</h4>
          </div>
          <p className="italic text-gray-300 text-sm sm:text-base">
            {paciente.observacion}
          </p>
        </div>
      )}

      {paciente.imagenes?.length > 0 && (
        <div className="p-5 bg-gray-700/30 rounded-xl border border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <FaImages className="text-indigo-400" />
            <h4 className="text-gray-300 font-medium">
              Imágenes del tratamiento
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {paciente.imagenes.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt="tratamiento"
                className="w-full h-32 sm:h-28 object-cover rounded-lg border border-gray-700 hover:border-indigo-400 transition duration-300"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
