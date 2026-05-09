import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";
import { FaSpa } from "react-icons/fa";

export default function Logo() {
  return (
    <div className="flex justify-center md:justify-start">
      <Link
        to="/"
        className="group flex items-center gap-3 rounded-lg px-1 py-1 transition focus:outline-none focus:ring-2 focus:ring-cyan-300"
        aria-label="Ir al inicio"
      >
        <img
          src={logo}
          alt="Karito Centro Estético"
          className="h-12 w-12 rounded-full border border-cyan-300/40 object-cover shadow-lg shadow-cyan-950/30 transition group-hover:border-cyan-200"
        />
        <div className="hidden leading-tight sm:block">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase text-cyan-200">
            <FaSpa className="text-cyan-300" />
            Karito
          </div>
          <p className="text-sm text-slate-400">Centro Estético</p>
        </div>
      </Link>
    </div>
  );
}
