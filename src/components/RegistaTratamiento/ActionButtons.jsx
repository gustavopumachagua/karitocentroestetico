export default function ActionButtons({
  onCancel,
  disabled,
  isSubmitting = false,
}) {
  const submitDisabled = disabled || isSubmitting;

  return (
    <div className="flex flex-col justify-end gap-3 border-t border-slate-700/60 pt-5 sm:flex-row">
      <button
        type="reset"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`ui-button ui-button-secondary w-full sm:w-auto ${
          isSubmitting
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-slate-700 cursor-pointer"
        }`}
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={submitDisabled}
        className={`ui-button w-full sm:w-auto ${
          submitDisabled
            ? "ui-button-secondary cursor-not-allowed"
            : "ui-button-primary"
        }`}
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
