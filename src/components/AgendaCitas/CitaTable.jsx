import { useState, useMemo } from "react";
import { CitaRow } from "../TablaCitas/CitaRow";
import { CitaCard } from "../TablaCitas/CitaCard";
import Paginacion from "../HistorialPacientes/Paginacion";
import { obtenerTimestampCita } from "../../utils/citasFecha";

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
      <div className="page-panel hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-white/[0.06] text-white">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Profesional</th>
              <th className="p-3">Servicio</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
              {showAcciones && (
                <th className="p-3">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
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
          <p className="text-gray-400 text-lg">No hay citas registradas</p>
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
