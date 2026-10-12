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
        <label htmlFor="profile-name" className="ui-label mb-2 block">
          Nombre del perfil
        </label>
        <div
          className={`flex min-h-12 min-w-0 items-center rounded-xl border bg-slate-950/40 px-3 py-2 transition-colors focus-within:ring-2 ${
            error
              ? "border-rose-400 focus-within:ring-rose-400/20"
              : "border-slate-700 focus-within:border-indigo-300 focus-within:ring-indigo-300/20"
          }`}
        >
          <FaUser
            className={`mr-3 shrink-0 ${error ? "text-rose-300" : "text-slate-400"}`}
            aria-hidden="true"
          />
          <input
            id="profile-name"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            aria-invalid={Boolean(error)}
            className="min-w-0 w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400"
          />
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>
        )}
      </div>

      <div className="flex flex-col justify-end gap-3 border-t border-slate-700 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="ui-button ui-button-secondary min-h-11"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isFormValid || isSaving}
          className={`ui-button min-h-11 px-6 ${
            !isFormValid || isSaving
              ? "ui-button-secondary cursor-not-allowed"
              : "ui-button-primary"
          }`}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
