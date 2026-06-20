import InfoPaciente from "./InfoPaciente";
import ObservacionesImagenes from "./ObservacionesImagenes";
import ListaTratamientosAnteriores from "./ListaTratamientosAnteriores";
import { FaArrowLeft } from "react-icons/fa";

export default function DetallePaciente({
  paciente,
  tratamientos,
  onSeleccionar,
  onVolver,
}) {
  const tratamientosAnteriores = tratamientos
    .filter(
      (t) =>
        t.nombre?.toLowerCase() === paciente?.nombre?.toLowerCase() &&
        t.fecha !== paciente?.fecha,
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-300/80">
            Paciente seleccionado
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {paciente.nombre}
          </h3>
        </div>

        <button
          onClick={onVolver}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/15 cursor-pointer"
        >
          <FaArrowLeft /> Volver al listado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InfoPaciente paciente={paciente} />
        <ObservacionesImagenes paciente={paciente} />
      </div>

      <ListaTratamientosAnteriores
        tratamientos={tratamientosAnteriores}
        onSeleccionar={onSeleccionar}
      />
    </div>
  );
}
