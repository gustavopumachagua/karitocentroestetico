export default function LoadingSpinner() {
  return (
    <div className="app-shell fixed inset-0 z-50 flex items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent"></div>
        <p className="mt-4 text-sm text-slate-300 animate-pulse">
          Cargando aplicación...
        </p>
      </div>
    </div>
  );
}
