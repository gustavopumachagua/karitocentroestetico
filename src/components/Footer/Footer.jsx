export default function Footer() {
  return (
    <footer className="public-footer px-5 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2.5 sm:flex-row">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-medium">Karito Centro Estético</span>
        </div>
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
