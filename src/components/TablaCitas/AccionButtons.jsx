import { useState } from "react";
import CustomSelect from "../common/CustomSelect";

export function AccionButtons({
  id,
  cita,
  estado,
  actualizarEstado,
  onEditarCita,
}) {
  const [seleccionado, setSeleccionado] = useState("");

  const handleChange = (accion) => {
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
      <CustomSelect
        value={seleccionado || ""}
        onValueChange={handleChange}
        disabled={deshabilitado}
        size="sm"
        className="min-w-36"
        placeholder="Seleccionar"
        options={[
          { value: "", label: "Seleccionar" },
          { value: "aplazado", label: "Aplazado" },
          { value: "cancelado", label: "Cancelado" },
          ...(onEditarCita ? [{ value: "editar", label: "Editar" }] : []),
        ]}
      />
    </div>
  );
}
