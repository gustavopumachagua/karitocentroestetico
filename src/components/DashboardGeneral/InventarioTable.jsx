import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Skeleton, { SkeletonTableRow } from "../common/Skeleton";

export default function InventarioTable({ data, mostrarSoloBajos, loading }) {
  const inventarioFiltrado = mostrarSoloBajos
    ? data.filter((item) => item.cantidad < item.umbral)
    : data;

  return (
    <div className="min-w-0">
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
        <div role="region" tabIndex={0} aria-label="Estado del inventario: tabla desplazable" className="ui-table-wrap overflow-auto max-h-[420px] custom-scroll">
          <table aria-label="Estado de stock de insumos" className="ui-table min-w-[360px]">
            <thead>
              <tr className="text-slate-300 text-xs sticky top-0 z-10"
                style={{ background: 'var(--surface-raised, #22252A)', borderBottom: '1px solid var(--line-soft, #303238)' }}
              >
                <th scope="col" className="p-3 text-left font-semibold">Insumo</th>
                <th scope="col" className="p-3 text-center font-semibold">Cantidad</th>
                <th scope="col" className="p-3 text-center font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item, i) => (
                <tr
                  key={i}
                  className="transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: '1px solid var(--line-soft, #303238)' }}
                >
                  <td className="p-3 font-medium">{item.insumo}</td>
                  <td className="p-3 text-center tabular-nums">{item.cantidad}</td>
                  <td className="p-3 text-center">
                    {item.cantidad < item.umbral ? (
                      <span className="inline-flex items-center whitespace-nowrap gap-1.5 text-amber-300 font-medium text-xs">
                        <FaExclamationTriangle className="text-[10px]" /> Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap gap-1.5 text-slate-300 font-medium text-xs">
                        <FaCheckCircle className="text-[10px] text-emerald-300" /> Suficiente
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
