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
        className="px-3 py-2 bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-indigo-600 transition"
      >
        <FaArrowLeft />
      </button>

      <span className="text-gray-300">
        Página {paginaActual} de {totalPaginas}
      </span>

      <button
        onClick={() => cambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className="px-3 py-2 bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-indigo-600 transition cursor-pointer"
      >
        <FaArrowRight />
      </button>
    </div>
  );
}
