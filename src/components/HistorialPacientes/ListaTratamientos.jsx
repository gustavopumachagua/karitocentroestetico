import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import Paginacion from "./Paginacion";

export default function ListaTratamientos({ tratamientos, onSeleccionar }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const tratamientosPorPagina = 15;
  const indexFinal = paginaActual * tratamientosPorPagina;
  const indexInicial = indexFinal - tratamientosPorPagina;
  const tratamientosPaginados = tratamientos.slice(indexInicial, indexFinal);
  const totalPaginas = Math.ceil(tratamientos.length / tratamientosPorPagina);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearServicios = (servicio) =>
    Array.isArray(servicio) ? servicio.join(", ") : servicio;

  if (tratamientos.length === 0)
    return (
      <p className="text-gray-400 text-center text-lg py-10 italic">
        No hay tratamientos registrados.
      </p>
    );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {tratamientosPaginados.map((t, index) => (
          <div
            key={t._id || index}
            onClick={() => onSeleccionar(t)}
            className="p-6 bg-gray-800/80 rounded-2xl border border-gray-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-900/10 cursor-pointer transition-all duration-300 flex flex-col justify-between"
          >
            <div className="mb-4">
              <h4 className="font-semibold text-white text-lg lg:text-xl leading-snug break-words">
                {t.nombre}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-gray-400 text-sm lg:text-base">
                <FaCalendarAlt className="text-yellow-400 flex-shrink-0" />
                <span className="whitespace-normal">
                  {formatearFecha(t.fecha)}
                </span>
              </div>
            </div>

            <p className="text-indigo-400 text-sm lg:text-base font-medium mt-auto break-words">
              {formatearServicios(t.servicio)}
            </p>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="flex justify-center">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            cambiarPagina={setPaginaActual}
          />
        </div>
      )}
    </div>
  );
}
