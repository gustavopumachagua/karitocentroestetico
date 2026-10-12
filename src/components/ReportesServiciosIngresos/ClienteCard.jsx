import { FaUserCircle, FaMale, FaFemale } from "react-icons/fa";

export default function ClienteCard({ cliente }) {
  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
        ? FaFemale
        : FaUserCircle;

  return (
    <div className="ui-card flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex justify-center sm:justify-start w-full sm:w-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10 sm:h-24 sm:w-24">
          <IconoUsuario className="text-indigo-300 text-5xl sm:text-6xl" />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h2 className="mb-2 text-xl font-semibold text-slate-100 break-words sm:text-2xl">
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
