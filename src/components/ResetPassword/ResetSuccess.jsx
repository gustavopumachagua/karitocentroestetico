import { Link, useLocation } from "react-router-dom";
import enviadoImage from "../../assets/mensaje_enviado.png";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

export default function ResetSuccess({ email: emailProp }) {
  const location = useLocation();
  const emailFromState = location.state?.email;
  const email = emailProp || emailFromState || "";

  return (
    <section className="auth-screen">
      <div className="auth-card text-center animate-fade-in">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400/12 text-emerald-300">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl font-bold text-white">Correo enviado</h2>
        <img
          src={enviadoImage}
          alt="Mensaje enviado"
          className="mx-auto my-6 h-auto w-32 max-w-full rounded-lg object-contain sm:w-40 md:w-48"
        />
        <p className="text-lg font-semibold text-gray-100">
          Se ha enviado el enlace para el reinicio
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-slate-400">
          Revisa la bandeja de entrada de{" "}
          <span className="font-medium text-cyan-200">{email}</span>
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] sm:w-auto"
        >
          Volver al login
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </section>
  );
}
