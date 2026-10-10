/**
 * Browser storage keeps only application-owned references, never signed
 * Cloudinary links or image bytes. Legacy links are hints that a resource
 * exists, not authority: the backend resolves its owner and actual asset.
 */
const OBJECT_ID = /^[a-f\d]{24}$/i;
const MEDIA_PATH = /^\/api\/media\/(?:avatars\/[a-f\d]{24}|signatures\/[a-f\d]{24}|histories\/[a-f\d]{24}\/signature|treatments\/[a-f\d]{24}\/images\/(?:[a-f\d]{24}|0|[1-9]\d{0,2}))$/i;

const getId = (value) => String(value?._id || value?.id || value || "").trim();

export function persistedMediaReference(value) {
  if (typeof value !== "string" || !value.startsWith("/api/media/")) return "";
  try {
    const parsed = new URL(value, "https://application.invalid");
    if (parsed.origin !== "https://application.invalid" || parsed.hash ||
      value.split("?")[0] !== parsed.pathname || !MEDIA_PATH.test(parsed.pathname)) return "";
    for (const [key, entry] of parsed.searchParams) {
      if (key === "v" && /^\d{1,16}$/.test(entry)) continue;
      if (key === "variant" && entry === "thumbnail") continue;
      return "";
    }
    if ([...parsed.searchParams.keys()].length !== new Set(parsed.searchParams.keys()).size) return "";
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "";
  }
}

export function isLegacyCloudinaryImage(value, folder) {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" &&
      !parsed.username && !parsed.password && !parsed.search && !parsed.hash &&
      /^\/[^/]+\/image\/(?:upload|authenticated)\//.test(parsed.pathname) &&
      parsed.pathname.includes(`/${folder}/`);
  } catch {
    return false;
  }
}

export function protectedSignatureReference(value, { userId, historyId } = {}) {
  const safeReference = persistedMediaReference(value);
  if (safeReference && /^\/api\/media\/(?:signatures\/[^/?]+|histories\/[^/?]+\/signature)(?:\?|$)/.test(safeReference)) return safeReference;
  if (!isLegacyCloudinaryImage(value, "firmas")) return "";
  const documentId = getId(historyId);
  if (OBJECT_ID.test(documentId)) return `/api/media/histories/${documentId}/signature`;
  const ownerId = getId(userId);
  return OBJECT_ID.test(ownerId) ? `/api/media/signatures/${ownerId}` : "";
}

export function sanitizeAuthMediaUser(user) {
  if (!user || typeof user !== "object" || Array.isArray(user)) return user;
  const next = { ...user };
  const userId = getId(user);
  if (user.firmaDigital) next.firmaDigital = protectedSignatureReference(user.firmaDigital, { userId });
  if (user.avatar && isLegacyCloudinaryImage(user.avatar, "avatars")) {
    next.avatar = OBJECT_ID.test(userId) ? `/api/media/avatars/${userId}` : "";
  } else if (typeof user.avatar === "string" && (user.avatar.startsWith("/api/media/") || /^(?:blob:|data:)/i.test(user.avatar))) {
    const reference = persistedMediaReference(user.avatar);
    next.avatar = reference.startsWith("/api/media/avatars/") ? reference : "";
  }
  // Internal provider metadata is neither needed nor trusted in a session.
  for (const key of ["avatarAsset", "firmaDigitalAsset", "avatarPublicId", "firmaDigitalPublicId", "retiredMediaAssets"]) delete next[key];
  return next;
}

export function sanitizeClinicalHistoryMedia(record, userId) {
  if (!record || typeof record !== "object") return record;
  const reference = protectedSignatureReference(record.signatureUrl || record.firmaMedico?.url || record.formData?.firmaDigital || "", {
    historyId: record.remoteId || record._id,
    userId: record.ownerId || userId || record.medico,
  });
  const next = { ...record, signatureUrl: reference };
  if (record.firmaMedico) {
    next.firmaMedico = { ...record.firmaMedico, url: reference };
    delete next.firmaMedico.asset;
  }
  if (record.formData?.firmaDigital) next.formData = { ...record.formData, firmaDigital: reference };
  return next;
}
