import { useEffect, useRef, useState } from "react";
import {
  FaSignature,
  FaPen,
  FaCheck,
  FaTimes,
  FaCloudUploadAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { getAuthToken } from "../../services/authStorage";
import ProtectedImage from "../common/ProtectedImage";
import { resolveProtectedImageSource } from "../../api/media.api";

export default function FirmaDigitalField({
  firmaDigital,
  onSave,
  onCancel,
  isSaving,
  userId,
}) {
  const [editing, setEditing] = useState(!firmaDigital);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [keepExisting, setKeepExisting] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const protectedSignature = resolveProtectedImageSource(firmaDigital, { kind: "signatures", userId });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setKeepExisting(false);
  };

  const handleAccept = async () => {
    if (keepExisting && firmaDigital) {
      setEditing(false);
      return;
    }
    if (!selectedFile) return;
    setUploading(true);

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload/firma`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Error al subir firma");

      await onSave(data.url);
      setEditing(false);
      clearSelectedFile();
      setKeepExisting(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (firmaDigital) {
      setEditing(false);
      setKeepExisting(true);
    }
    clearSelectedFile();
    setError("");
    onCancel();
  };

  const handleEdit = () => {
    setEditing(true);
    setKeepExisting(true);
    clearSelectedFile();
    setError("");
  };

  const handleRemoveExisting = () => {
    // This only changes the local editor state. The saved signature remains
    // intact until a replacement is uploaded and the user accepts it.
    setKeepExisting(false);
    clearSelectedFile();
  };

  const handleRemovePreview = () => {
    clearSelectedFile();
    if (firmaDigital) {
      setKeepExisting(true);
    }
  };

  /* ─── Saved view (not editing) ─── */
  if (!editing && firmaDigital) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">
          Firma Digital
        </label>
        <div className="rounded-lg bg-slate-950/50 border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaSignature className="text-cyan-300/80" />
              <span className="text-slate-300 text-sm font-medium">
                Firma registrada
              </span>
            </div>
            <button
              type="button"
              onClick={handleEdit}
              className="p-1.5 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 transition active:scale-95 cursor-pointer"
              title="Modificar firma digital"
            >
              <FaPen size={12} />
            </button>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-white/5 p-3 flex items-center justify-center">
            <ProtectedImage
              src={protectedSignature}
              alt="Firma digital"
              className="max-h-24 object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Editing view ─── */
  const showExistingImage = editing && keepExisting && firmaDigital && !previewUrl;
  const showNewPreview = previewUrl && !keepExisting;
  const showUploadZone = !showExistingImage && !showNewPreview;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        Firma Digital
      </label>

      <div className="rounded-lg bg-slate-950/50 border border-slate-700 p-4 space-y-3">
        {/* Show existing image with delete option */}
        {showExistingImage && (
          <div className="relative rounded-lg border border-slate-700/60 bg-white/5 p-3">
            <ProtectedImage
              src={protectedSignature}
              alt="Firma digital actual"
              className="max-h-28 mx-auto object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveExisting}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition active:scale-95 cursor-pointer"
              title="Reemplazar firma"
              aria-label="Reemplazar firma"
            >
              <FaTrashAlt size={10} />
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Retira esta vista para seleccionar una nueva firma. La firma
              actual se conserva hasta que aceptes el reemplazo.
            </p>
          </div>
        )}

        {/* Show new preview */}
        {showNewPreview && (
          <div className="relative rounded-lg border border-slate-700/60 bg-white/5 p-3">
            <img
              src={previewUrl}
              alt="Vista previa de firma"
              className="max-h-28 mx-auto object-contain"
            />
            <button
              type="button"
              onClick={handleRemovePreview}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition active:scale-95 cursor-pointer"
              title="Eliminar imagen"
              aria-label="Quitar vista previa de firma"
            >
              <FaTrashAlt size={10} />
            </button>
          </div>
        )}

        {/* Upload zone */}
        {showUploadZone && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-lg border-2 border-dashed border-slate-600 hover:border-cyan-400/40 bg-slate-900/30 hover:bg-slate-900/50 p-6 flex flex-col items-center gap-2 transition cursor-pointer group"
          >
            <FaCloudUploadAlt className="text-3xl text-slate-500 group-hover:text-cyan-300/80 transition" />
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition">
              Haz clic para subir tu firma digital
            </span>
            <span className="text-xs text-slate-600">
              JPG, PNG o WEBP • Máx. 2 MB
            </span>
          </button>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {error && (
          <p className="text-sm text-rose-300 animate-fadeIn">{error}</p>
        )}

        {uploading && (
          <p className="text-xs text-slate-400 animate-pulse text-center">
            Subiendo firma digital...
          </p>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition active:scale-95 cursor-pointer text-sm"
          >
            <FaTimes className="inline mr-1.5" size={12} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={(!selectedFile && !keepExisting) || uploading || isSaving}
            className={`px-4 py-2 rounded-lg font-semibold shadow-md transition active:scale-95 text-sm ${
              (!selectedFile && !keepExisting) || uploading || isSaving
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white cursor-pointer"
            }`}
          >
            <FaCheck className="inline mr-1.5" size={12} />
            {uploading ? "Subiendo..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}
