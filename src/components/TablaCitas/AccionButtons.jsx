import { useState } from "react";

export function AccionButtons({
  id,
  cita,
  estado,
  actualizarEstado,
  onEditarCita,
}) {
  const [seleccionado, setSeleccionado] = useState("");

  const handleChange = (e) => {
    const accion = e.target.value;

    if (!accion) return;

    if (accion === "editar") {
      setSeleccionado("");
      onEditarCita?.(cita);
      return;
    }

    setSeleccionado(accion);
    actualizarEstado(id, accion);
  };

  const deshabilitado = estado !== "pendiente";

  return (
    <div
      className="flex flex-col xl:flex-row gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <select
        value={seleccionado || ""}
        onChange={handleChange}
        disabled={deshabilitado}
        className={`bg-gray-800 border border-gray-600 text-sm text-white rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          deshabilitado ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <option value="">Seleccionar</option>
        <option value="aplazado">Aplazado</option>
        <option value="cancelado">Cancelado</option>
        {onEditarCita && <option value="editar">Editar</option>}
      </select>
    </div>
  );
}
