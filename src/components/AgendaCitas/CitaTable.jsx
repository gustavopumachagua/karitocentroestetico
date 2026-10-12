import { useMemo, useState } from "react";
import { CitaRow } from "../TablaCitas/CitaRow";
import { CitaCard } from "../TablaCitas/CitaCard";
import Paginacion from "../HistorialPacientes/Paginacion";
import { obtenerTimestampCita } from "../../utils/citasFecha";
import { FaCalendarCheck } from "react-icons/fa";
import { useProfessionalDirectory } from "../../hooks/useProfessionalDirectory";

export default function CitaTable({
  citas,
  actualizarEstado,
  onEditarCita,
  showAcciones = true,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const { professionalNamesById } = useProfessionalDirectory();
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
      <div className="ui-panel hidden lg:block">
        <div className="ui-toolbar mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10">
              <FaCalendarCheck className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Citas registradas
            </h3>
          </div>
          <span className="ui-status">
            {citasOrdenadas.length} citas
          </span>
        </div>

        <div role="region" tabIndex={0} aria-label="Citas registradas: desplazamiento horizontal disponible" className="ui-table-wrap">
          <table aria-label="Citas registradas" className="ui-table min-w-[920px]">
            <thead>
              <tr>
                <th scope="col" className="p-3">Cliente</th>
                <th scope="col" className="p-3">Rol</th>
                <th scope="col" className="p-3">Profesional</th>
                <th scope="col" className="p-3">Servicio</th>
                <th scope="col" className="p-3">Fecha</th>
                <th scope="col" className="p-3">Estado</th>
                {showAcciones && <th scope="col" className="p-3">Acciones</th>}
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
                  professionalNamesById={professionalNamesById}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3">
        {citasPaginadas.map((cita) => (
          <CitaCard
            key={cita._id || cita.id}
            cita={cita}
            actualizarEstado={actualizarEstado}
            onEditarCita={onEditarCita}
            showAcciones={showAcciones}
            professionalNamesById={professionalNamesById}
          />
        ))}
      </div>

      {citasOrdenadas.length === 0 && (
        <div className="ui-empty-state">
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
