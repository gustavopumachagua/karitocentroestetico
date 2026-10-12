import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function Paginacion({
  paginaActual,
  totalPaginas,
  cambiarPagina,
}) {
  return (
    <div className="mt-5 flex min-w-0 flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
        className="ui-icon-button shrink-0"
      >
        <FaArrowLeft />
      </button>

      <span aria-live="polite" className="px-1 py-2 text-center text-sm tabular-nums text-slate-300 sm:px-3">
        Página {paginaActual} de {totalPaginas}
      </span>

      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
        className="ui-icon-button shrink-0"
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
