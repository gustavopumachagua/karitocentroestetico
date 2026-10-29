import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import { obtenerPlanAlimentario, guardarPlanAlimentario } from "../../api/planesAlimentarios.api";
import { useAuth } from "../../hooks/useAuth";
import { getAuthSession } from "../../services/authStorage";
import NutritionPlanDocument from "../../components/PlanAlimentario/NutritionPlanDocument";
import NutritionPlanActions from "../../components/PlanAlimentario/NutritionPlanActions";
import NutritionPlanFinalizationModal from "../../components/PlanAlimentario/NutritionPlanFinalizationModal";
import {
  createNutritionDraft, isClinicalHistoryId, NUTRITION_DAYS, NUTRITION_INDICATORS,
  NUTRITION_MEALS, nutritionDocumentModel, nutritionPdfFilename, nutritionPlanPayload,
  validateNutritionDraft,
} from "../../utils/nutritionPlan";

const HISTORY_PATH = "/cosmiatra/historial-de-clientes";

function sameSession(expectedSession) {
  const current = getAuthSession();
  return current.token === expectedSession.token && String(current.user?.id || current.user?._id || "") === expectedSession.actorId;
}

function requestMessage(error) {
  const status = error?.response?.status;
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") return "El servidor tardó demasiado en responder. No se confirmó el guardado. Tus cambios siguen aquí; puedes intentarlo nuevamente.";
  if (status === 401) return "Tu sesión venció. Vuelve a iniciar sesión para continuar.";
  if (status === 403) return "No tienes permiso para acceder a este seguimiento.";
  if (status === 404) return "No se encontró un seguimiento disponible para esta historia clínica.";
  if (status === 409) return "El plan cambió en otra sesión o ya fue finalizado. Tus cambios siguen aquí; revisa la versión guardada antes de continuar.";
  if (status === 422 || status === 400) return "Revisa los datos del plan. No se guardaron los cambios; corrige los valores e inténtalo nuevamente.";
  return "No se pudo conectar con el servidor. Tus cambios siguen en esta pantalla; inténtalo nuevamente.";
}

