import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { formatearFechaCita } from "../../utils/citasFecha";
import {
  getProfessionalDisplayName,
  getProfessionalRole,
} from "../../utils/professionalDirectory";

export default function TablaPagos({
  citas,
  pagoPorCita,
  onSeleccionCita,
  onVerTicket,
  professionalNamesById,
}) {
  return (
    <div className="ui-panel w-full">
      <div className="ui-toolbar mb-5">
        <div>
          <h2 className="text-base font-semibold text-white">Citas por cobrar</h2>
          <p className="mt-1 text-sm text-slate-400">Selecciona una cita pendiente para registrar el pago o una pagada para ver su comprobante.</p>
        </div>
        <span className="ui-status">{citas.length} citas</span>
      </div>
      <div role="region" tabIndex={0} aria-label="Citas por cobrar: desplazamiento horizontal disponible" className="ui-table-wrap hidden md:block">
        <table aria-label="Citas por cobrar" className="ui-table min-w-[900px]">
          <thead>
            <tr>
              <th scope="col" className="p-3 text-left">Cliente</th>
              <th scope="col" className="p-3 text-left">Profesional</th>
              <th scope="col" className="p-3 text-left">Rol</th>
              <th scope="col" className="p-3 text-left min-w-[220px]">Servicios</th>
              <th scope="col" className="p-3 text-left">Método</th>
              <th scope="col" className="p-3 text-right">Monto</th>
              <th scope="col" className="p-3 text-left">Fecha</th>
              <th scope="col" className="p-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => {
              const pago = pagoPorCita(cita._id);
              const bloqueado = pago?.estadoPago === "pagado";
              const nombreProfesional = getProfessionalDisplayName(
                cita,
                professionalNamesById,
              );
              const rolProfesional = getProfessionalRole(cita);

              return (
                <tr
                  key={cita._id}
                className={`${
                    bloqueado
                      ? "cursor-pointer"
                      : "hover:bg-indigo-400/5 cursor-pointer"
                  } transition`}
                  onClick={() => {
                    if (bloqueado) onVerTicket(cita);
                    else onSeleccionCita(cita);
                  }}
                >
                  <td className="p-3 font-medium text-white">
                    {cita.cliente}
                  </td>
                  <td className="p-3 text-slate-300">
                    {nombreProfesional || "—"}
                  </td>
                  <td className="p-3 text-slate-300 capitalize">
                    {rolProfesional || "—"}
                  </td>
                  <td className="p-3 text-slate-300 min-w-[220px] max-w-[340px] whitespace-normal break-words leading-relaxed">
                    {pago
                      ? pago.servicios.map((s) => s.nombre).join(", ")
                      : "—"}
                  </td>
                  <td className="p-3 capitalize text-slate-300">
                    {pago ? pago.metodoPago : "—"}
                  </td>
                  <td className="p-3 text-right font-medium tabular-nums text-slate-100 whitespace-nowrap">
                    S/ {pago ? pago.total.toFixed(2) : "0.00"}
                  </td>
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {formatearFechaCita(cita.fecha)}
                  </td>
                  <td className="p-3">
                    {pago?.estadoPago === "pagado" ? (
                      <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                        <FaCheckCircle /> Pagado
                      </span>
                    ) : pago?.estadoPago === "cancelado" ? (
                      <span className="flex items-center gap-1 text-rose-300 font-semibold">
                        <FaTimesCircle /> Cancelado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-300 font-semibold">
                        <FaClock /> Pendiente
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {citas.map((cita) => {
          const pago = pagoPorCita(cita._id);
          const bloqueado = pago?.estadoPago === "pagado";
          const nombreProfesional = getProfessionalDisplayName(
            cita,
            professionalNamesById,
          );
          const rolProfesional = getProfessionalRole(cita);

          return (
            <div
              key={cita._id}
              className={`ui-card ui-card-interactive ${
                bloqueado
                  ? "cursor-pointer"
                  : "hover:bg-indigo-400/5 cursor-pointer"
              } transition`}
              onClick={() => {
                if (bloqueado) onVerTicket(cita);
                else onSeleccionCita(cita);
              }}
            >
              <div className="mb-2 flex min-w-0 flex-wrap items-start justify-between gap-2">
                <h3 className="min-w-0 text-sm font-semibold text-slate-100 break-words">
                  {cita.cliente}
                </h3>
                <span className="text-slate-400 text-xs">
                  {formatearFechaCita(cita.fecha)}
                </span>
              </div>

              <p className="text-slate-300 text-sm">
                <span className="font-medium text-indigo-300">
                  {nombreProfesional || "—"}
                </span>{" "}
                ({rolProfesional || "—"})
              </p>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed whitespace-normal break-words">
                {pago ? pago.servicios.map((s) => s.nombre).join(", ") : "—"}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold tabular-nums text-slate-100">
                  S/ {pago ? pago.total.toFixed(2) : "0.00"}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  {pago?.estadoPago === "pagado" ? (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <FaCheckCircle /> Pagado
                    </span>
                  ) : pago?.estadoPago === "cancelado" ? (
                    <span className="text-rose-300 flex items-center gap-1">
                      <FaTimesCircle /> Cancelado
                    </span>
                  ) : (
                    <span className="text-amber-300 flex items-center gap-1">
                      <FaClock /> Pendiente
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
