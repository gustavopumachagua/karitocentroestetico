import { Link, useLocation } from "react-router-dom";
import enviadoImage from "../../assets/mensaje_enviado.png";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";

export default function ResetSuccess({ email: emailProp }) {
  const location = useLocation();
  const emailFromState = location.state?.email;
  const email = emailProp || emailFromState || "";

  return (
    <section className="auth-screen">
      <div className="auth-card min-w-0 text-center">
        <div className="mx-auto mb-4 flex h-8 w-8 items-center justify-center text-emerald-300">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Correo enviado</h2>
        <img
          src={enviadoImage}
          alt="Mensaje enviado"
          className="mx-auto my-6 h-auto w-24 max-w-full rounded-lg object-contain"
        />
        <p className="text-base font-medium text-slate-100">
          Se ha enviado el enlace para el reinicio
        </p>
        <p className="mt-2 break-words text-sm leading-6 text-slate-400">
          Revisa la bandeja de entrada de{" "}
          <span className="font-medium text-indigo-300">{email}</span>
        </p>
        <Link
          to="/login"
          className="ui-button ui-button-secondary mt-6 w-full sm:w-auto"
        >
          Volver al login
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </section>
  );
}
