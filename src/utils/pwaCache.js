const LEGACY_SENSITIVE_CACHE_PREFIXES = ["karito-api-cache"];

const hasCacheStorage = () =>
  typeof globalThis !== "undefined" &&
  typeof globalThis.caches?.keys === "function";

/**
 * Removes runtime caches that may have contained authenticated API responses
 * in previous application versions. Static application assets are deliberately
 * left intact, so clearing this data never changes the offline shell UX.
 *
 * This is safe to call at application start and again during logout.
 */
export async function clearSensitivePwaCaches() {
  if (!hasCacheStorage()) return 0;

  try {
    const cacheNames = await globalThis.caches.keys();
    const sensitiveCacheNames = cacheNames.filter((cacheName) =>
      LEGACY_SENSITIVE_CACHE_PREFIXES.some((prefix) =>
        cacheName.startsWith(prefix),
      ),
    );

    await Promise.all(
      sensitiveCacheNames.map((cacheName) => globalThis.caches.delete(cacheName)),
    );

    return sensitiveCacheNames.length;
  } catch {
    // Cache Storage can be unavailable in privacy-restricted browser contexts.
    // It must never prevent the application from starting or logging out.
    return 0;
  }
}

