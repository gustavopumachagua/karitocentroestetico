import { useCallback, useEffect, useId, useRef } from "react";
import Modal from "react-modal";
import { FaCheckCircle, FaClipboardCheck } from "react-icons/fa";

/** Presentation only: persistence and the success dismissal belong to the editor. */
export default function NutritionPlanFinalizationModal({
  stage,
  onDismiss,
  returnFocusRef,
}) {
  const id = useId();
  const headingRef = useRef(null);
  const open = stage === "saving" || stage === "success";
  const successful = stage === "success";
  const appElement = typeof document === "undefined" ? undefined : document.getElementById("root") || undefined;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  const focusContent = useCallback(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (open) focusContent();
  }, [focusContent, open, stage]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const afterClose = () => {
    const target = returnFocusRef?.current;
    if (target?.isConnected) target.focus({ preventScroll: true });
    onDismiss?.();
  };

  return (
    <Modal
      isOpen={open}
      appElement={appElement}
      ariaHideApp={Boolean(appElement)}
      aria={{ labelledby: titleId, describedby: descriptionId }}
      role="dialog"
      className="ui-modal max-w-md p-6 text-center"
      overlayClassName="ui-modal-backdrop"
      style={{ overlay: { zIndex: 10000 } }}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      shouldReturnFocusAfterClose
      preventScroll
      onAfterOpen={focusContent}
      onAfterClose={afterClose}
    >
      {open && <>
        {successful
          ? <FaCheckCircle className="mx-auto text-3xl text-emerald-300" aria-hidden="true" />
          : <FaClipboardCheck className="mx-auto text-3xl text-slate-300" aria-hidden="true" />}
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="mt-3 text-xl font-semibold text-white focus:outline-none">
          {successful ? "Plan alimentario finalizado" : "Finalizando plan alimentario…"}
        </h2>
        <p id={descriptionId} className="mt-3 text-sm leading-relaxed text-slate-300">
          {successful
            ? "El plan se guardó correctamente. Abre Vista previa para revisar el documento y descargarlo en PDF."
            : "Estamos verificando y guardando el plan. Espera un momento…"}
        </p>
        <p role="status" aria-live="polite" className="mt-2 text-xs text-slate-400">
          {successful ? "Este aviso se cerrará automáticamente." : "La vista previa estará disponible cuando termine el guardado."}
        </p>
      </>}
    </Modal>
  );
}
