import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";

export default function Logo() {
  return (
    <div className="flex justify-center md:justify-start">
      <Link
        to="/"
        className="group flex min-h-11 items-center gap-3 rounded-lg px-1 py-1 transition-colors"
        aria-label="Ir al inicio"
      >
        <img
          src={logo}
          alt="Karito Centro Estético"
          className="h-10 w-10 shrink-0 rounded-lg border border-slate-700 object-cover transition-colors group-hover:border-slate-500"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-slate-100">
            Karito
          </div>
          <p className="mt-0.5 text-xs text-slate-400">Centro Estético</p>
        </div>
      </Link>
    </div>
  );
}
