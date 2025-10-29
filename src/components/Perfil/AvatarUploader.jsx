import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";

export default function AvatarUploader({ avatar, setAvatar }) {
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
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Error al subir imagen");

      setAvatar(data.url);
    } catch (err) {
      console.error("Error al subir imagen:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <img
        src={avatar}
        alt="Foto de perfil"
        className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md object-cover"
      />
      <button
        type="button"
        onClick={handleCameraClick}
        disabled={uploading}
        className={`absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition active:scale-95 cursor-pointer ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FaCamera size={16} />
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading && (
        <p className="text-xs text-gray-400 mt-2 animate-pulse">
          Subiendo imagen...
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400 mt-2 animate-fadeIn">{error}</p>
      )}
    </div>
  );
}
