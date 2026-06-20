import { FaClipboardList } from "react-icons/fa";
import Skeleton from "../common/Skeleton";

export default function ResumenCitas({ data, loading }) {
  return (
    <div className="glass-card p-6 transition-all duration-300">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'rgba(129, 140, 248, 0.10)', border: '1px solid rgba(129, 140, 248, 0.15)' }}
        >
          <FaClipboardList className="text-indigo-400 text-lg" />
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
        <ul className="divide-y divide-white/[0.06]">
          {data.map((cita, i) => (
            <li
              key={i}
              className="flex justify-between items-center py-3 px-2 rounded-lg transition-colors hover:bg-white/[0.03]"
            >
              <span className="text-slate-300 font-medium text-sm">{cita.name}</span>
              <span
                className="font-semibold text-sm px-3 py-1 rounded-lg"
                style={{
                  background: 'rgba(129, 140, 248, 0.08)',
                  border: '1px solid rgba(129, 140, 248, 0.15)',
                  color: '#c7d2fe',
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
