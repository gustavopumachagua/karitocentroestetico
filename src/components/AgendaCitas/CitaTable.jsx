import { useState, useMemo } from "react";
import { CitaRow } from "../TablaCitas/CitaRow";
import { CitaCard } from "../TablaCitas/CitaCard";
import Paginacion from "../HistorialPacientes/Paginacion";

export default function CitaTable({
  citas,
  actualizarEstado,
  showAcciones = true,
}) {
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const citasOrdenadas = useMemo(() => {
    return [...(citas || [])].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
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
      <div className="hidden lg:block overflow-x-auto rounded-xl shadow-lg">
        <table className="w-full text-left border border-gray-700 bg-gray-900 rounded-xl overflow-hidden">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-3 border border-gray-600">Cliente</th>
              <th className="p-3 border border-gray-600">Rol</th>
              <th className="p-3 border border-gray-600">Profesional</th>
              <th className="p-3 border border-gray-600">Servicio</th>
              <th className="p-3 border border-gray-600">Fecha</th>
              <th className="p-3 border border-gray-600">Estado</th>
              {showAcciones && (
                <th className="p-3 border border-gray-600">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {citasPaginadas.map((cita) => (
              <CitaRow
                key={cita._id || cita.id}
                cita={cita}
                actualizarEstado={actualizarEstado}
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
            showAcciones={showAcciones}
          />
        ))}
      </div>

      {citasOrdenadas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No hay citas registradas</p>
        </div>
      )}
      {totalPaginas > 1 && (
        <div className="flex justify-center">
          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            cambiarPagina={setPaginaActual}
          />
        </div>
      )}
    </>
  );
}
