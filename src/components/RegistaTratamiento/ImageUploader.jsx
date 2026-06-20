import { FaTrash, FaUpload } from "react-icons/fa";

export default function ImageUploader({ imagenes, onUpload, onRemove }) {
  return (
    <div>
      <label className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/15 px-4 py-2.5 text-cyan-100 cursor-pointer transition hover:bg-cyan-500/25">
        <FaUpload /> Subir imágenes
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onUpload}
          className="hidden"
        />
      </label>

      <p className="mt-2 text-sm italic text-slate-400">
        {imagenes.length === 0
          ? "Sin archivos seleccionados"
          : `${imagenes.length} imagen${
              imagenes.length > 1 ? "es" : ""
            } seleccionada${imagenes.length > 1 ? "s" : ""}`}
      </p>

      {imagenes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
          {imagenes.map((img) => (
            <div
              key={img.id}
              className="relative group overflow-hidden rounded-lg border border-slate-700/70 shadow-lg"
            >
              <img
                src={img.url}
                alt="preview"
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-2 right-2 rounded-full border border-rose-300/20 bg-rose-500/85 p-2 text-white opacity-90 transition hover:opacity-100 cursor-pointer"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
