import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function Paginacion({
  paginaActual,
  totalPaginas,
  cambiarPagina,
}) {
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => cambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/35 text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <FaArrowLeft />
      </button>

      <span className="rounded-lg border border-slate-700/70 bg-slate-950/25 px-3 py-2 text-sm text-slate-300">
        Página {paginaActual} de {totalPaginas}
      </span>

      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-950/35 text-cyan-100 transition hover:border-cyan-400/35 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
