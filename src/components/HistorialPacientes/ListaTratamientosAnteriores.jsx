import { useState } from "react";
import Paginacion from "./Paginacion";
import AtencionPendienteBadge from "./AtencionPendienteBadge";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getAttentionDate } from "../../utils/attentionHistory";

export default function ListaTratamientosAnteriores({
  tratamientos,
  onSeleccionar,
  mostrarAtenciones = false,
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
        <h4 className="text-base font-semibold text-white">
          {mostrarAtenciones ? "Otras atenciones" : "Tratamientos anteriores"}
        </h4>
      </div>

      {tratamientos.length > 0 ? (
        <>
          <ul className="divide-y divide-slate-700/50">
            {tratamientosVisibles.map((t, i) => (
              <li
                key={t._id || i}
                onClick={() => onSeleccionar(t)}
                className="flex cursor-pointer flex-col gap-2 rounded-md px-2 py-4 transition-colors hover:bg-[var(--surface-hover)] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-300">
                  {getAttentionDate(t) ? formatearFechaCita(getAttentionDate(t)) : "Sin fecha"}
                </span>
                <div className="space-y-1 sm:text-right">
                  <span className="text-sm font-medium leading-relaxed text-indigo-100 break-words">
                    {formatearServicios(t.servicio)}
                  </span>
                  <AtencionPendienteBadge record={t} className="block w-fit sm:ml-auto" />
                </div>
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
        <p className="text-slate-400 italic">
          {mostrarAtenciones ? "No hay otras atenciones registradas." : "No hay tratamientos anteriores."}
        </p>
      )}
    </div>
  );
}
