import { FaUserCircle, FaMale, FaFemale } from "react-icons/fa";

export default function ClienteCard({ cliente }) {
  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
        ? FaFemale
        : FaUserCircle;

  return (
    <div className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
      <div className="flex justify-center sm:justify-start w-full sm:w-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 sm:h-24 sm:w-24">
          <IconoUsuario className="text-cyan-300 text-5xl sm:text-6xl" />
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          {cliente.nombre}
        </h2>

        <div className="space-y-1">
          {cliente.sexo && (
            <p className="text-slate-300 text-sm sm:text-base">
              <span className="font-medium text-slate-400">Sexo:</span>{" "}
              {cliente.sexo}
            </p>
          )}

          {cliente.celular && (
            <p className="text-slate-300 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1">
              <span className="font-medium text-slate-400">Celular:</span>{" "}
              {cliente.celular}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
