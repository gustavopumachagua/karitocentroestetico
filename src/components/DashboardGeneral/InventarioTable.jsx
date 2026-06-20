import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Skeleton, { SkeletonTableRow } from "../common/Skeleton";

export default function InventarioTable({ data, mostrarSoloBajos, loading }) {
  const inventarioFiltrado = mostrarSoloBajos
    ? data.filter((item) => item.cantidad < item.umbral)
    : data;

  return (
    <section className="glass-card p-6 transition-all duration-300">
      <h3 className="text-lg font-semibold text-red-400/90 mb-6 text-center tracking-tight">
        Estado de Stock de Insumos
      </h3>

      {loading ? (
        <div className="overflow-hidden rounded-xl">
          <table className="min-w-full">
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
        <p className="flex items-center justify-center gap-2 py-8 text-center text-slate-500 italic text-sm">
          {mostrarSoloBajos && <FaCheckCircle className="text-emerald-400" />}
          {mostrarSoloBajos
            ? "Todos los insumos tienen stock suficiente."
            : "No hay insumos registrados en el inventario."}
        </p>
      ) : (
        <div className="overflow-y-auto max-h-[420px] rounded-xl" style={{ scrollbarWidth: 'thin' }}>
          <table className="min-w-full border-collapse text-slate-200 text-sm">
            <thead>
              <tr className="uppercase text-slate-500 text-xs sticky top-0 z-10"
                style={{ background: 'rgba(15, 23, 48, 0.95)', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}
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
                  style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}
                >
                  <td className="p-3 font-medium">{item.insumo}</td>
                  <td className="p-3 text-center">{item.cantidad}</td>
                  <td className="p-3 text-center">
                    {item.cantidad < item.umbral ? (
                      <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                      >
                        <FaExclamationTriangle className="text-[10px]" /> Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs px-2.5 py-1 rounded-lg"
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
