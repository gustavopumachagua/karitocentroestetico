import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaNotesMedical,
  FaTimes,
} from "react-icons/fa";

export default function ObservacionesImagenes({ paciente }) {
  const imagenes = useMemo(
    () => (paciente.imagenes || []).filter((img) => img?.url),
    [paciente.imagenes],
  );
  const [imagenActiva, setImagenActiva] = useState(null);
  const modalAbierto = imagenActiva !== null;
  const totalImagenes = imagenes.length;
  const imagenSeleccionada = modalAbierto ? imagenes[imagenActiva] : null;

  const abrirGaleria = (index) => setImagenActiva(index);
  const cerrarGaleria = useCallback(() => setImagenActiva(null), []);

  const mostrarAnterior = useCallback(() => {
    setImagenActiva((index) =>
      index === 0 ? totalImagenes - 1 : Math.max(index - 1, 0),
    );
  }, [totalImagenes]);

  const mostrarSiguiente = useCallback(() => {
    setImagenActiva((index) =>
      index === totalImagenes - 1 ? 0 : Math.min(index + 1, totalImagenes - 1),
    );
  }, [totalImagenes]);

  useEffect(() => {
    if (!modalAbierto) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") cerrarGaleria();
      if (event.key === "ArrowLeft" && totalImagenes > 1) mostrarAnterior();
      if (event.key === "ArrowRight" && totalImagenes > 1) mostrarSiguiente();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    cerrarGaleria,
    modalAbierto,
    mostrarAnterior,
    mostrarSiguiente,
    totalImagenes,
  ]);

  return (
    <div className="space-y-6">
      {paciente.observacion && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <FaNotesMedical className="text-rose-300" />
            <h4 className="font-semibold text-white">Observación</h4>
          </div>
          <p className="italic text-slate-300 text-sm sm:text-base leading-relaxed break-words">
            {paciente.observacion}
          </p>
        </div>
      )}

      {imagenes.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <FaImages className="text-violet-300" />
            <h4 className="text-white font-medium">
              Imágenes del tratamiento
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {imagenes.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => abrirGaleria(i)}
                className="group relative h-32 w-full overflow-hidden rounded-lg border border-slate-700/70 bg-slate-950/50 transition duration-300 hover:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 sm:h-28"
                aria-label={`Ver imagen ${i + 1} del tratamiento`}
              >
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={`Tratamiento ${i + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/20" />
              </button>
            ))}
          </div>
        </div>
      )}

      {modalAbierto && imagenSeleccionada && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 px-3 py-4 backdrop-blur-sm sm:px-6"
          onClick={cerrarGaleria}
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes del tratamiento"
        >
          <div
            className="relative flex h-full w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-slate-200">
              <span className="rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-sm">
                {imagenActiva + 1} / {totalImagenes}
              </span>
              <button
                type="button"
                onClick={cerrarGaleria}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/80 text-slate-100 transition hover:border-cyan-300/70 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 cursor-pointer"
                aria-label="Cerrar galería"
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              {totalImagenes > 1 && (
                <button
                  type="button"
                  onClick={mostrarAnterior}
                  className="absolute left-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-600/80 bg-slate-950/80 text-slate-100 shadow-lg transition hover:border-cyan-300/70 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 sm:left-3 sm:h-12 sm:w-12 cursor-pointer"
                  aria-label="Imagen anterior"
                  title="Anterior"
                >
                  <FaChevronLeft />
                </button>
              )}

              <img
                src={imagenSeleccionada.url}
                alt={`Tratamiento ${imagenActiva + 1}`}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              />

              {totalImagenes > 1 && (
                <button
                  type="button"
                  onClick={mostrarSiguiente}
                  className="absolute right-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-600/80 bg-slate-950/80 text-slate-100 shadow-lg transition hover:border-cyan-300/70 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/70 sm:right-3 sm:h-12 sm:w-12 cursor-pointer"
                  aria-label="Imagen siguiente"
                  title="Siguiente"
                >
                  <FaChevronRight />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
