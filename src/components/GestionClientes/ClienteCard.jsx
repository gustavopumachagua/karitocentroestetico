import {
  FaUser,
  FaMale,
  FaFemale,
  FaVenusMars,
  FaMoneyBillWave,
  FaPhoneAlt,
} from "react-icons/fa";

export default function ClienteCard({ cliente, onClick }) {
  // Icono según sexo
  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
      ? FaFemale
      : FaUser;

  return (
    <div
      onClick={onClick}
      className="ui-card ui-card-interactive group relative flex min-w-0 cursor-pointer flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        {/* Icono dinámico */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10"
        >
          <IconoUsuario className="text-indigo-400 text-2xl" />
        </div>

        <div className="min-w-0 flex-1">
          {/* Nombre */}
          <h4 className="text-base font-semibold leading-relaxed text-slate-100 break-words">
            {cliente.nombre}
          </h4>

          {/* Sexo */}
          <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm">
            <FaVenusMars className="text-slate-400/70 text-xs" /> {cliente.sexo}
          </p>

          {/* Celular */}
          {cliente.celular && (
            <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm">
              <FaPhoneAlt className="text-indigo-400/70 text-xs" /> {cliente.celular}
            </p>
          )}

          {/* Total invertido */}
          <p className="flex items-center gap-2 mt-1 text-sm">
            <FaMoneyBillWave className="text-emerald-400/70 text-xs" />
            <span className="font-semibold text-emerald-400">
              S/ {cliente.totalInvertido.toFixed(2)}
            </span>
          </p>

          {/* Tratamientos */}
          <p className="text-slate-400 mt-2 text-xs">
            {cliente.tratamientos.length} atenciones registradas
          </p>
        </div>
      </div>
    </div>
  );
}
