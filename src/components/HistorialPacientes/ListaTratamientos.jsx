import { useState } from "react";
import {
  FaCalendarAlt,
  FaFemale,
  FaMale,
  FaStethoscope,
  FaUser,
} from "react-icons/fa";
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

  const obtenerIconoPaciente = (sexo) => {
    const sexoNormalizado = sexo?.toLowerCase();
    if (sexoNormalizado === "masculino") {
      return {
        Icono: FaMale,
        color: "text-cyan-300",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/15",
      };
    }
    if (sexoNormalizado === "femenino") {
      return {
        Icono: FaFemale,
        color: "text-pink-300",
        bg: "bg-pink-400/10",
        border: "border-pink-400/15",
      };
    }
    return {
      Icono: FaUser,
      color: "text-violet-300",
      bg: "bg-violet-400/10",
      border: "border-violet-400/15",
    };
  };

  if (tratamientos.length === 0)
    return (
      <div className="page-panel page-panel-pad text-center">
        <p className="text-slate-400 text-base italic">
          No hay tratamientos registrados.
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {tratamientosPaginados.map((t, index) => {
          const { Icono, color, bg, border } = obtenerIconoPaciente(t.sexo);

          return (
            <div
              key={t._id || index}
              onClick={() => onSeleccionar(t)}
              className="glass-card glow-border p-5 sm:p-6 min-h-[210px] cursor-pointer flex flex-col justify-between gap-5 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${border} ${bg}`}
                >
                  <Icono className={`${color} text-2xl`} />
                </div>

                <div className="min-w-0">
                  <h4 className="font-semibold text-white text-lg leading-snug break-words">
                    {t.nombre}
                  </h4>
                  <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm">
                    <FaCalendarAlt className="text-amber-300 flex-shrink-0" />
                    <span className="whitespace-normal">
                      {formatearFecha(t.fecha)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-950/25 p-3">
                <p className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <FaStethoscope className="text-emerald-300" />
                  Servicio
                </p>
                <p className="text-sm font-medium leading-relaxed text-cyan-100 break-words">
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
