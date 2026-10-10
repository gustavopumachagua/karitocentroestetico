import { useProtectedImage } from "../../hooks/useProtectedImage";
import { isLocalImageSource } from "../../api/media.api";

/** No anonymous remote fallback: a denied private image remains denied. */
export default function ProtectedImage({ src, alt = "Imagen", fallbackSrc, className, style, ...props }) {
  const image = useProtectedImage(src);
  const fallback = useProtectedImage((image.error || !src) && isLocalImageSource(fallbackSrc) ? fallbackSrc : "");
  const visibleSource = image.src || fallback.src;
  if (!visibleSource) {
    return (
      <span
        className={className}
        style={{ display: "inline-block", ...style }}
        role="img"
        aria-label={image.loading ? `Cargando ${alt.toLowerCase()}` : `${alt}: imagen no disponible`}
        title={image.error?.message}
        aria-busy={image.loading || undefined}
      />
    );
  }
  return <img {...props} src={visibleSource} alt={alt} className={className} style={style} />;
}
