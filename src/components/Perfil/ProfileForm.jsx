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
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nombre del perfil
        </label>
        <div
          className={`flex items-center rounded-lg px-3 py-2 border transition ${
            error
              ? "bg-slate-950/50 border-rose-400"
              : "bg-slate-950/50 border-slate-700 focus-within:border-cyan-400/60"
          }`}
        >
          <FaUser
            className={`mr-3 ${error ? "text-rose-300" : "text-cyan-300/80"}`}
          />
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-600"
          />
        </div>
        {error && (
          <p className="text-sm text-rose-300 mt-2 animate-fadeIn">{error}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition active:scale-95 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className={`px-6 py-2 rounded-lg font-semibold shadow-md transition active:scale-95 ${
            !isFormValid || isSaving
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white cursor-pointer"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
