import { FaUserCircle, FaMale, FaFemale } from "react-icons/fa";

export default function ClienteCard({ cliente }) {
  const IconoUsuario =
    cliente.sexo?.toLowerCase() === "masculino"
      ? FaMale
      : cliente.sexo?.toLowerCase() === "femenino"
        ? FaFemale
        : FaUserCircle;

  return (
    <div className="ui-card flex items-start gap-4">
      <div className="shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/60 bg-[var(--surface-raised)]">
          <IconoUsuario className="text-slate-300 text-lg" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="mb-2 text-lg font-semibold text-slate-100 break-words">
          {cliente.nombre}
        </h2>

        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {cliente.sexo && (
            <p className="text-slate-300 text-sm">
              <span className="font-medium text-slate-400">Sexo:</span>{" "}
              {cliente.sexo}
            </p>
          )}

          {cliente.celular && (
            <p className="text-slate-300 text-sm flex items-center gap-1">
              <span className="font-medium text-slate-400">Celular:</span>{" "}
              {cliente.celular}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
