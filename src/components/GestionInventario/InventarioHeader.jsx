import CustomSelect from "../common/CustomSelect";

export default function InventarioHeader({
  roles,
  rolSeleccionado,
  setRolSeleccionado,
}) {
  return (
    <div className="flex justify-end mb-8 items-center">
      <CustomSelect
        value={rolSeleccionado}
        onValueChange={setRolSeleccionado}
        placeholder="Seleccionar rol"
        className="w-full sm:w-56"
        options={roles.map((rol) => ({ value: rol, label: rol }))}
      />
    </div>
  );
}
