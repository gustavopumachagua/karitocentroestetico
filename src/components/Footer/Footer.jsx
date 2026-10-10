import { FaSpa } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative px-4 py-7 text-slate-500 sm:px-6 sm:py-8 lg:px-12 xl:px-20"
      style={{
        background: 'rgba(5, 10, 24, 0.94)',
        borderTop: '1px solid rgba(148, 163, 184, 0.09)',
      }}
    >
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), rgba(139, 92, 246, 0.06), transparent)',
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2.5">
        <div className="flex items-center gap-2 text-slate-400">
          <FaSpa className="text-cyan-400/50 text-sm" />
          <span className="text-sm font-medium">Karito Centro Estético</span>
        </div>
        <p className="text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
