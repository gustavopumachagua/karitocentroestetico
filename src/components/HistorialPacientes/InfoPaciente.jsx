import {
  FaUser,
  FaVenusMars,
  FaCalendarAlt,
  FaStethoscope,
  FaPhoneAlt,
} from "react-icons/fa";
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
      <div className="mb-5 flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10">
          <FaUser className="text-indigo-300" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Información del Paciente
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
          <FaVenusMars className="mt-1 text-slate-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Sexo</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.sexo || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
          <FaPhoneAlt className="mt-1 text-indigo-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Celular</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.celular || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4 sm:col-span-2">
          <FaStethoscope className="mt-1 shrink-0 text-indigo-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Servicio</p>
            <p className="text-white font-medium text-base leading-relaxed break-words">
              {formatearServicios(paciente.servicio)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4 sm:col-span-2">
          <FaCalendarAlt className="mt-1 shrink-0 text-indigo-300 text-lg sm:text-xl" />
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
