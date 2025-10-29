import { useLocation } from "react-router-dom";
import enviadoImage from "../../assets/mensaje_enviado.png";

export default function ResetSuccess({ email: emailProp }) {
  const location = useLocation();
  const emailFromState = location.state?.email;
  const email = emailProp || emailFromState || "";

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700 text-center animate-fadeIn">
        <h2 className="text-2xl font-bold text-indigo-400">¡Muchas gracias!</h2>
        <img
          src={enviadoImage}
          alt="Mensaje enviado"
          className="mx-auto w-32 sm:w-40 md:w-48 lg:w-56 max-w-full h-auto rounded-2xl shadow-2xl object-contain"
        />
        <p className="text-lg font-semibold text-gray-100">
          Se ha enviado el enlace para el reinicio
        </p>
        <p className="text-sm text-gray-400">
          Revisa la bandeja de entrada de{" "}
          <span className="font-medium text-indigo-400">{email}</span>
        </p>
      </div>
    </div>
  );
}
