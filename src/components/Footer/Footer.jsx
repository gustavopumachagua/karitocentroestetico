import { FaSpa } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="px-4 py-6 text-slate-400 sm:px-6 sm:py-7 lg:px-12"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2.5">
        <div className="flex items-center gap-2 text-slate-400">
          <FaSpa className="text-indigo-300 text-sm" aria-hidden="true" />
          <span className="text-sm font-medium">Karito Centro Estético</span>
        </div>
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
