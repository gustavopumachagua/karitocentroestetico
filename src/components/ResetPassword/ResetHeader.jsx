import { FaEnvelopeOpenText } from "react-icons/fa";

export default function ResetHeader() {
  return (
    <div className="mb-7 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300">
        <FaEnvelopeOpenText />
      </div>
      <p className="ui-eyebrow">
        Recuperar acceso
      </p>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        Reiniciar contraseña
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Ingresa el correo electrónico asociado a tu cuenta y te enviaremos las
        instrucciones para restablecer tu contraseña.
      </p>
    </div>
  );
}
