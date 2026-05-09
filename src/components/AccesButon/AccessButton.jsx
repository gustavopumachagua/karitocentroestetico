import { FaSignInAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AccessButton() {
  return (
    <Link
      to="/login"
      className="group inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:ring-offset-2 focus:ring-offset-slate-950 md:text-base"
    >
      <FaSignInAlt className="text-base" />
      Acceder
    </Link>
  );
}
