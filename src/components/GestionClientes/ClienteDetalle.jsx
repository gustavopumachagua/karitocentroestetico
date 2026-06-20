import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaMale,
  FaFemale,
  FaVenusMars,
  FaMoneyBillWave,
  FaClinicMedical,
  FaPhoneAlt,
  FaTimes,
} from "react-icons/fa";
import TratamientoCard from "./TratamientoCard";
import Paginacion from "../HistorialPacientes/Paginacion";

export default function ClienteDetalle({ cliente, volver }) {
  const tratamientosPorPagina = 9;
  const [paginaActual, setPaginaActual] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(null);

  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
        ? FaFemale
        : FaUser;

  const totalPaginas = Math.ceil(
    cliente.tratamientos.length / tratamientosPorPagina,
  );
  const indiceInicioTratamientos =
    (paginaActual - 1) * tratamientosPorPagina;

  const tratamientosVisibles = useMemo(() => {
    const inicio = indiceInicioTratamientos;
    const fin = inicio + tratamientosPorPagina;
    return cliente.tratamientos.slice(inicio, fin);
  }, [cliente.tratamientos, indiceInicioTratamientos]);

  const imagenesGaleria = useMemo(
    () =>
      cliente.tratamientos.flatMap((tratamiento, tratamientoIndex) =>
        (tratamiento.imagenes || [])
          .filter((img) => img?.url)
          .map((img, imagenIndex) => ({
            ...img,
            tratamientoIndex,
            imagenIndex,
          })),
      ),
    [cliente.tratamientos],
  );

  const modalAbierto = imagenActiva !== null;
  const totalImagenes = imagenesGaleria.length;
  const imagenSeleccionada = modalAbierto
    ? imagenesGaleria[imagenActiva]
    : null;

  const abrirGaleria = useCallback(
    (tratamientoIndex) => {
      const index = imagenesGaleria.findIndex(
        (img) => img.tratamientoIndex === tratamientoIndex,
      );

      if (index !== -1) setImagenActiva(index);
    },
    [imagenesGaleria],
  );

  const cerrarGaleria = useCallback(() => setImagenActiva(null), []);

  const mostrarAnterior = useCallback(() => {
    setImagenActiva((index) => {
      if (index === null || totalImagenes === 0) return index;
      return index === 0 ? totalImagenes - 1 : index - 1;
    });
  }, [totalImagenes]);

  const mostrarSiguiente = useCallback(() => {
    setImagenActiva((index) => {
      if (index === null || totalImagenes === 0) return index;
      return index === totalImagenes - 1 ? 0 : index + 1;
    });
  }, [totalImagenes]);

  useEffect(() => {
    if (imagenActiva !== null && imagenActiva >= totalImagenes) {
      setImagenActiva(totalImagenes > 0 ? totalImagenes - 1 : null);
    }
  }, [imagenActiva, totalImagenes]);

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
    <>
      <div className="animate-fade-in">
        <button
          onClick={volver}
          className="flex items-center gap-2 mb-8 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 cursor-pointer text-sm font-medium"
        >
          <FaArrowLeft /> Volver a clientes
        </button>

        <div className="glass-card p-6 sm:p-8">
          {/* Header del cliente */}
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6"
            style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.08)" }}
          >
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "rgba(34, 211, 238, 0.08)",
                border: "1px solid rgba(34, 211, 238, 0.15)",
              }}
            >
              <IconoUsuario className="text-cyan-400 text-2xl" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {cliente.nombre}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className="text-slate-400 flex items-center gap-2 text-sm">
                  <FaVenusMars className="text-pink-400/70" /> {cliente.sexo}
                </p>

                {cliente.celular && (
                  <p className="text-slate-400 flex items-center gap-2 text-sm">
                    <FaPhoneAlt className="text-blue-400/70" />{" "}
                    {cliente.celular}
                  </p>
                )}

                <p className="flex items-center gap-2 text-sm">
                  <FaMoneyBillWave className="text-emerald-400/70" />
                  <span className="text-emerald-400 font-semibold">
                    S/ {cliente.totalInvertido.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Título de tratamientos */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "rgba(129, 140, 248, 0.10)",
                border: "1px solid rgba(129, 140, 248, 0.15)",
              }}
            >
              <FaClinicMedical className="text-indigo-400 text-lg" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Historial de tratamientos
            </h3>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(129, 140, 248, 0.08)",
                border: "1px solid rgba(129, 140, 248, 0.15)",
                color: "#a5b4fc",
              }}
            >
              {cliente.tratamientos.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tratamientosVisibles.map((t, idx) => {
              const tratamientoIndex = indiceInicioTratamientos + idx;

              return (
                <TratamientoCard
                  key={t._id || tratamientoIndex}
                  tratamiento={t}
                  onAbrirGaleria={() => abrirGaleria(tratamientoIndex)}
                />
              );
            })}
          </div>

          {cliente.tratamientos.length > tratamientosPorPagina && (
            <div className="mt-6">
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                cambiarPagina={setPaginaActual}
              />
            </div>
          )}
        </div>
      </div>

      {modalAbierto && imagenSeleccionada && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/95 px-3 py-4 backdrop-blur-sm sm:px-6"
          onClick={cerrarGaleria}
          role="dialog"
          aria-modal="true"
          aria-label="Galería de imágenes del historial de tratamientos"
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
    </>
  );
}
