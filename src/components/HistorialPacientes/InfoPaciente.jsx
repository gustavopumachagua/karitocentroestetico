import {
  FaUser,
  FaVenusMars,
  FaCalendarAlt,
  FaStethoscope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function InfoPaciente({ paciente }) {
  const formatearServicios = (servicio) => {
    if (!servicio) return "—";
    if (Array.isArray(servicio)) return servicio.join(", ");
    return String(servicio)
      .split(",")
      .map((s) => s.trim())
      .join(", ");
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Sin fecha";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="glass-card p-5 sm:p-6 w-full">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-700/50 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10">
          <FaUser className="text-cyan-300" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Información del Paciente
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
          <FaVenusMars className="mt-1 text-pink-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Sexo</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.sexo || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4">
          <FaPhoneAlt className="mt-1 text-blue-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Celular</p>
            <p className="text-white font-medium text-base break-words">
              {paciente.celular || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4 sm:col-span-2">
          <FaStethoscope className="mt-1 text-emerald-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Servicio</p>
            <p className="text-white font-medium text-base leading-relaxed break-words">
              {formatearServicios(paciente.servicio)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-950/25 p-4 sm:col-span-2">
          <FaCalendarAlt className="mt-1 text-amber-300 text-lg sm:text-xl" />
          <div className="min-w-0">
            <p className="text-slate-400 text-sm">Fecha</p>
            <p className="text-white font-medium text-base break-words">
              {formatearFecha(paciente.fecha)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
