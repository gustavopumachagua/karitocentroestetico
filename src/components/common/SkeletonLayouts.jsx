import Skeleton, { SkeletonCard, SkeletonTableRow } from "./Skeleton";

/**
 * DashboardSkeleton — Layout skeleton para paneles de dashboard.
 */
export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in flex flex-col gap-6">
      {/* Filtros */}
      <div className="glass-card p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skeleton variant="circle" width="32px" height="32px" />
          <Skeleton variant="text" width="180px" height="20px" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Skeleton variant="rect" height="40px" />
          <Skeleton variant="rect" height="40px" />
        </div>
      </div>

      {/* Cards de resumen + gráfico */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton variant="circle" width="36px" height="36px" />
            <Skeleton variant="text" width="200px" height="20px" />
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 px-2">
                <Skeleton variant="text" width="120px" height="14px" />
                <Skeleton variant="rect" width="60px" height="28px" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Skeleton variant="circle" width="36px" height="36px" />
            <Skeleton variant="text" width="260px" height="20px" />
          </div>
          <Skeleton variant="chart" height="320px" />
        </div>
      </div>

      {/* Gráfico + Tabla */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6">
            <Skeleton variant="text" width="180px" height="18px" className="mb-4" />
            <Skeleton variant="rect" height="36px" />
          </div>
          <TableSkeleton rows={4} cols={3} />
        </div>
      </div>
    </div>
  );
}

/**
 * TableSkeleton — Tabla skeleton con filas y columnas.
 */
export function TableSkeleton({ rows = 5, cols = 5, className = "" }) {
  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/8">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3.5">
                <Skeleton variant="text" height="12px" width={`${60 + Math.random() * 30}%`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * CardGridSkeleton — Grid de tarjetas skeleton.
 */
export function CardGridSkeleton({ count = 6, cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`animate-fade-in grid ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * ChartSkeleton — Placeholder de gráfico.
 */
export function ChartSkeleton({ height = "340px", className = "" }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-5">
        <Skeleton variant="circle" width="36px" height="36px" />
        <Skeleton variant="text" width="220px" height="20px" />
      </div>
      <Skeleton variant="chart" height={height} />
    </div>
  );
}

/**
 * FormSkeleton — Placeholder de formulario.
 */
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="glass-card p-6 animate-fade-in">
      <Skeleton variant="text" width="200px" height="22px" className="mb-6" />
      <div className="flex flex-col gap-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton variant="text" width="100px" height="12px" className="mb-2" />
            <Skeleton variant="rect" height="42px" />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Skeleton variant="rect" height="44px" width="140px" />
      </div>
    </div>
  );
}
