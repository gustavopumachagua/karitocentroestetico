import logo from "../../assets/Logo.jpg";

export default function LoadingSpinner() {
  return (
    <div role="status" aria-label="Cargando aplicación" className="app-shell fixed inset-0 z-[var(--z-toast)] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-6">
        <div>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-lg overflow-hidden"
            style={{
              background: "var(--surface-default)",
              border: "1px solid var(--line-soft)",
            }}
          >
            <img
              src={logo}
              alt="Karito Centro Estético"
              className="h-14 w-14 rounded-md object-cover"
            />
          </div>

        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Karito Centro Estético
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Cargando aplicación...
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-48 h-[3px] rounded-full overflow-hidden"
          style={{ background: "var(--surface-raised)" }}
        >
          <div className="progress-bar-animated" />
        </div>
      </div>
    </div>
  );
}
