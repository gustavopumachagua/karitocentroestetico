import { FaEye } from "react-icons/fa";

/** Actions follow the persisted plan state, never a local save attempt. */
export default function NutritionPlanActions({
  isFinal,
  isComplete,
  busy,
  conflict,
  dirty,
  hasSavedPlan,
  showPreview,
  onPreview,
  onFinalize,
  primaryActionRef,
}) {
  if (isFinal) {
    return (
      <div className="nutrition-plan-actions">
        <button
          ref={primaryActionRef}
          type="button"
          className="ui-button ui-button-primary"
          onClick={onPreview}
          aria-expanded={showPreview}
          aria-controls="nutrition-final-preview"
        >
          <FaEye aria-hidden="true" />
          {showPreview ? "Ocultar vista previa" : "Vista previa"}
        </button>
      </div>
    );
  }

  return (
    <div className="ui-card nutrition-plan-actions">
      <button type="submit" className="ui-button ui-button-secondary" disabled={busy || conflict}>
        {busy ? "Guardando…" : "Guardar borrador"}
      </button>
      {isComplete && (
        <button ref={primaryActionRef} type="button" className="ui-button ui-button-primary" disabled={busy || conflict} onClick={onFinalize} aria-describedby="nutrition-finalize-help">
          Finalizar plan
        </button>
      )}
      <span className="ui-help self-center" role="status">
        {dirty ? "Cambios sin guardar" : hasSavedPlan ? "Todos los cambios están guardados" : "Aún no guardado"}
      </span>
      {isComplete && <p id="nutrition-finalize-help" className="ui-help w-full">Al finalizar, el plan quedará guardado y no se podrá editar.</p>}
    </div>
  );
}
