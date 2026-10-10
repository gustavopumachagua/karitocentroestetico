import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getProtectedImageBlob, isLocalImageSource, isProtectedMediaSource } from "../api/media.api";

/** Private image bytes live only in memory and are revoked when identity/source changes. */
export const useProtectedImage = (source) => {
  const { token, user } = useAuth();
  const identity = `${token || ""}:${user?._id || user?.id || ""}`;
  const key = `${identity}:${source || ""}`;
  const local = isLocalImageSource(source);
  const protectedSource = isProtectedMediaSource(source);
  const [image, setImage] = useState({ key: "", src: "", error: null });

  useEffect(() => {
    if (!protectedSource || !token) return undefined;
    const controller = new AbortController();
    let objectUrl = "";
    getProtectedImageBlob(source, { signal: controller.signal })
      .then((blob) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ key, src: objectUrl, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setImage({ key, src: "", error });
      });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key, protectedSource, source, token]);

  if (local) return { src: source, loading: false, error: null };
  if (!source) return { src: "", loading: false, error: null };
  if (!protectedSource || !token) {
    return { src: "", loading: false, error: new Error("La imagen requiere una sesión y referencia protegida.") };
  }
  const current = image.key === key ? image : null;
  return { src: current?.src || "", loading: !current, error: current?.error || null };
};
