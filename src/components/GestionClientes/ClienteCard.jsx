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
      className="cursor-pointer glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative group"
    >
      <div className="flex items-center gap-4">
        {/* Icono dinámico */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.12)' }}
        >
          <IconoUsuario className="text-indigo-400 text-2xl" />
        </div>

        <div>
          {/* Nombre */}
          <h4 className="text-base font-bold text-white flex items-center gap-2 tracking-tight">
            {cliente.nombre}
          </h4>

          {/* Sexo */}
          <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm">
            <FaVenusMars className="text-pink-400/70 text-xs" /> {cliente.sexo}
          </p>

          {/* Celular */}
          {cliente.celular && (
            <p className="text-slate-400 flex items-center gap-2 mt-1 text-sm">
              <FaPhoneAlt className="text-blue-400/70 text-xs" /> {cliente.celular}
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
          <p className="text-slate-500 mt-2 text-xs">
            {cliente.tratamientos.length} tratamientos realizados
          </p>
        </div>
      </div>
    </div>
  );
}
