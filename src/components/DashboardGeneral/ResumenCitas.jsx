import Skeleton from "../common/Skeleton";

export default function ResumenCitas({ data, loading }) {
  return (
    <section className="ui-panel">
      <div className="mb-5 flex min-w-0 flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-white tracking-tight">
          Resumen de citas
        </h3>
        <p className="text-xs text-slate-400">Estado de las citas en el período seleccionado</p>
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
        <ul className="grid grid-cols-1 divide-y divide-slate-700/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {data.map((cita, i) => (
            <li
              key={i}
              className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0 sm:flex-col sm:gap-2 sm:px-6 sm:py-0 sm:first:pl-0 sm:first:pt-0 sm:last:pr-0"
            >
              <span className="text-slate-300 font-medium text-sm">{cita.name}</span>
              <span
                className="shrink-0 text-3xl font-medium tracking-tight tabular-nums text-slate-100 sm:text-4xl"
              >
                {cita.value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
