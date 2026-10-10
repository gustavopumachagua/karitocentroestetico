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
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
        style={{ borderColor: "rgba(148, 163, 184, 0.16)" }}
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
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-slate-950 bg-amber-400 px-1 text-[10px] font-extrabold leading-none text-slate-950 shadow-lg shadow-amber-400/20">
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
            className="fixed w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl sm:w-96"
            style={{
              top: popupPosition.top,
              right: popupPosition.right,
              zIndex: 2147483647,
            }}
          >
            <header className="flex items-start justify-between gap-3 border-b border-slate-700/70 bg-slate-900/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
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
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              aria-label="Cerrar notificaciones"
            >
              <FiX size={17} />
            </button>
            </header>

            <div className="max-h-[min(26rem,calc(100vh-11rem))] overflow-y-auto p-2">
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
                    <article className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
                        <FiCalendar aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {notification.patient?.nombre || "Paciente"}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
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
              <footer className="border-t border-slate-700/70 bg-slate-900/60 px-4 py-2.5">
                <p className="text-[11px] text-slate-500">
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
