import { formatearFechaCita } from "../../utils/citasFecha";
import { getAttentionDate } from "../../utils/attentionHistory";

export default function InfoPaciente({ paciente }) {
  const formatearServicios = (servicio) => {
    if (!servicio) return "—";
    if (Array.isArray(servicio)) return servicio.join(", ");
    return String(servicio)
      .split(",")
      .map((s) => s.trim())
      .join(", ");
  };

  return (
    <div className="ui-card w-full p-5 sm:p-6">
      <div className="mb-5 border-b border-slate-700/50 pb-4">
        <h2 className="text-base font-semibold text-white">
          Información del Paciente
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="min-w-0">
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Sexo</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.sexo || "—"}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Celular</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.celular || "—"}
            </p>
          </div>
        </div>

        <div className="min-w-0 border-t border-slate-700/50 pt-4 sm:col-span-2">
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Servicio</p>
            <p className="text-white font-medium text-base leading-relaxed break-words">
              {formatearServicios(paciente.servicio)}
            </p>
          </div>
        </div>

        <div className="min-w-0 sm:col-span-2">
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Fecha</p>
            <p className="text-white font-medium text-base break-words">
              {getAttentionDate(paciente) ? formatearFechaCita(getAttentionDate(paciente)) : "Sin fecha"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
