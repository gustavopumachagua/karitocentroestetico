import InfoPaciente from "./InfoPaciente";
import ObservacionesImagenes from "./ObservacionesImagenes";
import ListaTratamientosAnteriores from "./ListaTratamientosAnteriores";

export default function DetallePaciente({
  paciente,
  tratamientos,
  onSeleccionar,
  onVolver,
}) {
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

  const formatearServicios = (servicio) =>
    Array.isArray(servicio) ? servicio.join(", ") : servicio;

  const tratamientosAnteriores = tratamientos
    .filter(
      (t) =>
        t.nombre?.toLowerCase() === paciente?.nombre?.toLowerCase() &&
        t.fecha !== paciente?.fecha
    )
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="space-y-10 animate-fadeIn">
      <h3 className="text-2xl font-semibold text-indigo-400 text-center md:text-left border-b border-gray-700 pb-4">
        {paciente.nombre}
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InfoPaciente paciente={paciente} />
        <ObservacionesImagenes paciente={paciente} />
      </div>

      <ListaTratamientosAnteriores
        tratamientos={tratamientosAnteriores}
        onSeleccionar={onSeleccionar}
      />

      <button
        onClick={onVolver}
        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-white cursor-pointer"
      >
        ← Volver al listado
      </button>
    </div>
  );
}
