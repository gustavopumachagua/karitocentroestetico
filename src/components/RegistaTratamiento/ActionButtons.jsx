export default function ActionButtons({
  onCancel,
  disabled,
  isSubmitting = false,
}) {
  const submitDisabled = disabled || isSubmitting;

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
      <button
        type="reset"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`rounded-lg border border-slate-600 bg-slate-800/80 px-5 py-2.5 text-white transition ${
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
        className={`rounded-lg px-5 py-2.5 text-white transition ${
          submitDisabled
            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 cursor-pointer shadow-md shadow-cyan-950/30"
        }`}
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