function PlanEditor({ historiaId, expectedSession }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [seguimiento, setSeguimiento] = useState(null);
  const [plan, setPlan] = useState(null);
  const [draft, setDraft] = useState(() => createNutritionDraft());
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [conflict, setConflict] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [finalizationStage, setFinalizationStage] = useState(null);
  const [exporting, setExporting] = useState(false);
  const mounted = useRef(true);
  const saving = useRef(false);
  const pendingRequest = useRef(null);
  const previewRef = useRef(null);
  const primaryActionRef = useRef(null);
  const isFinal = plan?.estado === "finalizado";
  const dirty = !isFinal && seguimiento && JSON.stringify(draft) !== savedSnapshot;
  const pendingFields = useMemo(() => validateNutritionDraft(draft), [draft]);
  const isComplete = pendingFields.length === 0;
  const errors = useMemo(() => showValidation ? pendingFields : [], [pendingFields, showValidation]);
  const errorIds = useMemo(() => new Set(errors.map(({ id }) => id)), [errors]);
  const documentModel = useMemo(() => nutritionDocumentModel(seguimiento, draft, plan), [seguimiento, draft, plan]);
  const currentActor = () => mounted.current && sameSession(expectedSession);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    obtenerPlanAlimentario(historiaId, { signal: controller.signal, expectedSession }).then((result) => {
      if (!mounted.current || !sameSession(expectedSession) || controller.signal.aborted) return;
      const nextDraft = createNutritionDraft(result.seguimiento, result.plan);
      setSeguimiento(result.seguimiento);
      setPlan(result.plan || null);
      setDraft(nextDraft);
      setSavedSnapshot(JSON.stringify(nextDraft));
      setShowPreview(false);
    }).catch((failure) => {
      if (!controller.signal.aborted && mounted.current && sameSession(expectedSession)) setError(requestMessage(failure));
    }).finally(() => {
      if (!controller.signal.aborted && mounted.current && sameSession(expectedSession)) setLoading(false);
    });
    return () => { mounted.current = false; controller.abort(); pendingRequest.current?.abort(); };
  }, [expectedSession, historiaId]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Match the clinical form's short success acknowledgement, while staying
  // here so the user can explicitly open the completed plan's preview.
  useEffect(() => {
    if (finalizationStage !== "success") return undefined;
    const timeout = window.setTimeout(() => setFinalizationStage(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [finalizationStage]);

  const goBack = () => {
    if (busy) return;
    if (!dirty || window.confirm("Tienes cambios sin guardar. ¿Quieres salir y descartarlos?")) navigate(HISTORY_PATH, { state: { seguimientoId: historiaId } });
  };
  const jumpTo = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus({ preventScroll: true });
  };
  const updateIndicator = (key, value) => {
    const pattern = key === "edad" ? /^\d*$/u : /^\d*(?:[.,]\d*)?$/u;
    if (pattern.test(value)) setDraft((current) => ({ ...current, indicadores: { ...current.indicadores, [key]: value } }));
  };
  const updateMeal = (index, key, value) => setDraft((current) => ({ ...current, semana: current.semana.map((row, i) => i === index ? { ...row, [key]: value } : row) }));

  const save = async (estado) => {
    if (saving.current || isFinal || conflict || !currentActor()) return;
    if (estado === "finalizado") {
      setShowValidation(true);
      const missing = validateNutritionDraft(draft);
      if (missing.length) {
        setStatus("");
        setError(`Faltan ${missing.length} campos por completar o corregir. Usa la guía para ir directamente a cada uno.`);
        return;
      }
    }
    saving.current = true;
    setBusy(true);
    setError("");
    setStatus("");
    if (estado === "finalizado") setFinalizationStage("saving");
    const controller = new AbortController();
    pendingRequest.current = controller;
    try {
      if (estado === "finalizado") {
        const { validateNutritionPdfModel } = await import("../../utils/nutritionPlanPdf");
        await validateNutritionPdfModel(documentModel);
        if (!currentActor() || controller.signal.aborted) return;
      }
      const response = await guardarPlanAlimentario(historiaId, nutritionPlanPayload(draft, plan?.revision || 0, estado), { signal: controller.signal, expectedSession });
      if (!currentActor() || controller.signal.aborted) return;
      // Only a persisted server response can mark the editor as finalized.
      if (!response?.plan?.revision || !response?.seguimiento || response.plan.estado !== estado) throw new Error("Invalid plan response");
      const nextDraft = createNutritionDraft(response.seguimiento, response.plan);
      setSeguimiento(response.seguimiento);
      setPlan(response.plan);
      setDraft(nextDraft);
      setSavedSnapshot(JSON.stringify(nextDraft));
      setShowValidation(false);
      setStatus(estado === "finalizado" ? "Plan alimentario finalizado. Abre la vista previa para revisar y descargar el documento PDF." : "Borrador guardado. Puedes volver a este seguimiento y continuar el plan más adelante.");
      setShowPreview(false);
      if (estado === "finalizado") setFinalizationStage("success");
    } catch (failure) {
      if (currentActor() && !controller.signal.aborted) {
        // Errors belong to the editor, not a blocking acknowledgement. The
        // draft stays editable and the user can retry without reloading.
        if (estado === "finalizado") setFinalizationStage(null);
        setError(failure?.code === "NUTRITION_UNSUPPORTED_GLYPH" ? failure.message : requestMessage(failure));
        setConflict(failure?.response?.status === 409);
      }
    } finally {
      saving.current = false;
      if (currentActor()) setBusy(false);
    }
  };

  const reloadSaved = async () => {
    if (!currentActor() || saving.current || (dirty && !window.confirm("Se descartarán únicamente los cambios sin guardar de esta pantalla para cargar la versión del servidor. ¿Continuar?"))) return;
    saving.current = true;
    setBusy(true);
    const controller = new AbortController();
    pendingRequest.current = controller;
    try {
      const response = await obtenerPlanAlimentario(historiaId, { signal: controller.signal, expectedSession });
      if (!currentActor() || controller.signal.aborted) return;
      const nextDraft = createNutritionDraft(response.seguimiento, response.plan);
      setSeguimiento(response.seguimiento);
      setPlan(response.plan || null);
      setDraft(nextDraft);
      setSavedSnapshot(JSON.stringify(nextDraft));
      setConflict(false);
      setShowValidation(false);
      setError("");
      setStatus("Versión guardada cargada correctamente.");
      setShowPreview(false);
    } catch (failure) {
      if (currentActor() && !controller.signal.aborted) setError(requestMessage(failure));
    } finally {
      saving.current = false;
      if (currentActor()) setBusy(false);
    }
  };

  const download = async () => {
    if (!isFinal || !showPreview || exporting || !currentActor()) return;
    setExporting(true);
    setError("");
    try {
      const { createNutritionPlanPdf } = await import("../../utils/nutritionPlanPdf");
      if (!currentActor()) return;
      const pdf = await createNutritionPlanPdf(documentModel);
      if (!currentActor()) return;
      pdf.save(nutritionPdfFilename(documentModel.paciente));
    } catch (failure) {
      if (currentActor()) setError(failure?.code === "NUTRITION_UNSUPPORTED_GLYPH" ? failure.message : "No se pudo generar el PDF. El plan sigue guardado; puedes intentarlo nuevamente sin recargar.");
    } finally {
      if (currentActor()) setExporting(false);
    }
  };

  return (
    <section className="page-section ui-page nutrition-plan-page" aria-busy={loading || busy} aria-label="Plan alimentario del paciente">
      <header className="ui-page-header mb-0">
        <div><p className="ui-eyebrow">Seguimiento del paciente</p><h1 className="ui-title">Plan alimentario</h1><p className="ui-description">Edita las comidas de la semana, los indicadores y las indicaciones antes de finalizar.</p></div>
        <button type="button" className="ui-button ui-button-secondary" onClick={goBack} disabled={busy}><FaArrowLeft aria-hidden="true" /> Volver al historial</button>
      </header>
      {error && <div role="alert" className="nutrition-feedback nutrition-error"><p>{error}</p>{conflict && <button type="button" className="ui-button ui-button-secondary mt-3" disabled={busy} onClick={reloadSaved}>Cargar versión guardada</button>}</div>}
      {status && <p role="status" className="nutrition-feedback nutrition-status">{status}</p>}
      {loading ? <p role="status" className="ui-empty-state">Cargando seguimiento…</p> : !seguimiento ? <div className="ui-empty-state"><p>No se puede abrir este plan.</p><button type="button" className="ui-button ui-button-secondary" onClick={reloadSaved} disabled={busy}>Reintentar</button></div> : <>
        <section className="ui-card" aria-labelledby="nutrition-patient-title">
          <div className="ui-toolbar"><div><h2 id="nutrition-patient-title" className="text-lg font-semibold break-words">{seguimiento.paciente?.nombre || "Paciente"}</h2><p className="ui-help mt-1">Sexo: {seguimiento.paciente?.sexo || "No registrado"} · Datos vinculados al mismo paciente.</p></div><span className="ui-status">{isFinal ? "Plan finalizado" : plan ? "Borrador" : "Sin plan"}</span></div>
          <p className="ui-help mt-3">{isFinal ? "Este plan es de solo lectura. Puedes consultar el documento y descargarlo." : "Las comidas empiezan vacías. El contenido se completa de forma individual por el profesional; no se generan recomendaciones automáticas."}</p>
        </section>
        {showValidation && errors.length > 0 && <section className="ui-card" aria-labelledby="nutrition-pending-title"><h2 id="nutrition-pending-title" className="font-semibold">{errors.length} campos pendientes</h2><p className="ui-help">Selecciona un campo para completarlo sin recorrer todas las secciones.</p><div className="nutrition-pending-list">{errors.map(({ id, label }) => <button type="button" className="ui-button ui-button-ghost" key={id} onClick={() => jumpTo(id)}>{label}</button>)}</div></section>}
        {!isFinal && <form onSubmit={(event) => { event.preventDefault(); save("borrador"); }} className="grid gap-5" noValidate>
          <section className="ui-card" aria-labelledby="nutrition-indicators-title">
            <h2 id="nutrition-indicators-title" className="mb-5 text-base font-semibold">Indicadores del paciente</h2>
            <div className="nutrition-indicator-grid">{NUTRITION_INDICATORS.map(({ key, label }) => <label className="ui-field" key={key} htmlFor={`nutrition-${key}`}><span className="ui-label">{label}</span><input id={`nutrition-${key}`} className="ui-control" value={draft.indicadores[key]} onChange={(event) => updateIndicator(key, event.target.value)} inputMode={key === "edad" ? "numeric" : "decimal"} maxLength={key === "edad" ? 3 : 12} disabled={busy} aria-invalid={errorIds.has(`nutrition-${key}`)} aria-describedby={key === "edad" ? "nutrition-age-help" : undefined} /></label>)}</div>
            <p id="nutrition-age-help" className="ui-help mt-3">Edad: de 18 a 130 años. Peso, talla e IMC admiten decimales y deben ser mayores que cero.</p>
          </section>
          <section className="ui-card" aria-labelledby="nutrition-week-title"><h2 id="nutrition-week-title" className="mb-5 text-base font-semibold">Menú semanal</h2>
            {NUTRITION_DAYS.map((dia, index) => <fieldset key={dia} className="ui-clinical-group nutrition-day-card" disabled={busy}><legend>{dia}</legend><div className="nutrition-day-grid">{NUTRITION_MEALS.map(({ key, label }) => <label className="ui-field" key={key} htmlFor={`nutrition-${index}-${key}`}><span className="ui-label">{label}</span><textarea id={`nutrition-${index}-${key}`} className="ui-control ui-textarea" rows={4} maxLength={1500} value={draft.semana[index][key]} onChange={(event) => updateMeal(index, key, event.target.value)} aria-invalid={errorIds.has(`nutrition-${index}-${key}`)} placeholder="Escribe alimentos, porciones y preparación" /></label>)}</div></fieldset>)}
          </section>
          <section className="ui-card"><label className="ui-field" htmlFor="nutrition-indicaciones"><span className="ui-label text-base">Indicaciones</span><textarea id="nutrition-indicaciones" className="ui-control ui-textarea" rows={5} maxLength={4000} value={draft.indicaciones} disabled={busy} onChange={(event) => setDraft((current) => ({ ...current, indicaciones: event.target.value }))} aria-invalid={errorIds.has("nutrition-indicaciones")} placeholder="Escribe las indicaciones individualizadas del plan" /><span className="ui-help">{draft.indicaciones.length}/4000 caracteres</span></label></section>
          <NutritionPlanActions isFinal={false} isComplete={isComplete} busy={busy} conflict={conflict} dirty={dirty} hasSavedPlan={Boolean(plan)} onFinalize={() => save("finalizado")} primaryActionRef={primaryActionRef} />
        </form>}
        {isFinal && <NutritionPlanActions isFinal showPreview={showPreview} onPreview={() => setShowPreview((shown) => !shown)} primaryActionRef={primaryActionRef} />}
        {isFinal && showPreview && (
          <section id="nutrition-final-preview" ref={previewRef} aria-labelledby="nutrition-preview-title">
            <div className="ui-toolbar mb-4">
              <div>
                <h2 id="nutrition-preview-title" className="text-lg font-semibold mb-2">Plan alimentario finalizado</h2>
                <p className="ui-help">Vista previa preparada por la aplicación. El PDF mantiene los mismos datos y orden, con paginación automática para evitar cortes.</p>
              </div>
              <button type="button" className="ui-button ui-button-primary" onClick={download} disabled={exporting}>
                <FaDownload aria-hidden="true" />{exporting ? "Preparando PDF…" : "Descargar plan en PDF"}
              </button>
            </div>
            <div className="nutrition-document-shell"><NutritionPlanDocument model={documentModel} /></div>
          </section>
        )}
      </>}
      <NutritionPlanFinalizationModal
        stage={finalizationStage}
        returnFocusRef={primaryActionRef}
      />
    </section>
  );
}

export default function PlanAlimentario() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const actorId = String(user?.id || user?._id || "");
  const expectedSession = useMemo(() => ({ token, actorId }), [token, actorId]);
  const historiaId = new URLSearchParams(location.search).get("historia") || location.state?.historiaId || "";
  if (!isClinicalHistoryId(historiaId)) return <section className="page-section ui-page nutrition-plan-page" aria-label="Plan alimentario"><h1 className="ui-title">Plan alimentario</h1><div className="ui-empty-state"><p>Selecciona un seguimiento desde el historial de clientes para generar su plan.</p><button type="button" className="ui-button ui-button-secondary" onClick={() => navigate(HISTORY_PATH)}>Volver al historial</button></div></section>;
  return <PlanEditor key={`${expectedSession.actorId}:${token}:${historiaId}`} historiaId={historiaId} expectedSession={expectedSession} />;
}
