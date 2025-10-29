import { useState } from "react";

export function AccionButtons({ id, estado, actualizarEstado }) {
  const [seleccionado, setSeleccionado] = useState("");

  const handleChange = (e) => {
    const nuevoEstado = e.target.value;
    setSeleccionado(nuevoEstado);
    actualizarEstado(id, nuevoEstado);
  };

  const deshabilitado = estado !== "pendiente";

  return (
    <div>
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
      </select>
    </div>
  );
}
