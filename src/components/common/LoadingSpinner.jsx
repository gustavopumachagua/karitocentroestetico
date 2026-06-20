import logo from "../../assets/Logo.jpg";

export default function LoadingSpinner() {
  return (
    <div className="app-shell fixed inset-0 z-50 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(139, 92, 246, 0.10))",
              border: "1px solid rgba(34, 211, 238, 0.15)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            <img
              src={logo}
              alt="Karito Centro Estético"
              className="h-20 w-20 rounded-xl object-cover"
            />
          </div>

          {/* Orbital ring */}
          <div
            className="absolute inset-[-10px] rounded-3xl"
            style={{
              border: "2px solid transparent",
              borderTopColor: "rgba(34, 211, 238, 0.4)",
              borderRightColor: "rgba(139, 92, 246, 0.2)",
              animation: "spin 1.5s linear infinite",
            }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-white/80 tracking-wide">
            Karito Centro Estético
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Cargando aplicación...
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="w-48 h-[3px] rounded-full overflow-hidden"
          style={{ background: "rgba(30, 41, 72, 0.7)" }}
        >
          <div className="progress-bar-animated" />
        </div>
      </div>
    </div>
  );
}
