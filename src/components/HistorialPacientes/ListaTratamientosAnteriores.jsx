import { useState } from "react";
import Paginacion from "./Paginacion";

export default function ListaTratamientosAnteriores({
  tratamientos,
  onSeleccionar,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const tratamientosPorPagina = 5;
  const indiceInicio = (paginaActual - 1) * tratamientosPorPagina;
  const indiceFin = indiceInicio + tratamientosPorPagina;
  const tratamientosVisibles = tratamientos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(tratamientos.length / tratamientosPorPagina);
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
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

  const formatearServicios = (servicio) => {
    if (!servicio) return "";
    if (Array.isArray(servicio)) return servicio.join(", ");
    return String(servicio)
      .split(",")
      .map((s) => s.trim())
      .join(", ");
  };

  return (
    <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
      <h4 className="text-lg font-semibold text-indigo-400 mb-3">
        Tratamientos anteriores
      </h4>

      {tratamientos.length > 0 ? (
        <>
          <ul className="space-y-2">
            {tratamientosVisibles.map((t, i) => (
              <li
                key={i}
                onClick={() => onSeleccionar(t)}
                className="flex justify-between items-center border-b border-gray-600 pb-2 hover:bg-gray-600/30 px-2 rounded-md cursor-pointer transition"
              >
                <span className="text-gray-300">{formatearFecha(t.fecha)}</span>
                <span className="text-indigo-300 font-medium">
                  {formatearServicios(t.servicio)}
                </span>
              </li>
            ))}
          </ul>
          {tratamientos.length > tratamientosPorPagina && (
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              cambiarPagina={cambiarPagina}
            />
          )}
        </>
      ) : (
        <p className="text-gray-400 italic">No hay tratamientos anteriores.</p>
      )}
    </div>
  );
}
