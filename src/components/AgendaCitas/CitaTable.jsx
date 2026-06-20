import { useState, useMemo } from "react";
import { CitaRow } from "../TablaCitas/CitaRow";
import { CitaCard } from "../TablaCitas/CitaCard";
import Paginacion from "../HistorialPacientes/Paginacion";
import { obtenerTimestampCita } from "../../utils/citasFecha";
import { FaCalendarCheck } from "react-icons/fa";

export default function CitaTable({
  citas,
  actualizarEstado,
  onEditarCita,
  showAcciones = true,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const citasOrdenadas = useMemo(() => {
    return [...(citas || [])].sort(
      (a, b) => obtenerTimestampCita(b.fecha) - obtenerTimestampCita(a.fecha)
    );
  }, [citas]);

  const totalPaginas = Math.ceil(citasOrdenadas.length / registrosPorPagina);
  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const citasPaginadas = citasOrdenadas.slice(
    indiceInicio,
    indiceInicio + registrosPorPagina
  );

  const cambiarPagina = (num) => setPaginaActual(num);

  return (
    <>
      <div className="page-panel page-panel-pad hidden lg:block">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10">
              <FaCalendarCheck className="text-violet-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Citas registradas
            </h3>
          </div>
          <span className="w-fit rounded-lg border border-slate-700/70 bg-slate-950/30 px-3 py-1 text-sm font-medium text-slate-300">
            {citasOrdenadas.length} citas
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-700/70">
          <table className="w-full min-w-[920px] text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="p-3">Cliente</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Profesional</th>
                <th className="p-3">Servicio</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                {showAcciones && <th className="p-3">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/70">
              {citasPaginadas.map((cita) => (
                <CitaRow
                  key={cita._id || cita.id}
                  cita={cita}
                  actualizarEstado={actualizarEstado}
                  onEditarCita={onEditarCita}
                  showAcciones={showAcciones}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-4">
        {citasPaginadas.map((cita) => (
          <CitaCard
            key={cita._id || cita.id}
            cita={cita}
            actualizarEstado={actualizarEstado}
            onEditarCita={onEditarCita}
            showAcciones={showAcciones}
          />
        ))}
      </div>

      {citasOrdenadas.length === 0 && (
        <div className="page-panel py-12 text-center">
          <p className="text-slate-400 text-lg">No hay citas registradas</p>
        </div>
      )}
      {totalPaginas > 1 && (
        <div className="flex justify-center">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            cambiarPagina={cambiarPagina}
          />
        </div>
      )}
    </>
  );
}
