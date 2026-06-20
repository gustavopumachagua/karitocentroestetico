import { FaSignInAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AccessButton() {
  return (
    <Link
      to="/login"
      className="shimmer-btn group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-cyan-200/40 focus:ring-offset-2 focus:ring-offset-slate-950 md:text-base active:scale-[0.97]"
      style={{
        background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
        border: '1px solid rgba(34, 211, 238, 0.35)',
      }}
    >
      <FaSignInAlt className="text-base transition-transform duration-200 group-hover:translate-x-0.5" />
      Acceder
    </Link>
  );
}
