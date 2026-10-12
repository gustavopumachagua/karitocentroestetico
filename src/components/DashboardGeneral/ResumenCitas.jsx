import { FaClipboardList } from "react-icons/fa";
import Skeleton from "../common/Skeleton";

export default function ResumenCitas({ data, loading }) {
  return (
    <div className="ui-panel ui-chart-card">
      <div className="ui-chart-header flex min-w-0 items-start gap-3">
        <div className="ui-chart-icon">
          <FaClipboardList className="text-lg" />
        </div>
        <h3 className="text-lg font-semibold text-white tracking-tight">
          Resumen de Citas Total
        </h3>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 px-2">
              <Skeleton variant="text" width="120px" height="14px" />
              <Skeleton variant="rect" width="60px" height="28px" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-slate-700/60">
          {data.map((cita, i) => (
            <li
              key={i}
              className="flex justify-between items-center gap-4 py-4 px-1 rounded-lg transition-colors hover:bg-white/[0.03]"
            >
              <span className="text-slate-300 font-medium text-sm">{cita.name}</span>
              <span
                className="shrink-0 font-semibold tabular-nums text-lg px-3 py-1 rounded-lg"
                style={{
                  background: 'var(--surface-raised, #1E293B)',
                  border: '1px solid var(--line-strong, #2B3648)',
                  color: 'var(--text-primary, #F1F5F9)',
                }}
              >
                {cita.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
