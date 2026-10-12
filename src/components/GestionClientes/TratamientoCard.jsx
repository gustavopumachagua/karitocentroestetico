import { useMemo } from "react";
import { FaCalendarAlt, FaCamera, FaImages, FaUserMd } from "react-icons/fa";
import { formatearFechaCita } from "../../utils/citasFecha";
import { getProfessionalDisplayName } from "../../utils/professionalDirectory";
import { getAttentionDate, isPendingTreatmentRecord } from "../../utils/attentionHistory";
import AtencionPendienteBadge from "../HistorialPacientes/AtencionPendienteBadge";
import ProtectedImage from "../common/ProtectedImage";

export default function TratamientoCard({
  tratamiento,
  onAbrirGaleria,
  professionalNamesById,
}) {
  const esAtencionPendiente = isPendingTreatmentRecord(tratamiento);
  const fechaFormateada = formatearFechaCita(getAttentionDate(tratamiento));
  const imagenes = useMemo(
    () => (tratamiento.imagenes || []).filter((img) => img?.url),
    [tratamiento.imagenes],
  );
  const totalImagenes = imagenes.length;
  const servicioFormateado = Array.isArray(tratamiento.servicio)
    ? tratamiento.servicio.join(", ")
    : tratamiento.servicio || "No registrado";
  const nombreProfesional = getProfessionalDisplayName(
    tratamiento,
    professionalNamesById,
  );

  return (
    <div className="ui-card ui-card-interactive flex min-w-0 flex-col overflow-hidden p-0">
      {totalImagenes > 0 ? (
        <button
          type="button"
          onClick={onAbrirGaleria}
          className="group relative h-44 w-full overflow-hidden bg-slate-950/50 text-left focus:outline-none focus:ring-2 focus:ring-indigo-300/70 sm:h-52 cursor-pointer"
          aria-label="Ver galería del tratamiento"
        >
          <ProtectedImage
            src={imagenes[0].thumbnailUrl || imagenes[0].url}
            alt="Tratamiento"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20" />
          {totalImagenes > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-slate-100 shadow-lg">
              <FaImages className="text-indigo-300" />
              {totalImagenes}
            </span>
          )}
        </button>
      ) : (
        <div
          className="flex h-44 w-full items-center justify-center bg-[var(--surface-subtle)] sm:h-52"
        >
          <FaCamera className="text-3xl text-slate-600" />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <FaCalendarAlt className="text-indigo-400/70 text-xs" />{" "}
            {fechaFormateada}
          </p>

          <AtencionPendienteBadge record={tratamiento} className="mt-3" />

          <p className="mt-2 text-sm leading-relaxed text-slate-200 break-words">
            <span className="font-semibold text-indigo-300">Servicio:</span>{" "}
            {servicioFormateado}
          </p>

          <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm flex-wrap">
            <FaUserMd className="text-indigo-400/70 text-xs" />
            {nombreProfesional || "No registrado"}
            {tratamiento.rol && (
              <span
                className="ui-status"
              >
                {tratamiento.rol}
              </span>
            )}
          </p>

          {!esAtencionPendiente && (
            <p className="mt-3 text-sm leading-relaxed text-slate-400 break-words">
              <span className="text-slate-300 font-medium">Observaciones:</span>{" "}
              {tratamiento.observacion || "Sin observaciones"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
