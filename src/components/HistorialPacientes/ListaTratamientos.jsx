import { useState } from "react";
import {
  FaFemale,
  FaMale,
  FaUser,
} from "react-icons/fa";
import Paginacion from "./Paginacion";
import AtencionPendienteBadge from "./AtencionPendienteBadge";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getAttentionDate } from "../../utils/attentionHistory";

export default function ListaTratamientos({ tratamientos, onSeleccionar, mostrarAtenciones = false }) {
  const [paginaActual, setPaginaActual] = useState(1);
  const tratamientosPorPagina = 15;
  const indexFinal = paginaActual * tratamientosPorPagina;
  const indexInicial = indexFinal - tratamientosPorPagina;
  const tratamientosPaginados = tratamientos.slice(indexInicial, indexFinal);
  const totalPaginas = Math.ceil(tratamientos.length / tratamientosPorPagina);

  const formatearServicios = (servicio) =>
    Array.isArray(servicio) ? servicio.join(", ") : servicio;

  const obtenerIconoPaciente = (sexo) => {
    const sexoNormalizado = sexo?.toLowerCase();
    if (sexoNormalizado === "masculino") {
      return {
        Icono: FaMale,
        color: "text-indigo-300",
        bg: "bg-indigo-400/10",
        border: "border-indigo-400/20",
      };
    }
    if (sexoNormalizado === "femenino") {
      return {
        Icono: FaFemale,
        color: "text-indigo-300",
        bg: "bg-indigo-400/10",
        border: "border-indigo-400/20",
      };
    }
    return {
      Icono: FaUser,
      color: "text-indigo-300",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20",
    };
  };

  if (tratamientos.length === 0)
    return (
      <div className="page-panel page-panel-pad text-center">
        <p className="text-slate-400 text-base italic">
          {mostrarAtenciones ? "No hay atenciones registradas." : "No hay tratamientos registrados."}
        </p>
      </div>
    );

  return (
    <div className="ui-panel space-y-4">
      <div className="ui-toolbar">
        <h2 className="text-base font-semibold text-slate-100">{mostrarAtenciones ? "Atenciones registradas" : "Tratamientos registrados"}</h2>
        <span className="text-sm tabular-nums text-slate-400">{tratamientos.length} registros</span>
      </div>
      <div className="divide-y divide-slate-700/50">
        {tratamientosPaginados.map((t, index) => {
          const { Icono, color, bg, border } = obtenerIconoPaciente(t.sexo);

          return (
            <div
              key={t._id || index}
              onClick={() => onSeleccionar(t)}
              className="group flex cursor-pointer flex-col gap-3 rounded-md px-2 py-4 transition-colors hover:bg-[var(--surface-hover)] md:flex-row md:items-center md:gap-5"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border ${border} ${bg}`}
                >
                  <Icono className={`${color} text-base`} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-medium text-white text-sm leading-relaxed break-words">
                    {t.nombre}
                  </h4>
                  <div className="mt-1 text-slate-400 text-xs tabular-nums">
                    <span className="whitespace-normal">
                      {getAttentionDate(t) ? formatearFechaCita(getAttentionDate(t)) : "Sin fecha"}
                    </span>
                  </div>
                </div>
              </div>

              <AtencionPendienteBadge record={t} />

              <div className="min-w-0 md:w-2/5">
                <p className="mb-1 text-xs text-slate-400">
                  Servicio
                </p>
                <p className="text-sm leading-relaxed text-slate-300 break-words">
                  {formatearServicios(t.servicio)}
                </p>
              </div>
            </div>
          );
        })}
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
