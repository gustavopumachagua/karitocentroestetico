import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { getAuthToken } from "../../services/authStorage";
import ProtectedImage from "../common/ProtectedImage";
import { resolveProtectedImageSource } from "../../api/media.api";

export default function AvatarUploader({ avatar, setAvatar, userId }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleCameraClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("El tamaño máximo es de 2 MB.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Error al subir imagen");

      setAvatar(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex max-w-full flex-col items-center">
      <div className="relative">
        <ProtectedImage
          src={resolveProtectedImageSource(avatar, { kind: "avatars", userId })}
          fallbackSrc="/avatar-default.svg"
          alt="Foto de perfil"
          className="h-28 w-28 rounded-full border-2 border-slate-600 object-cover"
        />
        <button
          type="button"
          onClick={handleCameraClick}
          disabled={uploading}
          aria-label="Cambiar foto de perfil"
          className={`absolute -bottom-1 -right-1 inline-flex h-11 w-11 items-center justify-center rounded-full border-4 border-slate-800 bg-indigo-300 text-slate-950 transition-colors hover:bg-indigo-200 ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FaCamera size={16} />
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading && (
        <p className="text-xs text-slate-400 mt-2 animate-pulse">
          Subiendo imagen...
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 max-w-full break-words text-center text-xs text-rose-300">{error}</p>
      )}
    </div>
  );
}
