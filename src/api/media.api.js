import { getAuthToken } from "../services/authStorage.js";
import { persistedMediaReference } from "../utils/protectedMediaReference.js";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Accept only owned API resources, never a provider URL or arbitrary proxy target. */
export const normalizeProtectedMediaPath = persistedMediaReference;

export const isProtectedMediaSource = (source) => Boolean(normalizeProtectedMediaPath(source));

/** Local previews and bundled design assets contain no remote private media URL. */
export const isLocalImageSource = (source) =>
  typeof source === "string" &&
  !/(?:^|\/)\.\.(?:\/|$)|\\/.test(source) &&
  (/^blob:/.test(source) ||
    /^data:image\/(?:jpeg|png|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/.test(source) ||
    /^\/(?:assets|src\/assets)\/[a-zA-Z0-9_./-]+(?:\?[a-zA-Z0-9_=&.-]*)?$/.test(source) ||
    /^\/(?:Logo(?:_SEO)?\.(?:jpg|png)|vista_projects\.png|avatar-default\.svg)$/.test(source));

/** Resolve old own-profile snapshots by immutable identity, never by a public URL. */
export const resolveProtectedImageSource = (source, { kind, userId } = {}) => {
  if (!source || isProtectedMediaSource(source) || isLocalImageSource(source)) return source || "";
  if (/^[a-fA-F0-9]{24}$/.test(String(userId || "")) && ["avatars", "signatures"].includes(kind)) {
    return `/api/media/${kind}/${userId}`;
  }
  return "";
};

const mediaError = (message, status) => Object.assign(new Error(message), { status });

/** The upstream Cloudinary URL and credentials never reach the browser. */
export const getProtectedImageBlob = async (source, { signal } = {}) => {
  const path = normalizeProtectedMediaPath(source);
  if (!path) throw mediaError("La imagen no tiene una referencia protegida válida.", 400);
  const token = getAuthToken();
  if (!token) throw mediaError("Inicia sesión para acceder a esta imagen.", 401);
  const assertActiveSession = () => {
    if (signal?.aborted) throw new DOMException("Solicitud cancelada.", "AbortError");
    if (getAuthToken() !== token) throw mediaError("La sesión cambió mientras se obtenía la imagen.", 401);
  };
  assertActiveSession();
  const configuredBase = String(import.meta.env?.VITE_API_URL || "").replace(/\/+$/, "");
  const response = await fetch(`${configuredBase}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "image/jpeg,image/png,image/webp" },
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    signal,
  });
  assertActiveSession();
  if (!response.ok) {
    throw mediaError(
      response.status === 401 ? "Tu sesión no permite acceder a esta imagen." :
        response.status === 403 ? "No tienes permiso para ver esta imagen." :
          "No se pudo obtener la imagen protegida.",
      response.status,
    );
  }
  const declaredSize = Number(response.headers.get("content-length"));
  if (declaredSize > MAX_IMAGE_BYTES) throw mediaError("La imagen supera el tamaño permitido.", 413);
  const blob = await response.blob();
  assertActiveSession();
  if (!ALLOWED_IMAGE_TYPES.has(blob.type.split(";")[0].toLowerCase()) || blob.size > MAX_IMAGE_BYTES) {
    throw mediaError("La respuesta no es una imagen permitida.", 415);
  }
  return blob;
};
