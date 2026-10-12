import { FaTrash, FaUpload } from "react-icons/fa";

export default function ImageUploader({ imagenes, onUpload, onRemove }) {
  return (
    <div>
      <label className="ui-button ui-button-secondary relative w-full cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-300 sm:w-auto">
        <FaUpload /> Subir imágenes
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onUpload}
          aria-label="Subir imágenes del tratamiento"
          className="sr-only"
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
                aria-label="Eliminar imagen seleccionada"
                className="ui-icon-button absolute top-2 right-2 border-rose-300/30 bg-slate-950/90 text-rose-200 transition hover:border-rose-300/60 hover:text-rose-100"
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
