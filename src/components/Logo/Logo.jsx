import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { FaSpa } from "react-icons/fa";

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
          className="h-11 w-11 shrink-0 rounded-xl border border-slate-700 object-cover transition-colors group-hover:border-indigo-300/50"
        />
        <div className="hidden leading-tight sm:block">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-100">
            <FaSpa className="text-indigo-300" aria-hidden="true" />
            Karito
          </div>
          <p className="text-sm text-slate-400">Centro Estético</p>
        </div>
      </Link>
    </div>
  );
}
