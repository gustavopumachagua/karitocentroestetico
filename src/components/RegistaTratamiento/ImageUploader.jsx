import { FaTrash, FaUpload } from "react-icons/fa";

export default function ImageUploader({ imagenes, onUpload, onRemove }) {
  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition">
        <FaUpload /> Subir imágenes
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onUpload}
          className="hidden"
        />
      </label>

      <p className="mt-2 text-sm italic text-gray-400">
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
              className="relative group border border-gray-600 rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={img.url}
                alt="preview"
                className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full
                           opacity-80 hover:opacity-100 transition "
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
