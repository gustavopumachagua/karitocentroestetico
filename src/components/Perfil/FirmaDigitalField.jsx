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
        <div className="min-w-0 rounded-xl border border-slate-700 bg-slate-950/40 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <FaSignature className="shrink-0 text-indigo-300" aria-hidden="true" />
              <span className="text-slate-300 text-sm font-medium">
                Firma registrada
              </span>
            </div>
            <button
              type="button"
              onClick={handleEdit}
              className="ui-icon-button h-11 w-11 shrink-0"
              title="Modificar firma digital"
              aria-label="Modificar firma digital"
            >
              <FaPen size={12} />
            </button>
          </div>
          <div className="flex min-h-28 items-center justify-center rounded-xl border border-slate-300 bg-white p-4">
            <ProtectedImage
              src={protectedSignature}
              alt="Firma digital"
              className="max-h-24 max-w-full object-contain"
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

      <div className="min-w-0 space-y-4 rounded-xl border border-slate-700 bg-slate-950/40 p-3 sm:p-4">
        {/* Show existing image with delete option */}
        {showExistingImage && (
          <div className="relative rounded-xl border border-slate-300 bg-white px-4 pb-4 pt-14">
            <ProtectedImage
              src={protectedSignature}
              alt="Firma digital actual"
              className="mx-auto max-h-28 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveExisting}
              className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100"
              title="Reemplazar firma"
              aria-label="Reemplazar firma"
            >
              <FaTrashAlt size={14} />
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-600">
              Retira esta vista para seleccionar una nueva firma. La firma
              actual se conserva hasta que aceptes el reemplazo.
            </p>
          </div>
        )}

        {/* Show new preview */}
        {showNewPreview && (
          <div className="relative rounded-xl border border-slate-300 bg-white px-4 pb-4 pt-14">
            <img
              src={previewUrl}
              alt="Vista previa de firma"
              className="mx-auto max-h-28 max-w-full object-contain"
            />
            <button
              type="button"
              onClick={handleRemovePreview}
              className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100"
              title="Eliminar imagen"
              aria-label="Quitar vista previa de firma"
            >
              <FaTrashAlt size={14} />
            </button>
          </div>
        )}

        {/* Upload zone */}
        {showUploadZone && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-600 bg-slate-900/40 p-5 text-center transition-colors hover:border-indigo-300/60 hover:bg-indigo-400/5"
          >
            <FaCloudUploadAlt className="text-3xl text-slate-400 transition-colors group-hover:text-indigo-300" aria-hidden="true" />
            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition">
              Haz clic para subir tu firma digital
            </span>
            <span className="text-xs text-slate-400">
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
          <p role="alert" className="text-sm text-rose-300">{error}</p>
        )}

        {uploading && (
          <p className="text-xs text-slate-400 animate-pulse text-center">
            Subiendo firma digital...
          </p>
        )}

        <div className="flex flex-col justify-end gap-3 pt-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCancel}
            disabled={uploading}
            className="ui-button ui-button-secondary min-h-11"
          >
            <FaTimes className="inline mr-1.5" size={12} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={(!selectedFile && !keepExisting) || uploading || isSaving}
            className={`ui-button min-h-11 ${
              (!selectedFile && !keepExisting) || uploading || isSaving
                ? "ui-button-secondary cursor-not-allowed"
                : "ui-button-primary"
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
