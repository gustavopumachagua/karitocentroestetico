import { useMemo } from "react";
import { FaCalendarAlt, FaCamera, FaImages, FaUserMd } from "react-icons/fa";

export default function TratamientoCard({ tratamiento, onAbrirGaleria }) {
  const fechaFormateada = new Date(tratamiento.fecha).toLocaleDateString();
  const imagenes = useMemo(
    () => (tratamiento.imagenes || []).filter((img) => img?.url),
    [tratamiento.imagenes],
  );
  const totalImagenes = imagenes.length;
  const servicioFormateado = Array.isArray(tratamiento.servicio)
    ? tratamiento.servicio.join(", ")
    : tratamiento.servicio || "No registrado";

  return (
    <div className="glass-card overflow-hidden flex flex-col transition-all duration-300">
      {totalImagenes > 0 ? (
        <button
          type="button"
          onClick={onAbrirGaleria}
          className="group relative h-44 w-full overflow-hidden bg-slate-950/50 text-left focus:outline-none focus:ring-2 focus:ring-cyan-300/70 sm:h-52 cursor-pointer"
          aria-label="Ver galería del tratamiento"
        >
          <img
            src={imagenes[0].thumbnailUrl || imagenes[0].url}
            alt="Tratamiento"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20" />
          {totalImagenes > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-600/70 bg-slate-950/80 px-2.5 py-1 text-xs font-medium text-slate-100 shadow-lg">
              <FaImages className="text-cyan-300" />
              {totalImagenes}
            </span>
          )}
        </button>
      ) : (
        <div
          className="w-full h-44 sm:h-52 flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 23, 48, 0.9), rgba(8, 14, 32, 0.8))",
          }}
        >
          <FaCamera className="text-3xl text-slate-600" />
        </div>
      )}

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <FaCalendarAlt className="text-cyan-400/70 text-xs" />{" "}
            {fechaFormateada}
          </p>

          <p className="text-slate-200 mt-2 text-sm">
            <span className="font-semibold text-cyan-300">Servicio:</span>{" "}
            {servicioFormateado}
          </p>

          <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm flex-wrap">
            <FaUserMd className="text-violet-400/70 text-xs" />
            {tratamiento.profesional || "No registrado"}
            {tratamiento.rol && (
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg ml-1"
                style={{
                  background: "rgba(139, 92, 246, 0.12)",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  color: "#c4b5fd",
                }}
              >
                {tratamiento.rol}
              </span>
            )}
          </p>

          <p className="text-slate-500 mt-3 text-sm leading-snug">
            <span className="text-slate-300 font-medium">Observaciones:</span>{" "}
            {tratamiento.observacion || "Sin observaciones"}
          </p>
        </div>
      </div>
    </div>
  );
}
