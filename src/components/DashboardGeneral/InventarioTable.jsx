import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Skeleton, { SkeletonTableRow } from "../common/Skeleton";

export default function InventarioTable({ data, mostrarSoloBajos, loading }) {
  const inventarioFiltrado = mostrarSoloBajos
    ? data.filter((item) => item.cantidad < item.umbral)
    : data;

  return (
    <section className="ui-panel min-w-0">
      <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-6 tracking-tight">
        Estado de Stock de Insumos
      </h3>

      {loading ? (
        <div className="ui-table-shell overflow-x-auto rounded-xl">
          <table className="min-w-[360px] w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Insumo", "Cantidad", "Estado"].map((h) => (
                  <th key={h} className="p-3">
                    <Skeleton variant="text" height="12px" width="70%" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonTableRow key={i} cols={3} />
              ))}
            </tbody>
          </table>
        </div>
      ) : inventarioFiltrado.length === 0 ? (
        <p className="flex items-center justify-center gap-2 py-8 text-center text-slate-400 text-sm">
          {mostrarSoloBajos && <FaCheckCircle className="text-emerald-400" />}
          {mostrarSoloBajos
            ? "Todos los insumos tienen stock suficiente."
            : "No hay insumos registrados en el inventario."}
        </p>
      ) : (
        <div className="ui-table-shell overflow-auto max-h-[420px] rounded-xl custom-scroll">
          <table className="min-w-[360px] w-full border-collapse text-slate-200 text-sm">
            <thead>
              <tr className="text-slate-300 text-xs sticky top-0 z-10"
                style={{ background: 'var(--surface-raised, #1E293B)', borderBottom: '1px solid var(--line-soft, #2B3648)' }}
              >
                <th className="p-3 text-left font-semibold">Insumo</th>
                <th className="p-3 text-center font-semibold">Cantidad</th>
                <th className="p-3 text-center font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid var(--line-soft, #2B3648)' }}
                >
                  <td className="p-3 font-medium">{item.insumo}</td>
                  <td className="p-3 text-center tabular-nums">{item.cantidad}</td>
                  <td className="p-3 text-center">
                    {item.cantidad < item.umbral ? (
                      <span className="inline-flex items-center whitespace-nowrap gap-1.5 text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
                      >
                        <FaExclamationTriangle className="text-[10px]" /> Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap gap-1.5 text-emerald-300 font-semibold text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.15)' }}
                      >
                        <FaCheckCircle className="text-[10px]" /> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
