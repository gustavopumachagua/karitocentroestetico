/**
 * Skeleton — Componente base reutilizable para estados de carga.
 *
 * Variantes:
 *   text    → línea de texto
 *   circle  → avatar circular
 *   rect    → bloque rectangular
 *   chart   → placeholder de gráfico
 *
 * Props:
 *   variant  — "text" | "circle" | "rect" | "chart"
 *   width    — ancho CSS (e.g. "100%", "200px")
 *   height   — alto CSS
 *   className — clases extras
 *   count    — repetir N veces (solo text)
 */
export default function Skeleton({
  variant = "rect",
  width,
  height,
  className = "",
  count = 1,
}) {
  const baseClass =
    variant === "circle" ? "skeleton-circle" : "skeleton";

  const defaultStyles = {
    text: { width: width || "100%", height: height || "14px" },
    circle: { width: width || "44px", height: height || "44px" },
    rect: { width: width || "100%", height: height || "80px" },
    chart: { width: width || "100%", height: height || "280px" },
  };

  const style = defaultStyles[variant] || defaultStyles.rect;

  if (variant === "text" && count > 1) {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={baseClass}
            style={{
              ...style,
              width: i === count - 1 ? "65%" : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClass} ${className}`}
      style={style}
    />
  );
}

/**
 * SkeletonCard — Tarjeta completa con avatar + líneas
 */
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton variant="circle" width="48px" height="48px" />
        <div className="flex-1">
          <Skeleton variant="text" height="16px" width="60%" />
          <div className="mt-2">
            <Skeleton variant="text" height="12px" width="40%" />
          </div>
        </div>
      </div>
      <Skeleton variant="text" count={3} height="12px" />
    </div>
  );
}

/**
 * SkeletonTableRow — Fila de tabla skeleton
 */
export function SkeletonTableRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            variant="text"
            height="14px"
            width={i === 0 ? "70%" : i === cols - 1 ? "50%" : "80%"}
          />
        </td>
      ))}
    </tr>
  );
}
