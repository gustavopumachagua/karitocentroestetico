import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

export default function ProfileForm({
  nombre,
  setNombre,
  onSave,
  onCancel,
  isSaving,
}) {
  const [error, setError] = useState("");

  const validateName = (value) => {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,30}$/;
    if (!value.trim()) return "El nombre no puede estar vacío.";
    if (!regex.test(value))
      return "Solo se permiten letras y espacios (2-30 caracteres).";
    return "";
  };

  useEffect(() => {
    setError(validateName(nombre));
  }, [nombre]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateName(nombre);
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(e);
  };

  const isFormValid = !error && nombre.trim().length > 0;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nombre del perfil
        </label>
        <div
          className={`flex items-center rounded-lg px-3 py-2 border transition ${
            error
              ? "bg-gray-800 border-red-500"
              : "bg-gray-800 border-gray-700 focus-within:border-indigo-500"
          }`}
        >
          <FaUser
            className={`mr-3 ${error ? "text-red-500" : "text-gray-400"}`}
          />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-500"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 mt-2 animate-fadeIn">{error}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition active:scale-95 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className={`px-6 py-2 rounded-lg font-semibold shadow-md transition active:scale-95 ${
            !isFormValid || isSaving
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
