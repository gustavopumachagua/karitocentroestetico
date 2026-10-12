import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiBell,
  FiCalendar,
  FiX,
} from "react-icons/fi";
import { useClinicalControlNotifications } from "../../hooks/useClinicalControlNotifications";
import { formatClinicalControlDate } from "../../services/clinicalControlNotifications.service";

/**
 * Reception notification centre for clinical follow-up controls. It is kept
 * in the Topbar so it remains reachable from every cosmiatra screen. These
 * are informative notices only: they never alter the appointments screen.
 */
export default function ClinicalControlNotifications({ targetPath }) {
  const popupId = useId();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, right: 16 });
  const { notifications, isLoading } = useClinicalControlNotifications({
    enabled: Boolean(targetPath),
  });

  const updatePopupPosition = useCallback(() => {
    const triggerRect = triggerRef.current?.getBoundingClientRect();
    if (!triggerRect) return;

    setPopupPosition({
      top: triggerRect.bottom + 12,
      right: Math.max(16, window.innerWidth - triggerRect.right),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePopupPosition();

    const handlePointerDown = (event) => {
      const clickedTrigger = containerRef.current?.contains(event.target);
      const clickedPopup = popupRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedPopup) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [isOpen, updatePopupPosition]);

  const notificationCount = notifications.length;
  const badgeLabel = notificationCount > 9 ? "9+" : notificationCount;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen) updatePopupPosition();
          setIsOpen((open) => !open);
        }}
        className="ui-icon-button relative h-11 w-11"
        aria-label={
          notificationCount
            ? `${notificationCount} controles próximos`
            : "Notificaciones de controles"
        }
        aria-controls={popupId}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <FiBell size={18} aria-hidden="true" />
        {notificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-slate-950 bg-indigo-300 px-1 text-[10px] font-bold leading-none text-slate-950">
            {badgeLabel}
          </span>
        )}
      </button>

      {isOpen &&
        createPortal(
          <section
            ref={popupRef}
            id={popupId}
            role="dialog"
            aria-label="Notificaciones de próximos controles"
            className="ui-notification-popup fixed flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30"
            style={{
              top: popupPosition.top,
              right: `clamp(1rem, ${popupPosition.right}px, max(1rem, calc(100vw - 24rem - 1rem)))`,
              zIndex: 2147483647,
              maxHeight: "calc(100dvh - 8rem)",
              background: "var(--bg-card)",
            }}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200">
                <FiBell aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white">Próximos controles</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {notificationCount
                    ? `${notificationCount} pendiente${notificationCount === 1 ? "" : "s"} de coordinar`
                    : "No hay controles pendientes"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ui-icon-button h-11 w-11 shrink-0"
              aria-label="Cerrar notificaciones"
            >
              <FiX size={17} />
            </button>
            </header>

            <div className="min-h-0 max-h-[min(26rem,calc(100dvh-11rem))] overflow-y-auto overscroll-contain p-2">
            {isLoading && notificationCount === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-400">
                Cargando controles…
              </p>
            ) : notificationCount === 0 ? (
              <div className="px-5 py-8 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400">
                  <FiCalendar aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-medium text-slate-200">
                  Agenda al día
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Los controles vencidos se retiran automáticamente de esta lista.
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <article className="flex w-full items-start gap-3 rounded-xl border border-slate-700/60 px-3 py-3 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-300/15 bg-indigo-400/10 text-indigo-200">
                        <FiCalendar aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-medium text-white">
                          {notification.patient?.nombre || "Paciente"}
                        </span>
                        <span className="mt-0.5 block break-words text-xs leading-relaxed text-slate-400">
                          {notification.servicio}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-amber-200">
                          Control: {formatClinicalControlDate(notification.fecha)}
                        </span>
                      </span>
                    </article>
                  </li>
                ))}
              </ul>
            )}
            </div>

            {notificationCount > 0 && (
              <footer className="shrink-0 border-t border-slate-700 px-4 py-2.5">
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Avisos informativos de controles pendientes de coordinar.
                </p>
              </footer>
            )}
          </section>,
          document.body,
        )}
    </div>
  );
}
