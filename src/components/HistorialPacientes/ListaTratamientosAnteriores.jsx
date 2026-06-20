import { useState } from "react";
import { FaHistory } from "react-icons/fa";
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
    <div className="page-panel page-panel-pad">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10">
          <FaHistory className="text-violet-300" />
        </div>
        <h4 className="text-lg font-semibold text-white">
          Tratamientos anteriores
        </h4>
      </div>

      {tratamientos.length > 0 ? (
        <>
          <ul className="space-y-3">
            {tratamientosVisibles.map((t, i) => (
              <li
                key={i}
                onClick={() => onSeleccionar(t)}
                className="flex cursor-pointer flex-col gap-2 rounded-xl border border-slate-700/60 bg-slate-950/25 p-3 transition hover:border-cyan-400/25 hover:bg-cyan-400/10 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-300">
                  {formatearFecha(t.fecha)}
                </span>
                <span className="text-sm font-medium leading-relaxed text-cyan-100 break-words sm:text-right">
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
        <p className="text-slate-400 italic">No hay tratamientos anteriores.</p>
      )}
    </div>
  );
}
